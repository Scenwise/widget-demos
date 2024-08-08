import { LngLatLike } from 'mapbox-gl';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Box, Grid, List, ListItem, ListSubheader, Paper, Stack, Typography } from '@mui/material';
import { lightGreen, orange, red, yellow } from '@mui/material/colors';

import locations from '../../data/amsterdam-center.json';
import { RootState } from '../../store';
import MapBoxContainer from '../MapBoxContainer';
import ParkingLocationHighlight from './ParkingLocationCard';
import ParkingLocationListItem from './ParkingLocationListItem';

export const occupancyColor = (occupancy: number) => {
    if (occupancy < 0.33) return lightGreen;
    if (occupancy < 0.65) return yellow;
    if (occupancy < 0.85) return orange;
    return red;
};

function ParkingWidget() {
    const [map, setMap] = useState<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (!map) return;

        const formattedLocations = {
            ...locations,
            features: locations.features.map((feature) => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    total_occupancy:
                        (Number(feature.properties.FreeSpaceShort) + Number(feature.properties.FreeSpaceLong)) /
                        (Number(feature.properties.ShortCapacity) + Number(feature.properties.LongCapacity)),
                },
            })),
        };

        map.addSource('parkingLocationsSource', {
            type: 'geojson',
            data: formattedLocations as GeoJSON.FeatureCollection,
        });

        map.addLayer({
            id: 'parkingLayer',
            type: 'circle',
            source: 'parkingLocationsSource',
            layout: {},
            paint: {
                'circle-color': [
                    'case',
                    ['has', 'total_occupancy'],
                    [
                        'step',
                        ['get', 'total_occupancy'],
                        'grey',
                        0,
                        lightGreen[500],
                        0.33,
                        yellow[500],
                        0.65,
                        orange[500],
                        0.85,
                        red[500],
                    ],
                    'grey',
                ],
                'circle-radius': 6,
                'circle-stroke-color': '#FFF',
                'circle-stroke-width': 2,
            },
        });
    }, [map]);

    const { flyToLocation } = useSelector((state: RootState) => state.parkingWidget);

    useEffect(() => {
        if (!map) return;
        if (!flyToLocation) return;

        map.flyTo({ center: flyToLocation, zoom: 14 });
    }, [map, flyToLocation]);

    return (
        <Stack direction='row' alignItems='stretch' height={600} width={1200}>
            <Paper elevation={0} sx={{ width: '40%', position: 'relative', overflow: 'auto' }}>
                <Box position='sticky' sx={{ bgcolor: 'background.paper', top: 0, px: 2, pt: 2, zIndex: 1 }}>
                    <Typography variant='h6'>Amsterdam Parking</Typography>
                </Box>
                <List>
                    <ListSubheader sx={{ top: 48, bgcolor: 'background.paper' }}>Closest to you</ListSubheader>

                    <ListItem sx={{ pt: 0 }}>
                        <Grid container spacing={1} alignItems='stretch'>
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
                    </ListItem>

                    <ListSubheader sx={{ top: 48, bgcolor: 'background.paper' }}>All locations</ListSubheader>

                    {locations.features.map((location) => (
                        <ParkingLocationListItem
                            key={location.Id}
                            name={location.properties.name}
                            space={
                                Number(location.properties.FreeSpaceShort) + Number(location.properties.FreeSpaceLong)
                            }
                            capacity={
                                Number(location.properties.ShortCapacity) + Number(location.properties.LongCapacity)
                            }
                            location={location.geometry.coordinates as LngLatLike}
                        />
                    ))}
                </List>

                {/* <div>
          <Typography variant="subtitle1" component="h2" color="text.primary">
            Closest to you
          </Typography>
          <Grid container py={1} spacing={1} alignItems="stretch">
            {locations.features.slice(0, 4).map((location) => (
              <Grid item xs={6} key={location.Id}>
                <ParkingLocationHighlight name={location.properties.name} />
              </Grid>
            ))}
          </Grid>
        </div>

        <div>
          <Typography variant="subtitle1" component="h2" color="text.primary">
            All locations
          </Typography>
          <List>
            {locations.features.map((location) => (
              <ParkingLocationListItem
                key={location.Id}
                name={location.properties.name}
              />
            ))}
          </List>
        </div> */}
            </Paper>

            <Box p={1} flexGrow={1} width='60%'>
                <Box sx={{ borderRadius: 6, overflow: 'hidden' }} height='100%'>
                    <MapBoxContainer
                        mapState={[map, setMap]}
                        location={[4.89746, 52.374367] as LngLatLike}
                        zoomLevel={11}
                    />
                </Box>
            </Box>
        </Stack>
    );
}

export default ParkingWidget;
