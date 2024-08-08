import { LngLatLike } from 'mapbox-gl';
import { useDispatch } from 'react-redux';

import { Circle } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';

import { occupancyColor } from './ParkingWidget';
import { updateFlyToLocation } from './parkingWidgetSlice';

interface ParkingLocationListItemProps {
    name: string;
    space: number;
    capacity: number;
    location: LngLatLike;
}

function ParkingLocationListItem({ name, space, capacity, location }: ParkingLocationListItemProps) {
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
        <ListItem button onClick={() => dispatch(updateFlyToLocation(location))}>
            <ListItemIcon sx={{ minWidth: 28 }}>
                <Circle sx={{ color: color[300], fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText
                primary={name}
                secondary={
                    <>
                        {space} spots available &middot; {occupancy} filled
                    </>
                }
            />
        </ListItem>
    );
}

export default ParkingLocationListItem;
