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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
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
  const [selectedRoadNames, setSelectedRoadNames] = useState<string[]>([]);
  //TODO: make start and end time the start and end times of the accidents
  const [selectedStartTime, setSelectedStartTime] =
    React.useState<Dayjs | null>(dayjs());
  const [selectedEndTime, setSelectedEndTime] = React.useState<Dayjs | null>(
    dayjs()
  );
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
      if (map.getLayer("accidentsLayerPoint")) {
        map.removeLayer("accidentsLayerPoint");
      }
      if (map.getLayer("accidentsLayerSegment")) {
        map.removeLayer("accidentsLayerSegment");
      }
      if (map.getSource("accidentsLocationsSourcePoint")) {
        map.removeSource("accidentsLocationsSourcePoint");
      }
      if (map.getSource("accidentsLocationsSourceSegment")) {
        map.removeSource("accidentsLocationsSourceSegment");
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

  /**
   * Process filtering handle. Collects the keywords selected by the user and filters the processes by them.
   * The processes array will be used to filter the actual accidents.
   * @param event the selected processes
   */
  const handleProcessSelection = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value];

    // Check if the "Clear" option is selected or if there are no selected values
    if (selectedValues.includes("Clear") || selectedValues.length === 0) {
      setSelectedProcesses([]);
      return;
    }

    setSelectedProcesses(selectedValues);
  };

  /**
   * Road name filtering handle. Collects the keywords selected by the user and filters the road names by them.
   * The road names array will be used to filter the actual accidents.
   * @param event the selected road names
   */
  const handleRoadNameSelection = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = Array.isArray(event.target.value)
      ? event.target.value
      : [event.target.value];

    // Check if the "Clear" option is selected or if there are no selected values
    if (selectedValues.includes("Clear") || selectedValues.length === 0) {
      setSelectedRoadNames([]);
      return;
    }

    setSelectedRoadNames(selectedValues);
  };

  const handleTimeSelection = (timeframe: Dayjs | null) => {
    //TODO: add filtering by timeframe
  };

  /**
   * Main filtering hook. At any change of the selection arrays, the hook recomputes the filtered data.
   * This makes it trivial to add new filtering functions later on.
   */
  useEffect(() => {
    if (selectedProcesses.length === 0 && selectedRoadNames.length === 0) {
      setFilteredAccidentData(accidentData);
      return;
    }
    // Filter the accident data based on the selected processes and road names
    const filteredData = accidentData.filter(
      (location) =>
        (selectedProcesses.length === 0
          ? true
          : selectedProcesses.includes(location.Proces)) &&
        (selectedRoadNames.length === 0
          ? true
          : selectedRoadNames.includes(location.Weg))
    );
    setFilteredAccidentData(filteredData);
  }, [accidentData, selectedProcesses, selectedRoadNames]);

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
        </Box>

        <List>
          <Box
            display="flex"
            alignItems="center"
            sx={{ width: "100%", paddingTop: 1, paddingBottom: 1 }}
          >
            <Typography
              variant="body2"
              sx={{ width: "20%", paddingLeft: 2, paddingRight: 1 }}
            >
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
          <Box display="flex" alignItems="flex-start" sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              sx={{ width: "20%", paddingLeft: 2, paddingRight: 1 }}
            >
              Filter by Road
            </Typography>
            <Select
              multiple
              value={selectedRoadNames}
              onChange={handleRoadNameSelection}
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
                new Set(accidentData.map((location) => location.Weg))
              ).map((roadName) => (
                <MenuItem key={roadName} value={roadName}>
                  {roadName}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ width: "98%", paddingTop: 2, paddingLeft: 0.6}}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ width: "49%"}}
                  label="Start time"
                  value={selectedStartTime}
                  onChange={handleTimeSelection}
                />
                <DatePicker
                  sx={{ width: "49%"}}
                  label="End time"
                  value={selectedEndTime}
                  onChange={handleTimeSelection}
                />
              </LocalizationProvider>
          </Box>
          <ListSubheader sx={{ top: 45, bgcolor: "background.paper" }}>
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
