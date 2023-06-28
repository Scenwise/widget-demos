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
} from '@mui/material';
import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { AccidentData } from "../../data/interfaces/AccidentData";
import { set } from "immer/dist/internal";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { LngLatLike } from 'mapbox-gl';
import featureCollectionConverter from "./featureCollectionConverter";
import MapBoxContainer from '../MapBoxContainer';
import AccidentLocationListItem from './AccidentLocationListItem';

const RiskMap = () => {
  // Parse the Excel file to retrieve the accidents
  const [accidentData, setAccidentData] = useState<Array<AccidentData>>([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [geoJSONDataPoint, setDataJSONDataPoint] = useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();
  const [geoJSONDataSegment, setDataJSONDataSegment] = useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>();

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
      
      const {featureCollectionPoint, featureCollectionSegment} = featureCollectionConverter(JSONdata);

      setDataJSONDataPoint(featureCollectionPoint as GeoJSON.FeatureCollection<GeoJSON.Geometry>);
      setDataJSONDataSegment(featureCollectionSegment as GeoJSON.FeatureCollection<GeoJSON.Geometry>);
      setLoading(false);
    };
    fetchData();
    
    map?.addSource('accidentsLocationsSourcePoint', {
      type: 'geojson',
      data: geoJSONDataPoint as GeoJSON.FeatureCollection,
    });
    map?.addLayer({
      id: 'accidentsLayerPoint',
      type: 'circle',
      source: 'accidentsLocationsSourcePoint',
      layout: {},
      paint: {
        'circle-color': 'red',
        'circle-radius': 6,
        'circle-stroke-color': '#FFF',
        'circle-stroke-width': 2,
      },
    });

    map?.addSource('accidentsLocationsSourceSegment', {
      type: 'geojson',
      data: geoJSONDataSegment as GeoJSON.FeatureCollection,
    });
    map?.addLayer({
      id: 'accidentsLayerSegment',
      type: 'line',
      source: 'accidentsLocationsSourceSegment',
      layout: {},
      paint: {
        "line-color": "orange",
        "line-width": 3
      }
    });
  }, [map]);

  const { flyToLocation } = useSelector(
    (state: RootState) => state.accidentsWidget,
  );

  useEffect(() => {
    if (!map) return;
    if (!flyToLocation) return;

    map.flyTo({ center: flyToLocation, zoom: 14 });
  }, [map, flyToLocation]);

  // Construct the riskmap based on the accidents (TODO)
  // To access the accidents, use accidents.current
  return (
    <Stack direction="row" alignItems="stretch" height={400}>
      <Paper
        elevation={0}
        sx={{ width: '40%', position: 'relative', overflow: 'auto' }}
      >
        <Box
          position="sticky"
          sx={{ bgcolor: 'background.paper', top: 0, px: 2, pt: 2, zIndex: 1 }}
        >
          <Typography variant="h6">North Brabant Accidents</Typography>
        </Box>
        <List>
          <ListSubheader sx={{ top: 48, bgcolor: 'background.paper' }}>
            All Accidents
          </ListSubheader>

          {accidentData.map((location) => (
            <AccidentLocationListItem
              key={location.ID}
              name={location.Weg}
              location={[location.Longitude_van, location.Latitude_van] as LngLatLike}
              zijde={location.Zijde}
              hmpVan={location['Hmp van']}
              hmpTot={location['Hmp tot']}
              ovd={location.ovd?location.ovd.toTimeString(): ""}
              Starttijd={location.Starttijd.toTimeString()}
              Einddatum={location.Einddatum.toDateString()}
              Eerste_tijd_ter_plaatse={location['Eerste tijd ter plaatse']?location['Eerste tijd ter plaatse'].toTimeString():""}
              Laatste_eindtijd={location['Laatste eindtijd']?location['Laatste eindtijd'].toTimeString():""}
              color={location['Hmp tot']?"orange":"red"}
              Proces={location.Proces}
              Melder={location.Melder}
            />
          ))}
        </List>

      </Paper>

      <Box p={1} flexGrow={1} width="60%">
        <Box sx={{ borderRadius: 6, overflow: 'hidden' }} height="100%">
          <MapBoxContainer mapState={[map, setMap]} location={[5.025243, 51.567082] as LngLatLike} zoomLevel={8} />
        </Box>
      </Box>
    </Stack>
  );
};

export default RiskMap;
