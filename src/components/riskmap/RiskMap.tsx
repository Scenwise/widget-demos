/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Box,
  List,
  ListSubheader,
  Paper,
  Stack,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { AccidentData } from "../../data/interfaces/AccidentData";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LngLatLike } from "mapbox-gl";
import featureCollectionConverter, {
  pointCoordinates,
} from "./featureCollectionConverter";
import MapBoxContainer from "../MapBoxContainer";
import AccidentLocationListItem from "./AccidentLocationListItem";

const RiskMap = () => {
  // Parse the Excel file to retrieve the accidents
  const filePath = "./accidents-excel/Rijkswaterstaat-accidents.xlsx";
  // const filePath = "./accidents-excel/brabant2022.xlsx";
  const [accidentData, setAccidentData] = useState<Array<AccidentData>>([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [geoJSONDataPoint, setDataJSONDataPoint] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();
  const [geoJSONDataSegment, setDataJSONDataSegment] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();
  const [geoJSONDataHeatmap, setDataHeatmap] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();

  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedRoadNames, setSelectedRoadNames] = useState<string[]>([]);
  const [selectedStartTime, setSelectedStartTime] =
    React.useState<Dayjs | null>(dayjs());
  const [selectedEndTime, setSelectedEndTime] = React.useState<Dayjs | null>(
    dayjs()
  );
  const [filteredAccidentData, setFilteredAccidentData] = useState<
    Array<AccidentData>
  >([]);
  const [heatmapVisible, setHeatmapVisible] = useState(true);
  const [pointsVisible, setPointsVisible] = useState(true);

  useEffect(() => {
    // if (!map) return;
    // Note: all excel files should stay in the "public" folder for them to be parsed
    const fetchData = async () => {
      // Parse the data from the Excel file
      const response = await fetch(filePath);
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const JSONdata = XLSX.utils.sheet_to_json(
        worksheet
      ) as Array<AccidentData>;

      // Process Date parsing problems
      JSONdata.forEach((x) => {
        const combinedDateTime = new Date(x.Starttijd);
        if (x.Startdatum !== undefined) {
          combinedDateTime.setFullYear(x.Startdatum.getFullYear());
          combinedDateTime.setMonth(x.Startdatum.getMonth());
          combinedDateTime.setDate(x.Startdatum.getDate());
        }
        x.Startdatum = combinedDateTime;
        x.Starttijd = new Date(0);

        if (!(x.Eindtijd instanceof Date) && !(x.Einddatum instanceof Date)) {
          x.Einddatum = x.Startdatum;
          x.Eindtijd = new Date(0);
        } else {
          const combinedDateTime2 = new Date(x.Einddatum);
          if (x.Eindtijd !== undefined) {
            combinedDateTime2.setHours(x.Eindtijd.getHours());
            combinedDateTime2.setMinutes(x.Eindtijd.getMinutes());
            combinedDateTime2.setSeconds(x.Eindtijd.getSeconds());
          }

          x.Einddatum = combinedDateTime2;
          x.Eindtijd = new Date(0);
        }
      });
      // Set the accident data
      setAccidentData(JSONdata);
      setFilteredAccidentData(JSONdata);

      // Set the start time for the accidents as the lowest start time

      const startTimes = JSONdata.map((x) => x.Startdatum.getTime());
      const minStart = new Date(Math.min(...startTimes));
      setSelectedStartTime(dayjs(minStart));

      // Set the end time for the accidents as the highest end time
      const endTimes = JSONdata.map((x) => x.Einddatum.getTime());
      const maxEnd = new Date(Math.max(...endTimes));
      setSelectedEndTime(dayjs(maxEnd));

      // Set the map data
      const {
        featureCollectionPoint,
        featureCollectionSegment,
        fullFeatureCollection,
      } = featureCollectionConverter(JSONdata);

      setDataJSONDataPoint(
        featureCollectionPoint as GeoJSON.FeatureCollection<GeoJSON.Geometry>
      );
      setDataJSONDataSegment(
        featureCollectionSegment as GeoJSON.FeatureCollection<GeoJSON.Geometry>
      );
      setDataHeatmap(
        fullFeatureCollection as GeoJSON.FeatureCollection<GeoJSON.Geometry>
      );
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!map) return;
    const addSourcesAndLayers = () => {
      // Remove the existing sources and layers if they already exist
      if (map.getLayer("accidentsLayerPoint")) {
        map.removeLayer("accidentsLayerPoint");
      }
      if (map.getLayer("accidentsLayerSegment")) {
        map.removeLayer("accidentsLayerSegment");
      }
      if (map.getLayer("accidentsHeatmap")) {
        map.removeLayer("accidentsHeatmap");
      }
      if (map.getSource("accidentsLocationsSourcePoint")) {
        map.removeSource("accidentsLocationsSourcePoint");
      }
      if (map.getSource("accidentsLocationsSourceSegment")) {
        map.removeSource("accidentsLocationsSourceSegment");
      }
      if (map.getSource("accidentsSourceHeatmap")) {
        map.removeSource("accidentsSourceHeatmap");
      }

      // Add the sources and layers to the map
      if (pointsVisible) {
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
            "line-opacity": 1,
          },
        });
      }
      // Add heatmap
      if (heatmapVisible) {
        map.addSource("accidentsSourceHeatmap", {
          type: "geojson",
          data: geoJSONDataHeatmap as GeoJSON.FeatureCollection,
        });
        map.addLayer({
          id: "accidentsHeatmap",
          type: "heatmap",
          source: "accidentsSourceHeatmap",
          paint: {
            // All points have the same weight (equal importance)
            "heatmap-weight": 1,
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              0.3,
              9,
              2,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 0, 255, 0)", // Transparent blue for density 0
              0.1,
              "#0000FF", // Pure blue for density 0.1
              0.2,
              "#00FFFF", // Cyan for density 0.2
              0.3,
              "#00FF7F", // Spring Green for density 0.3
              0.4,
              "#00FF00", // Pure green for density 0.4
              0.5,
              "#7FFF00", // Chartreuse for density 0.5
              0.6,
              "#ADFF2F", // Green-yellow for density 0.6
              0.7,
              "#FFFF00", // Yellow for density 0.7
              0.8,
              "#FFA500", // Orange for density 0.8
              0.9,
              "#FF4500", // Red-orange for density 0.9
              1,
              "#FF0000", // Pure red for density 1
            ],

            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              9,
              20,
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              6,
              1,
              9,
              0.3,
            ],
          },
        });
      }
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
      if (map.getLayer("accidentsHeatmap")) {
        map.removeLayer("accidentsHeatmap");
      }
      if (map.getSource("accidentsLocationsSourcePoint")) {
        map.removeSource("accidentsLocationsSourcePoint");
      }
      if (map.getSource("accidentsLocationsSourceSegment")) {
        map.removeSource("accidentsLocationsSourceSegment");
      }
      if (map.getSource("accidentsSourceHeatmap")) {
        map.removeSource("accidentsSourceHeatmap");
      }
    };
  }, [
    map,
    geoJSONDataPoint,
    geoJSONDataSegment,
    geoJSONDataHeatmap,
    heatmapVisible,
    pointsVisible,
  ]);

  /**
   * Hook for displaying the filtered data on the map.
   */
  useEffect(() => {
    const {
      featureCollectionPoint,
      featureCollectionSegment,
      fullFeatureCollection,
    } = featureCollectionConverter(filteredAccidentData);

    setDataJSONDataPoint(
      featureCollectionPoint as GeoJSON.FeatureCollection<GeoJSON.Geometry>
    );
    setDataJSONDataSegment(
      featureCollectionSegment as GeoJSON.FeatureCollection<GeoJSON.Geometry>
    );
    setDataHeatmap(
      fullFeatureCollection as GeoJSON.FeatureCollection<GeoJSON.Geometry>
    );
  }, [filteredAccidentData]);

  const { flyToLocation } = useSelector(
    (state: RootState) => state.accidentsWidget
  );

  /**
   * Hook for zooming on a specific accident when the user selects it.
   */
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

  const handleHeatmapSwitchChange = (event: any) => {
    setHeatmapVisible(event.target.checked);
  };

  const handlePointsSwitchChange = (event: any) => {
    setPointsVisible(event.target.checked);
  };

  /**
   * Main filtering hook. At any change of the selection arrays, the hook recomputes the filtered data.
   * This makes it trivial to add new filtering functions later on.
   */
  useMemo(() => {
    let filteredData = accidentData;
    // Filter the accident data based on the selected processes and road names
    if (selectedProcesses.length !== 0 || selectedRoadNames.length !== 0) {
      filteredData = accidentData.filter(
        (location) =>
          (selectedProcesses.length === 0
            ? true
            : selectedProcesses.includes(location.Proces)) &&
          (selectedRoadNames.length === 0
            ? true
            : selectedRoadNames.includes(location.Weg))
      );
    }

    // Filter based on start and end time
    filteredData = filteredData.filter(
      (location) =>
        location.Startdatum.getTime() >=
          (selectedStartTime === null ? 0 : selectedStartTime.unix()) * 1000 &&
        location.Startdatum.getTime() <=
          (selectedEndTime === null ? 0 : selectedEndTime.unix()) * 1000
    );
    setFilteredAccidentData(filteredData);
  }, [
    accidentData,
    selectedProcesses,
    selectedRoadNames,
    selectedStartTime,
    selectedEndTime,
  ]);

  // To access the accidents, use accidents.current
  return (
    <Stack direction="row" alignItems="stretch" height={600} width={1200}>
      <Paper
        elevation={0}
        sx={{ width: "40%", position: "relative", overflow: "auto" }}
      >
        <Box
          position="sticky"
          sx={{
            bgcolor: "background.paper",
            top: 0,
            px: 2,
            pt: 2,
            zIndex: 1,
          }}
        >
          <Typography variant="h6">Rijkswaterstaat Accidents</Typography>
        </Box>

        <List>
          <Box sx={{ width: "98%", paddingTop: 2, paddingLeft: 1.5 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                sx={{ width: "49%", zIndex: 0 }}
                label="Start time"
                value={selectedStartTime}
                onChange={(newValue) => setSelectedStartTime(newValue)}
                format="DD MMM YYYY"
              />
              <DatePicker
                sx={{ width: "49%", zIndex: 0 }}
                label="End time"
                value={selectedEndTime}
                onChange={(newValue) => setSelectedEndTime(newValue)}
                format="DD MMM YYYY"
              />
            </LocalizationProvider>
          </Box>
          <Box display="flex" alignItems="flex-start" sx={{ width: "100%" }}>
            <Box
              display="flex"
              alignItems="center"
              sx={{ paddingLeft: 7, width: "50%" }}
            >
              <Typography variant="body2">Show Points</Typography>
              <Switch
                checked={pointsVisible}
                onChange={handlePointsSwitchChange}
              />
            </Box>
            <Box display="flex" alignItems="center" sx={{ width: "50%" }}>
              <Typography variant="body2">Show Heatmap</Typography>
              <Switch
                checked={heatmapVisible}
                onChange={handleHeatmapSwitchChange}
              />
            </Box>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{ width: "100%", paddingBottom: 1 }}
          >
            <Typography
              variant="body2"
              sx={{ paddingLeft: 9, paddingRight: 3 }}
            >
              Filter by Process:
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
                height: 35,
                padding: 0,
              }}
              MenuProps={{
                sx: { maxHeight: 200 },
              }}
            >
              <MenuItem value="Clear">Clear selections</MenuItem>
              {Array.from(
                new Set(accidentData.map((location) => location.Proces))
              )
                .sort()
                .map((proces) => (
                  <MenuItem key={proces} value={proces}>
                    {proces}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box display="flex" alignItems="center" sx={{ width: "100%" }}>
            <Typography
              variant="body2"
              sx={{ paddingLeft: 10, paddingRight: 3 }}
            >
              Filter by Road:
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
                height: 35,
                padding: 0,
              }}
              MenuProps={{
                sx: { maxHeight: 200 },
              }}
            >
              <MenuItem value="Clear">Clear selections</MenuItem>
              {Array.from(new Set(accidentData.map((location) => location.Weg)))
                .sort()
                .map((roadName) => (
                  <MenuItem key={roadName} value={roadName}>
                    {roadName}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <ListSubheader sx={{ top: 45, bgcolor: "background.paper" }}>
            All Accidents
          </ListSubheader>

          {filteredAccidentData.map((location) => (
            <AccidentLocationListItem
              key={location.ID}
              name={location.Weg}
              location={pointCoordinates(location)}
              zijde={location.Zijde}
              hmpVan={location["Hmp van"]}
              hmpTot={location["Hmp tot"]}
              ovd={location.ovd ? location.ovd.toTimeString() : ""}
              Startdatum={location.Einddatum.toLocaleString("nl-NL")}
              Einddatum={location.Einddatum.toLocaleString("nl-NL")}
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
              color={location["Points"] ? "orange" : "red"}
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
            zoomLevel={7}
          />
        </Box>
      </Box>
    </Stack>
  );
};
export default RiskMap;
