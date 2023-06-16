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
  let accidents = useRef<Array<AccidentData>>([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [data, setData] = useState({});

  useEffect(() => {
    if (!map) return;
    // Note: all excel files should stay in the "public" folder for them to be parsed
    const filePath = "../../../public/accidents-excel/brabant2022.xlsx";
    const fetchData = async () => {
      const response = await fetch(filePath);
      console.log(response);
      const data = await response.arrayBuffer();
      console.log(data)
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      // Construct the AccidentData array
      const JSONdata = XLSX.utils.sheet_to_json(
        worksheet
      ) as Array<AccidentData>;
      console.log(JSONdata)
      accidents.current = JSONdata;
      const featureCollection = featureCollectionConverter(accidents.current);
      setData(featureCollection);
      setLoading(false);
    };
    fetchData();

    map.addSource('accidentsLocationsSource', {
      type: 'geojson',
      data: data as GeoJSON.FeatureCollection,
    });

    map.addLayer({
      id: 'accidentsLayer',
      type: 'circle',
      source: 'accidentsLocationsSource',
      layout: {},
      paint: {
        'circle-color': 'red',
        'circle-radius': 6,
        'circle-stroke-color': '#FFF',
        'circle-stroke-width': 2,
      },
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
          <Typography variant="h6">Amsterdam Parking</Typography>
        </Box>
        <List>
          {/* <ListSubheader sx={{ top: 48, bgcolor: 'background.paper' }}>
            Closest to you
          </ListSubheader> */}

          {/* <ListItem sx={{ pt: 0 }}>
            <Grid container spacing={1} alignItems="stretch">
              {locations.features.slice(0, 2).map((location) => (
                <Grid item xs={6} key={location.Id}>
                  <ParkingLocationHighlight
                    name={location.properties.name}
                    space={
                      Number(location.properties.FreeSpaceShort) +
                      Number(location.properties.FreeSpaceLong)
                    }
                    capacity={
                      Number(location.properties.ShortCapacity) +
                      Number(location.properties.LongCapacity)
                    }
                    location={location.geometry.coordinates as LngLatLike}
                  />
                </Grid>
              ))}
            </Grid>
          </ListItem> */}

          <ListSubheader sx={{ top: 48, bgcolor: 'background.paper' }}>
            All Accidents
          </ListSubheader>

          {accidents.current.map((location) => (
            <AccidentLocationListItem
              key={location.ID}
              name={location.ID.toString()}
              location={[location.Longitude, location.Latitude] as LngLatLike}
            />
          ))}
        </List>

      </Paper>

      <Box p={1} flexGrow={1} width="60%">
        <Box sx={{ borderRadius: 6, overflow: 'hidden' }} height="100%">
          <MapBoxContainer mapState={[map, setMap]} />
        </Box>
      </Box>
    </Stack>
  );
};

export default RiskMap;
