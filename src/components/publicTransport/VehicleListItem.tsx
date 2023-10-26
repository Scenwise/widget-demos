import { Circle } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateFlyToLocation } from './VehicleSlice';
import { Vehicle } from '../../data/interfaces/Vehicle';
import { Route } from '../../data/interfaces/Route';

interface VehicleListItemProps {
  vehicle: Vehicle,
  route: Route,
  searchText: String
}

function VehicleListItem({
  vehicle,
  route,
  searchText
}: VehicleListItemProps) {
  const dispatch = useDispatch();
  const listKey = vehicle.dataOwnerCode + "-" + vehicle.vehicleNumber

  const matchesSearch = () => {
    const searchQuery = searchText.toLowerCase();
    return (
      listKey.includes(searchQuery) ||
      vehicle.dataOwnerCode.toLowerCase().includes(searchQuery) ||
      vehicle.vehicleNumber.toString().toLowerCase().includes(searchQuery) ||
      route.routeCommonId.toLowerCase().includes(searchQuery) ||
      route.origin.toLowerCase().includes(searchQuery) ||
      route.destination.toLowerCase().includes(searchQuery) ||
      vehicle.journeyNumber.toString().toLowerCase().includes(searchQuery)
    );
  };

  return matchesSearch() ? (
    <ListItemButton onClick={() => dispatch(updateFlyToLocation([vehicle.longitude, vehicle.latitude]))}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        <Circle sx={{ color: "#4ea0b4", fontSize: 20 }} />
      </ListItemIcon>
      <ListItemText
        primary={listKey}
        secondary={
          <div>
            <b>Route:</b> {route.routeCommonId} <br />
            <b>Origin:</b> {route.origin} <br /> 
            <b>Destination:</b> {route.destination} <br />
            <b>Journey number:</b> {vehicle.journeyNumber}
          </div>
        }
      />
    </ListItemButton>
  ) : null;
}

export default VehicleListItem;