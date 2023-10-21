import React, { useState, useRef, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import fetchGTFS from "./fetchGTFS";
import findIntersectedRoads from "./findIntersectedRoads";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import MapBoxContainer from "../MapBoxContainer";
import { Vehicle } from "../../data/interfaces/Vehicle";
import * as turf from "@turf/turf";
import { Route } from "../../data/interfaces/Route";

interface MarkerRoute { 
  marker: mapboxgl.Marker,
  route: Route
}

const PublicTransportWidget = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [routesData, setRoutesData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [stopsData, setStopsData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

  const RBush = require("rbush");
  var routeTree = useRef(new RBush());
  var vehicleMarkers = useRef(new Map<number, MarkerRoute>())

  // Fetch routes and stops data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedRoutesData = await fetchGTFS(
          "gtfs_shapes_agency_vehicle_type_number_stops_info_corrected"
        );
        setRoutesData(fetchedRoutesData);
        console.log("Fetched routes data!");
      } catch (error) {
        console.error("Error fetching routes data:", error);
      }
      try {
        const fetchedStopsData = await fetchGTFS("gtfs_stop_shape_ids_geom");
        setStopsData(fetchedStopsData);
        console.log("Fetched stops data!");
      } catch (error) {
        console.error("Error fetching stops data:", error);
      }
    };
    fetchData();
  }, []);

  // Display routes and stops on the map
  useEffect(() => {
    if (routesData && stopsData) {
      const addSourcesAndLayers = () => {
        if (!map) return;
        map.addSource("routesSource", {
          type: "geojson",
          data: routesData as GeoJSON.FeatureCollection,
        });
        map.addLayer({
          id: "routesLayer",
          type: "line",
          source: "routesSource",
          layout: {},
          paint: {
            "line-color": "#4ea0b4",
            "line-width": 3,
            "line-opacity": 1,
          },
        });
        console.log("Routes layer added!");

        map.addSource("stopsSource", {
          type: "geojson",
          data: stopsData as GeoJSON.FeatureCollection,
        });
        map.addLayer({
          id: "stopsLayer",
          type: "circle",
          source: "stopsSource",
          layout: {},
          paint: {
            "circle-color": "#4ea0b4",
            "circle-radius": 4,
            "circle-stroke-color": "#FFF",
            "circle-stroke-width": 1,
          },
        });
        console.log("Stops layer added!");
      };
      addSourcesAndLayers();
    }
  }, [map, routesData, stopsData]);

  // Create RBush structure
  useEffect(() => {
    // TODO bulk insertion to optimize even more
    const routeIndex = new RBush();
    routesData?.features.forEach((feature) => {
      const bbox = turf.bbox(feature); // Use a bounding box of the feature as the index entry
      routeIndex.insert({
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        route: feature,
      });
    });
    routeTree.current = routeIndex;
    console.log("Constructed RBush!");
  }, [routesData, RBush]);

  useEffect(() => {
    // Create websocket connection
    const webSocketURL = "wss://prod.dataservice.scenwise.nl/kv6";
    const socket = new WebSocket(webSocketURL);

    socket.onopen = () => {
      const message = JSON.stringify({
        Command: {
          Set: {
            Select: {
              Stream: true,
              timeStart: 1697884890000,
              timeStop: 1700559690000,
              region_ID: "Netherlands",
            },
          },
        },
      });

      // Send the message to the server
      socket.send(message);
    };

    // On each socket message, process vehicles and find their corresponding route
    socket.onmessage = (event) => {
      var message = event.data; // Take the data of the websocket message
      if (message === "Successfully connected!") console.log(message);
      else {
        console.log("Received message")
        var packets = JSON.parse(message).Packet; // Take the packet of vehicles from the message
        for (var packet of packets) {
          var vehicle = JSON.parse(packet.Payload) as Vehicle;

          if (vehicle.longitude && vehicle.latitude) {
            // If we already have this vehicle in move, set it to next position
            if(vehicleMarkers.current.has(vehicle.vehicleNumber) && map) {
              const currentMarkerRoute = vehicleMarkers.current.get(vehicle.vehicleNumber)
              currentMarkerRoute?.marker.setLngLat([vehicle.longitude, vehicle.latitude]).addTo(map)
              console.log("Moved marker of vehicle: " + vehicle.vehicleNumber + "on route: " + currentMarkerRoute?.route.routeName)
            }

            // If we do not have this vehicle, find its route
            var intersectedRoads = findIntersectedRoads(vehicle, routeTree);
            if (intersectedRoads.length === 1 && map !== null) { // TODO: make smarter choice here, rn only picking if only one intersection
              var popup = new mapboxgl.Popup()
                .setText("Route: " + intersectedRoads[0].routeCommonId + "\nVehicle: " + vehicle.vehicleNumber)
                .addTo(map);
              var marker = new mapboxgl.Marker()
                .setLngLat([vehicle.longitude, vehicle.latitude])
                .addTo(map)
                .setPopup(popup);
              vehicleMarkers.current.set(vehicle.vehicleNumber, {
                marker: marker,
                route: intersectedRoads[0]
              })
              console.log("Added new marker of vehicle: " +  vehicle.vehicleNumber + "on route: " + intersectedRoads[0].routeName)
              // TODO animate vehicles
            }
          }
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log("WebSocket closed:", event);
    };

    return () => {
      socket.close();
    };
  });

  return (
    <Stack direction="row" alignItems="stretch" height={400}>
      <Box p={1} flexGrow={1} width="60%">
        <Box sx={{ borderRadius: 6, overflow: "hidden" }} height="100%">
          <MapBoxContainer
            mapState={[map, setMap]}
            location={[4.525863, 52.370912] as LngLatLike}
            zoomLevel={14}
            is3D={true}
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default PublicTransportWidget;
