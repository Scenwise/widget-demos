import React, { useState, useEffect } from "react";
import { Box, Stack } from "@mui/material";
import fetchGTFS from "./fetchGTFS";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapBoxContainer from "../MapBoxContainer";
import busStopImage from "./icons/bus-stop-icon.png";

const PublicTransportWidget = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [routesData, setRoutesData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [stopsData, setStopsData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching routes data...");
        const fetchedRoutesData = await fetchGTFS(
          "gtfs_shapes_agency_vehicle_type_number_stops_info_corrected"
        );
        setRoutesData(fetchedRoutesData);
        console.log("Fetched routes data!");
      } catch (error) {
        console.error("Error fetching routes data:", error);
      }
      try {
        console.log("Fetching stops data...");
        const fetchedStopsData = await fetchGTFS("gtfs_stop_shape_ids_geom");
        setStopsData(fetchedStopsData);
        console.log("Fetched stops data!");
      } catch (error) {
        console.error("Error fetching stops data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (routesData && stopsData) {
      console.log("Adding sources and layers...");
      const addSourcesAndLayers = () => {
        if (!map) return;
        console.log("Adding the routes layer...");
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
            "line-color": "#4282f5",
            "line-width": 3,
            "line-opacity": 1,
          },
        });
        console.log("Routes layer added!");

        console.log("Adding stops layer...");
        map.loadImage(busStopImage, (error, image) => {
          if (error) throw error;

          if (image !== undefined) map.addImage("busStop", image);

          map.addSource("stopsSource", {
            type: "geojson",
            data: stopsData as GeoJSON.FeatureCollection,
          });
          map.addLayer({
            id: "stopsLayer",
            type: "symbol",
            source: "stopsSource",
            layout: {
              "icon-image": "busStop", // reference the image
              "icon-size": 0.08,
            },
          });
        });
        console.log("Stops layer added!");
      };
      addSourcesAndLayers();
    }
  }, [map, routesData, stopsData]);

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
