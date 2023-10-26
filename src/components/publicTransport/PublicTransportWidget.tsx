import React, { useState, useRef, useEffect } from "react";
import { TextField, Paper, Typography, List, ListSubheader, Box, Stack } from "@mui/material";
import fetchGTFS from "./fetchGTFS";
import findIntersectedRoads from "./findIntersectedRoads";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import MapBoxContainer from "../MapBoxContainer";
import { Vehicle } from "../../data/interfaces/Vehicle";
import * as turf from "@turf/turf";
import { VehicleRoutePair } from "../../data/interfaces/VehicleRoutePair";
import animateAlongRoute from "./animateVehicles";
import VehicleListItem from "./VehicleListItem";
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
// import logMarker from "./logHelpers";

const PublicTransportWidget = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [routesData, setRoutesData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [stopsData, setStopsData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

  const RBush = require("rbush");
  var routeTree = useRef(new RBush());
  // Keys are of format: "[DataOwnerCode]-[VehicleNumber]"
  const [vehicleMarkers, setVehicleMarkers] = useState(new Map<string, VehicleRoutePair>());

  // Used for UI sidebar
  const [searchQuery, setSearchQuery] = useState('');
  let listKey = 0

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

  // Create websocket connection
  useEffect(() => {
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
      setTimeout(() => 5000)
    };

    // On each socket message, process vehicles and find their corresponding route
    socket.onmessage = (event) => {
      var message = event.data; // Take the data of the websocket message
      if (message === "Successfully connected!") console.log(message);
      else {
        var packets = JSON.parse(message).Packet;
        for (var packet of packets) {
          var vehicle = JSON.parse(packet.Payload) as Vehicle;
          // Only process vehicles that have info about both delay and position; only process once routes data is loaded
          if (vehicle.messageType === "ONROUTE" && vehicle.rdX !== -1 && vehicle.rdY !== -1 && vehicle.longitude && vehicle.latitude && map !== null && routesData !== null) {
            // If we already have this vehicle in move, set it to next position and update the map
            const mapKey = vehicle.dataOwnerCode + "-" + vehicle.vehicleNumber
            const vehicleRoutePair = vehicleMarkers.get(mapKey);
            // Only process movement if timestamp of last move is before timestamp of current move
            if (vehicleRoutePair !== undefined && vehicleRoutePair.vehicle.timestamp < vehicle.timestamp) {
              const correct = animateAlongRoute(vehicleRoutePair, [vehicle.longitude, vehicle.latitude], map)
              if(correct) {
                setVehicleMarkers(new Map(vehicleMarkers.set(mapKey, {
                  marker: vehicleRoutePair.marker,
                  route: vehicleRoutePair.route,
                  vehicle: vehicle // update delay, timestamp, position
                })));
              }
              // If we misintersected, remove marker completely and try again on next update
              else {
                vehicleMarkers.get(mapKey)?.marker.remove()
                vehicleMarkers.delete(mapKey)
                setVehicleMarkers(new Map(vehicleMarkers))
              }
              // Uncomment for console logs: logMarker("move", vehicle.vehicleNumber, vehicle.timestamp, vehicleRoutePair.route.routeName);
            }

            // If we do not have this vehicle, find its route
            else if (vehicleRoutePair === undefined) {
              var intersectedRoads = findIntersectedRoads(vehicle, routeTree);
              if (intersectedRoads.length === 1) {
                var popup = new mapboxgl.Popup()
                  .setText(
                    "Route: " +
                      intersectedRoads[0].routeCommonId +
                      "\nVehicle: " +
                      mapKey
                  )
                var marker = new mapboxgl.Marker()
                  .setLngLat([vehicle.longitude, vehicle.latitude])
                  .addTo(map)
                  .setPopup(popup);
                setVehicleMarkers(new Map(vehicleMarkers.set(mapKey, {
                  marker: marker,
                  route: intersectedRoads[0],
                  vehicle: vehicle
                })));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routesData]);

  // Boilerplate for fly to location
  const { flyToLocation } = useSelector(
    (state: RootState) => state.publicTransport,
  );

  useEffect(() => {
    if (!map) return;
    if (!flyToLocation) return;

    map.flyTo({ center: flyToLocation, zoom: 14 });
  }, [map, flyToLocation]);

  return (
    <Stack direction="row" alignItems="stretch" height={700} width={1400}>
       <Paper
        elevation={0}
        sx={{ width: '25%', position: 'relative', overflow: 'auto' }}
      >
        <Box
          position="sticky"
          sx={{ bgcolor: 'background.paper', top: 0, px: 2, pt: 2, zIndex: 1 }}
        >
          <Typography variant="h6">Public Transportation Netherlands</Typography>
        </Box>
        <List>
          <ListSubheader sx={{ top: 48, bgcolor: 'background.paper' }}>
            All vehicles
          </ListSubheader>
          <TextField
          label="Search by vehicle or route"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />

          {Array.from(vehicleMarkers.values()).map((pair) => (
          <VehicleListItem
            key={listKey++}
            vehicle={pair.vehicle}
            route={pair.route}
            searchText={searchQuery}
          />
        ))}
        </List>
      </Paper>
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
