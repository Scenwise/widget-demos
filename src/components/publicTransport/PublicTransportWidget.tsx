import React, { useState, useEffect } from "react";
import fetchGTFS from "./fetchGTFS";
import mapboxgl, { LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapBoxContainer from "../MapBoxContainer";

const PublicTransportWidget = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [routesData, setRoutesData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);
  const [stopsData, setStopsData] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry> | null>(null);

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

  useEffect(() => {
    const addSourcesAndLayers = () => {
      if (map && routesData) {
        console.log("Adding the routes layer...");
        if (map.getSource("routesSource")) {
          map.removeLayer("routesLayer");
          map.removeSource("routesSource");
        }

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
            "line-color": "orange",
            "line-width": 3,
            "line-opacity": 1,
          },
        });
        console.log("Routes layer added!");
      }

      if (map && stopsData) {
        console.log("Adding stops layer...");
        if (map.getSource("stopsSource")) {
          map.removeLayer("stopsLayer");
          map.removeSource("stopsSource");
        }

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
            "circle-color": "red",
            "circle-radius": 6,
            "circle-stroke-color": "#FFF",
            "circle-stroke-width": 2,
          },
        });
        console.log("Stops layer added!");
      }
    };
    addSourcesAndLayers();
  }, [map, routesData, stopsData]);

  return (
    <MapBoxContainer
      mapState={[map, setMap]}
      location={[5.025243, 51.567082] as LngLatLike}
      zoomLevel={8}
    />
  );
};

export default PublicTransportWidget;
