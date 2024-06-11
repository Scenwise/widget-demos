/* eslint-disable react-hooks/exhaustive-deps */
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
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { AccidentData } from "../../data/interfaces/AccidentData";

import mapboxgl, { LngLatLike } from "mapbox-gl";
import featureCollectionConverter from "./featureCollectionConverter";
import MapBoxContainer from "../MapBoxContainer";

import accidentsLayerPointLayer from './layers/accidentsLayerPointLayer.json';
import accidentsLayerSegmentLayer from './layers/accidentsLayerSegmentLayer.json';

import { AnyLayer } from 'mapbox-gl';
import { heatmapLayer } from "./layers/accidentsHeatmapLayer";
import { useDispatch } from "react-redux";
import { selectAccidentAction, useSelectAccident } from "./useSelectAccident";
import AccidentLocationList from "./AccidentLocationList";

const RiskMap = () => {
  const dispatch = useDispatch();
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

  const directionOptions = ['L', 'R', 'Both']
  const [selectedDirections, setSelectedDirections] = useState<string[]>(['Both']);

  const handleDirectionChange = (
    event: React.MouseEvent<HTMLElement>,
    newDirections: string[]
  ) => {
    const lastPressed = (event.currentTarget as HTMLButtonElement).value;

    if (lastPressed === 'Both') {
      setSelectedDirections((prevDirections) => 
        prevDirections.includes('Both') ? [] : ['Both']
      );
    } else {
      setSelectedDirections((prevDirections) => {
        if (prevDirections.includes('Both')) {
          return [lastPressed];
        } else {
          return newDirections;
        }
      });
    }
  };

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
  const validMapLayers = (layers: string[]) => {
    return map && layers.every(layer => map.getLayer(layer));
  } 

  useSelectAccident(map, geoJSONDataHeatmap);

  const allLayers = ['accidentsLayerPoint', 'accidentsLayerSegment', 'accidentsHeatmapLeft', 'accidentsHeatmapRight', 'accidentsHeatmapAll']
  const allSources = ['accidentsLocationsSourcePoint', 'accidentsLocationsSourceSegment', 'accidentsSourceHeatmapLeft', 'accidentsSourceHeatmapRight', 'accidentsSourceHeatmapAll']
  const dataLayers = ['accidentsLayerPoint', 'accidentsLayerSegment']
  const heatMapLayers = ['accidentsHeatmapLeft', 'accidentsHeatmapRight']

  useEffect(() => {
    if (!map) return;
    const addSourcesAndLayers = () => {
      for (const layer of allLayers) {
        // Remove the existing layers if they already exist
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
        }
      }

      for (const source of allSources) {
        // Remove the existing sources if they already exist
        if (map.getSource(source)) {
          map.removeSource(source);
        }
      }

      // Add the sources and layers to the map
      map.addSource("accidentsLocationsSourcePoint", {
        type: "geojson",
        data: geoJSONDataPoint as GeoJSON.FeatureCollection,
      });
      map.addLayer(accidentsLayerPointLayer as AnyLayer);

      map.addSource("accidentsLocationsSourceSegment", {
        type: "geojson",
        data: geoJSONDataSegment as GeoJSON.FeatureCollection,
      });
      map.addLayer(accidentsLayerSegmentLayer as AnyLayer);

      const geoJSONDataHeatmapLeft = JSON.parse(JSON.stringify(geoJSONDataHeatmap)) as GeoJSON.FeatureCollection
      geoJSONDataHeatmapLeft.features = geoJSONDataHeatmapLeft.features.filter(feature => feature.properties?.zijde === 'L')

      map.addSource("accidentsSourceHeatmapLeft", {
        type: "geojson",
        data: geoJSONDataHeatmapLeft as GeoJSON.FeatureCollection,
      });
      map.addLayer(heatmapLayer('accidentsHeatmapLeft', 'accidentsSourceHeatmapLeft') as AnyLayer);


      const geoJSONDataHeatmapRight = JSON.parse(JSON.stringify(geoJSONDataHeatmap)) as GeoJSON.FeatureCollection
      geoJSONDataHeatmapRight.features = geoJSONDataHeatmapRight.features.filter(feature => feature.properties?.zijde !== 'L')

      map.addSource("accidentsSourceHeatmapRight", {
        type: "geojson",
        data: geoJSONDataHeatmapRight as GeoJSON.FeatureCollection,
      });
      map.addLayer(heatmapLayer('accidentsHeatmapRight', 'accidentsSourceHeatmapRight') as AnyLayer); 


      const geoJSONDataHeatmapAll = JSON.parse(JSON.stringify(geoJSONDataHeatmap)) as GeoJSON.FeatureCollection

      map.addSource("accidentsSourceHeatmapAll", {
        type: "geojson",
        data: geoJSONDataHeatmapAll as GeoJSON.FeatureCollection,
      });
      map.addLayer(heatmapLayer('accidentsHeatmapAll', 'accidentsSourceHeatmapAll') as AnyLayer); 
      
    };

    addSourcesAndLayers();

    return () => {
      for (const layer of allLayers) {
        // Remove the existing layers if they already exist
        if (map.getLayer(layer)) {
          map.removeLayer(layer);
        }
      }

      for (const source of allSources) {
        // Remove the existing sources if they already exist
        if (map.getSource(source)) {
          map.removeSource(source);
        }
      }
    };
  }, [
    map,
    geoJSONDataPoint,
    geoJSONDataSegment,
    geoJSONDataHeatmap,
  ]);

  useEffect(() => {
    if (!validMapLayers(allLayers)) return;
    
    // Set visibility for heatmap layers based on selectedDirections
    if (selectedDirections.includes('L')) {
      map!.setLayoutProperty('accidentsHeatmapLeft', 'visibility', 'visible');
    } else {
      map!.setLayoutProperty('accidentsHeatmapLeft', 'visibility', 'none');
    }

    if (selectedDirections.includes('R')) {
      map!.setLayoutProperty('accidentsHeatmapRight', 'visibility', 'visible');
    } else {
      map!.setLayoutProperty('accidentsHeatmapRight', 'visibility', 'none');
    }

    if (selectedDirections.includes('Both')) {
      map!.setLayoutProperty('accidentsHeatmapAll', 'visibility', 'visible');
      dataLayers.forEach(layer => {
        map!.setFilter(layer, null); // Remove any existing filters
      });
    } else {
      map!.setLayoutProperty('accidentsHeatmapAll', 'visibility', 'none');
      // Filter points based on selectedDirections
      dataLayers.forEach(layer => map!.setFilter(layer, [
        'in',
        ['get', 'zijde'],
        ['literal', selectedDirections]
      ]));
    }

  }, [geoJSONDataHeatmap,selectedDirections])

  const setVisibility = (layers: string[], value: string) => {
    layers.forEach((layer) => {
      map!.setLayoutProperty(layer, 'visibility', value);
    })
  }

  useEffect(() => {
    if (!validMapLayers(dataLayers)) return;
    if (pointsVisible) {
      setVisibility(dataLayers, 'visible')
    }
    else {
      setVisibility(dataLayers, 'none')
    }
  }, [pointsVisible])

  useEffect(() => {
    if (!validMapLayers(heatMapLayers)) return;
    if (heatmapVisible) {
      setVisibility(heatMapLayers, 'visible')
    }
    else {
      setVisibility(heatMapLayers, 'none')
    }
  }, [heatmapVisible])

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
  
  const finalListWithDirection = useMemo(() => {
    if (!selectedDirections.includes('Both')) {
      return filteredAccidentData.filter(
        (location) => {
            return selectedDirections.some((direction => location.Zijde === direction))
        }
      );
    }
    else {
      return filteredAccidentData
    }
  }, [filteredAccidentData, selectedDirections])

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
                Filter by road direction:
              </Typography>

            <ToggleButtonGroup
              color='primary'
              value={selectedDirections}
              onChange={handleDirectionChange}
              aria-label='directions'
              size='small'
              sx={{ width: 'fit-content'}}
            >
              {directionOptions.map((direction) => (
                <ToggleButton key={direction} value={direction} aria-label={direction} sx={{ width: '60px' }}>
                  {direction}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
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
            All Accidents ({finalListWithDirection.length})
          </ListSubheader>
          <AccidentLocationList filteredAccidentData={finalListWithDirection}></AccidentLocationList>

        </List>
      </Paper>

      <Box p={1} flexGrow={1} width="60%">
        <Box sx={{ borderRadius: 6, overflow: "hidden" }} height="100%">
          <MapBoxContainer
            mapState={[map, setMap]}
            location={[5.025243, 51.567082] as LngLatLike}
            zoomLevel={7}
            onLoadFunction={(map: mapboxgl.Map) => selectAccidentAction(map, dispatch)}
          />
        </Box>
      </Box>
    </Stack>
  );
};
export default RiskMap;
