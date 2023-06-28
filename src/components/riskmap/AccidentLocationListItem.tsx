import { LngLatLike } from 'mapbox-gl';
import { Circle } from '@mui/icons-material';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateFlyToLocation } from './accidentsWidgetSlice';

interface AccidentLocationListItemProps {
    name: string,
    location: LngLatLike
    zijde: string
    hmpVan: number
    hmpTot: number
    ovd: string
    Starttijd: string 
    Einddatum: string
    Eerste_tijd_ter_plaatse: string
    Laatste_eindtijd: string
    color: string
    Proces: string; 
    Melder: string;
  }

const AccidentLocationListItem = ({
  name, 
  location, 
  zijde, 
  hmpVan, 
  hmpTot,
  ovd,
  Starttijd,
  Einddatum,
  Eerste_tijd_ter_plaatse,
  Laatste_eindtijd,
  color,
  Proces, 
  Melder,
}: AccidentLocationListItemProps) => {

  const dispatch = useDispatch();

  return (
    <ListItem button onClick={() => dispatch(updateFlyToLocation(location))}>
      <ListItemIcon sx={{ minWidth: 28 }}>
        <Circle sx={{ color: color, fontSize: 16 }} />
      </ListItemIcon>
      <ListItemText
        primary={name}
        secondary={
          <>
            Zijde {zijde}, HMP van {hmpVan}
            {hmpTot? " tot " + hmpTot.toString():""} 
            {", Starttijd: " + Starttijd.split(" ")[0]}
            {", Einddatum: " + Einddatum}
            {ovd? ", OVD: " + ovd.split(" ")[0]: ""}
            {Laatste_eindtijd? ", Laatste_eindtijd: " + Laatste_eindtijd.split(" ")[0]: ""}
            {Eerste_tijd_ter_plaatse? ", Eerste_tijd_ter_plaatse: "+Eerste_tijd_ter_plaatse.split(" ")[0]: ""}
            {", Proces: " + Proces + ", Melder: "+ Melder}
          </>
        }
      />
    </ListItem>
  );
}

export default AccidentLocationListItem