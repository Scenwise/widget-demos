import React, { useState, useRef, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import fetchGTFS from "./fetchGTFS";
import findIntersectedRoads from "./findIntersectedRoads";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import MapBoxContainer from "../MapBoxContainer";
import { Vehicle } from "../../data/interfaces/Vehicle";
import * as turf from "@turf/turf";
import { Route } from "../../data/interfaces/Route";
// import logMarker from "./logHelpers";

interface VehicleRoutePair {
  marker: mapboxgl.Marker;
  route: Route;
}

const PublicTransportWidget = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [routesData, setRoutesData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [stopsData, setStopsData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

  const RBush = require("rbush");
  var routeTree = useRef(new RBush());
  var vehicleMarkers = useRef(new Map<number, VehicleRoutePair>());

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

  // Create RBush structure with bulk insertion for increased efficiency
  useEffect(() => {
    const routeIndex = new RBush();
    const mappedData = routesData?.features.map((feature) => ({
      bbox: turf.bbox(feature),
      feature: feature,
    })).map((tuple) => ({
      minX: tuple.bbox[0],
      minY: tuple.bbox[1],
      maxX: tuple.bbox[2],
      maxY: tuple.bbox[3],
      route: tuple.feature,
    }));
    routeIndex.load(mappedData);
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
              timeStart: Date.now() - 20000, // start about 20 seconds before current time
              timeStop: 1918892497000, // stop sometime in 2030
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
        var packets = JSON.parse(message).Packet;
        for (var packet of packets) {
          var vehicle = JSON.parse(packet.Payload) as Vehicle;

          // Only process vehicles that are well-constructed and once the routes are loaded
          if (vehicle.longitude && vehicle.latitude && map !== null && routesData !== null) {

            // If we already have this vehicle in move, set it to next position and update the map
            const vehicleRoutePair = vehicleMarkers.current.get(vehicle.vehicleNumber);
            if (vehicleRoutePair !== undefined) {
              vehicleRoutePair.marker
                .setLngLat([vehicle.longitude, vehicle.latitude])
                .addTo(map);
              vehicleMarkers.current.set(vehicle.vehicleNumber, {
                marker: vehicleRoutePair.marker,
                route: vehicleRoutePair.route,
              });
              // Uncomment for console logs: logMarker("move", vehicle.vehicleNumber, vehicle.timestamp, vehicleRoutePair.route.routeName);
            }

            // If we do not have this vehicle, find its route

            else {
              var intersectedRoads = findIntersectedRoads(vehicle, routeTree);
              // Uncomment for debugging intersections:
              // if(intersectedRoads.length === 0) {
              //   new mapboxgl.Marker({color: "red"})
              //     .setLngLat([vehicle.longitude, vehicle.latitude])
              //     .addTo(map)
              // }
              // if(intersectedRoads.length > 1) {
              //   new mapboxgl.Marker({color: "yellow"})
              //     .setLngLat([vehicle.longitude, vehicle.latitude])
              //     .addTo(map)
              // }
              if (intersectedRoads.length === 1) {
                var popup = new mapboxgl.Popup()
                  .setText(
                    "Route: " +
                      intersectedRoads[0].routeCommonId +
                      "\nVehicle: " +
                      vehicle.vehicleNumber
                  )
                  .addTo(map);
                var marker = new mapboxgl.Marker()
                  .setLngLat([vehicle.longitude, vehicle.latitude])
                  .addTo(map)
                  .setPopup(popup);
                vehicleMarkers.current.set(vehicle.vehicleNumber, {
                  marker: marker,
                  route: intersectedRoads[0],
                });
                // Uncomment for console logs: logMarker("add", vehicle.vehicleNumber, vehicle.timestamp, intersectedRoads[0].routeName);
              }
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
            location={[4.9041, 52.3676] as LngLatLike}
            zoomLevel={10}
            is3D={true}
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default PublicTransportWidget;
