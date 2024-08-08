import { LngLatLike } from 'mapbox-gl';
import { useDispatch } from 'react-redux';

import { Avatar, ListItem, Typography } from '@mui/material';

import { occupancyColor } from './ParkingWidget';
import { updateFlyToLocation } from './parkingWidgetSlice';

interface ParkingLocationHighlightProps {
    name: string;
    space: number;
    capacity: number;
    location: LngLatLike;
}

function ParkingLocationHighlight({ name, space, capacity, location }: ParkingLocationHighlightProps) {
    const dispatch = useDispatch();

    const option = {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
    const formatter = new Intl.NumberFormat(undefined, option);
    const occupancy = formatter.format(space / capacity);

    const color = occupancyColor(space / capacity);

    return (
        <ListItem
            button
            sx={{
                borderRadius: 3,
                bgcolor: 'grey.50',
                flexDirection: 'column',
                alignItems: 'stretch',
                p: 1.5,
            }}
            onClick={() => dispatch(updateFlyToLocation(location))}
        >
            <Avatar sx={{ bgcolor: color[100], color: color[900], mb: 1.5 }}>
                <Typography variant='caption'>{occupancy}</Typography>
            </Avatar>

            <Typography variant='body2' component='h5' noWrap color='text.primary'>
                {name}
            </Typography>

            <Typography variant='caption' component='h6' noWrap color='text.secondary'>
                {space} spots available
            </Typography>
        </ListItem>
    );
}

export default ParkingLocationHighlight;
