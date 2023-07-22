import { LngLatLike } from "mapbox-gl";
import { Circle } from "@mui/icons-material";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateFlyToLocation } from "./accidentsWidgetSlice";

interface AccidentLocationListItemProps {
  name: string;
  location: LngLatLike;
  zijde: string;
  hmpVan: number;
  hmpTot: number;
  ovd: string;
  Starttijd: string;
  Einddatum: string;
  Eerste_tijd_ter_plaatse: string;
  Laatste_eindtijd: string;
  color: string;
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
    <div style={{ width: '100%'}}>
      {" "}
      {/* Set the desired width */}
      <ListItem button onClick={() => dispatch(updateFlyToLocation(location))} sx={{ alignItems: 'flex-start' }} >
        <ListItemIcon sx={{ minWidth: 30, paddingTop: 1.1 }}>
          <Circle sx={{ color: color, fontSize: 16 }} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" component="span">
              <b>{name}</b>
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2" component="div">
                <b>Zijde:</b> {zijde}
              </Typography>
              <Typography variant="body2" component="div">
                <b>HMP van:</b> {hmpVan}
              </Typography>
              {hmpTot && (
                <>
                  <Typography variant="body2" component="div">
                    <b>HMP tot:</b> {hmpTot}
                  </Typography>
                </>
              )}
              <Typography variant="body2" component="div">
                <b>Starttijd:</b> {Starttijd.split(" ")[0]}
              </Typography>
              <Typography variant="body2" component="div">
                <b>Einddatum:</b> {Einddatum}
              </Typography>
              {ovd && (
                <>
                  <Typography variant="body2" component="div">
                    <b>OVD:</b> {ovd.split(" ")[0]}
                  </Typography>
                </>
              )}
              {Laatste_eindtijd && (
                <>
                  <Typography variant="body2" component="div">
                    <b>Laatste eindtijd:</b> {Laatste_eindtijd.split(" ")[0]}
                  </Typography>
                </>
              )}
              {Eerste_tijd_ter_plaatse && (
                <>
                  <Typography variant="body2" component="div">
                    <b>Eerste tijd ter plaatse:</b>{" "}
                    {Eerste_tijd_ter_plaatse.split(" ")[0]}
                  </Typography>
                </>
              )}
              <Typography variant="body2" component="div">
                <b>Proces:</b> {Proces}
              </Typography>
              <Typography variant="body2" component="div">
                <b>Melder:</b> {Melder}
              </Typography>
            </>
          }
        />
      </ListItem>
    </div>
  );
};

export default AccidentLocationListItem;
