import { Circle } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateFlyToLocation } from './VehicleSlice';
import { Vehicle } from '../../data/interfaces/Vehicle';
import { Route } from '../../data/interfaces/Route';

interface VehicleListItemProps {
  vehicle: Vehicle,
  route: Route
}

function VehicleListItem({
  vehicle,
  route
}: VehicleListItemProps) {
  const dispatch = useDispatch();

  console.log(route)

  return (
    <ListItem button onClick={() => dispatch(updateFlyToLocation([vehicle.longitude, vehicle.latitude]))}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        <Circle sx={{ color: "#4ea0b4", fontSize: 20 }} />
      </ListItemIcon>
      <ListItemText
        primary={vehicle.dataOwnerCode + "-" + vehicle.vehicleNumber}
        secondary={
          <div>
            <b>Route:</b> {route.routeCommonId} <br />
            <b>Origin:</b> {route.origin} <br /> 
            <b>Destination:</b> {route.destination} <br />
            <b>Journey number:</b> {vehicle.journeyNumber}
          </div>
        }
      />
    </ListItem>
  );
}

export default VehicleListItem;