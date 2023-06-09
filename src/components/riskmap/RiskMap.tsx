/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  Grid,
  List,
  ListItem,
  ListSubheader,
  Paper,
  Stack,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AccidentData } from "../../data/interfaces/AccidentData";
import { set } from "immer/dist/internal";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LngLatLike } from "mapbox-gl";
import featureCollectionConverter from "./featureCollectionConverter";
import MapBoxContainer from "../MapBoxContainer";
import AccidentLocationListItem from "./AccidentLocationListItem";

const RiskMap = () => {
  // Parse the Excel file to retrieve the accidents
  const [accidentData, setAccidentData] = useState<Array<AccidentData>>([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [geoJSONDataPoint, setDataJSONDataPoint] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();
  const [geoJSONDataSegment, setDataJSONDataSegment] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [filteredAccidentData, setFilteredAccidentData] = useState<
    Array<AccidentData>
  >([]);

  useEffect(() => {
    // if (!map) return;
    // Note: all excel files should stay in the "public" folder for them to be parsed
    const filePath = "./accidents-excel/brabant2022.xlsx";
    const fetchData = async () => {
      const response = await fetch(filePath);
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const JSONdata = XLSX.utils.sheet_to_json(
        worksheet
      ) as Array<AccidentData>;

      setAccidentData(JSONdata);
      setFilteredAccidentData(JSONdata);

      const { featureCollectionPoint, featureCollectionSegment } =
        featureCollectionConverter(JSONdata);

      setDataJSONDataPoint(
        featureCollectionPoint as GeoJSON.FeatureCollection<GeoJSON.Geometry>
      );
      setDataJSONDataSegment(
        featureCollectionSegment as GeoJSON.FeatureCollection<GeoJSON.Geometry>
      );
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!map) return;

    const addSourcesAndLayers = () => {
      // Remove the existing sources and layers if they already exist
      if (map.getSource("accidentsLocationsSourcePoint")) {
        map.removeSource("accidentsLocationsSourcePoint");
      }
      if (map.getSource("accidentsLocationsSourceSegment")) {
        map.removeSource("accidentsLocationsSourceSegment");
      }
      if (map.getLayer("accidentsLayerPoint")) {
        map.removeLayer("accidentsLayerPoint");
      }
      if (map.getLayer("accidentsLayerSegment")) {
        map.removeLayer("accidentsLayerSegment");
      }

      // Add the sources and layers to the map
      map.addSource("accidentsLocationsSourcePoint", {
        type: "geojson",
        data: geoJSONDataPoint as GeoJSON.FeatureCollection,
      });
      map.addLayer({
        id: "accidentsLayerPoint",
        type: "circle",
        source: "accidentsLocationsSourcePoint",
        layout: {},
        paint: {
          "circle-color": "red",
          "circle-radius": 6,
          "circle-stroke-color": "#FFF",
          "circle-stroke-width": 2,
        },
      });

      map.addSource("accidentsLocationsSourceSegment", {
        type: "geojson",
        data: geoJSONDataSegment as GeoJSON.FeatureCollection,
      });
      map.addLayer({
        id: "accidentsLayerSegment",
        type: "line",
        source: "accidentsLocationsSourceSegment",
        layout: {},
        paint: {
          "line-color": "orange",
          "line-width": 3,
        },
      });
    };

    addSourcesAndLayers();

    return () => {
      // Cleanup: remove the sources and layers when the component unmounts
      if (map.getSource("accidentsLocationsSourcePoint")) {
        map.removeSource("accidentsLocationsSourcePoint");
      }
      if (map.getSource("accidentsLocationsSourceSegment")) {
        map.removeSource("accidentsLocationsSourceSegment");
      }
      if (map.getLayer("accidentsLayerPoint")) {
        map.removeLayer("accidentsLayerPoint");
      }
      if (map.getLayer("accidentsLayerSegment")) {
        map.removeLayer("accidentsLayerSegment");
      }
    };
  }, [map, geoJSONDataPoint, geoJSONDataSegment]);

  useEffect(() => {
    const { featureCollectionPoint, featureCollectionSegment } =
      featureCollectionConverter(filteredAccidentData);

    setDataJSONDataPoint(
      featureCollectionPoint as GeoJSON.FeatureCollection<GeoJSON.Geometry>
    );
    setDataJSONDataSegment(
      featureCollectionSegment as GeoJSON.FeatureCollection<GeoJSON.Geometry>
    );
  }, [filteredAccidentData]);

  const { flyToLocation } = useSelector(
    (state: RootState) => state.accidentsWidget
  );

  useEffect(() => {
    if (!map) return;
    if (!flyToLocation) return;

    map.flyTo({ center: flyToLocation, zoom: 14 });
  }, [map, flyToLocation]);

  const handleProcessSelection = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value];

    // Check if the "Clear" option is selected
    if (selectedValues.includes("Clear")) {
      setSelectedProcesses([]);
      setFilteredAccidentData(accidentData);
      return;
    }

    setSelectedProcesses(selectedValues);

    // Filter the accident data based on the selected processes
    const filteredData =
      selectedValues.length === 0
        ? accidentData // Show all accidents if no processes are selected
        : accidentData.filter((location) =>
            selectedValues.includes(location.Proces)
          );

    setFilteredAccidentData(filteredData);
  };

  // To access the accidents, use accidents.current
  return (
    <Stack direction="row" alignItems="stretch" height={400}>
      <Paper
        elevation={0}
        sx={{ width: "40%", position: "relative", overflow: "auto" }}
      >
        <Box
          position="sticky"
          sx={{ bgcolor: "background.paper", top: 0, px: 2, pt: 2, zIndex: 1 }}
        >
          <Typography variant="h6">North Brabant Accidents</Typography>
          <Box
            display="flex"
            alignItems="center"
            sx={{ width: "100%", mb: 2, paddingTop: 2 }}
          >
            <Typography variant="body2" sx={{ paddingRight: 2 }}>
              Filter by Process
            </Typography>
            <Select
              multiple
              value={selectedProcesses}
              onChange={handleProcessSelection}
              renderValue={(selected) =>
                (selected as string[]).join(", ").length > 20
                  ? `${(selected as string[]).join(", ").slice(0, 20)}...`
                  : (selected as string[]).join(", ")
              }
              sx={{
                minWidth: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                height: 30,
                padding: 0,
              }}
              MenuProps={{
                sx: { maxHeight: 200 },
              }}
            >
              <MenuItem value="Clear">Clear selections</MenuItem>
              {Array.from(
                new Set(accidentData.map((location) => location.Proces))
              ).map((proces) => (
                <MenuItem key={proces} value={proces}>
                  {proces}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        <List>
          <ListSubheader sx={{ top: 55, bgcolor: "background.paper" }}>
            All Accidents
          </ListSubheader>

          {filteredAccidentData.map((location) => (
            <AccidentLocationListItem
              key={location.ID}
              name={location.Weg}
              location={
                [location.Longitude_van, location.Latitude_van] as LngLatLike
              }
              zijde={location.Zijde}
              hmpVan={location["Hmp van"]}
              hmpTot={location["Hmp tot"]}
              ovd={location.ovd ? location.ovd.toTimeString() : ""}
              Starttijd={location.Starttijd.toTimeString()}
              Einddatum={location.Einddatum.toDateString()}
              Eerste_tijd_ter_plaatse={
                location["Eerste tijd ter plaatse"]
                  ? location["Eerste tijd ter plaatse"].toTimeString()
                  : ""
              }
              Laatste_eindtijd={
                location["Laatste eindtijd"]
                  ? location["Laatste eindtijd"].toTimeString()
                  : ""
              }
              color={location["Hmp tot"] ? "orange" : "red"}
              Proces={location.Proces}
              Melder={location.Melder}
            />
          ))}
        </List>
      </Paper>

      <Box p={1} flexGrow={1} width="60%">
        <Box sx={{ borderRadius: 6, overflow: "hidden" }} height="100%">
          <MapBoxContainer
            mapState={[map, setMap]}
            location={[5.025243, 51.567082] as LngLatLike}
            zoomLevel={8}
          />
        </Box>
      </Box>
    </Stack>
  );
};

export default RiskMap;
