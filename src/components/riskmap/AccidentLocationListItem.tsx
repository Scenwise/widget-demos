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
  Startdatum: string;
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
  Startdatum,
  Einddatum,
  Eerste_tijd_ter_plaatse,
  Laatste_eindtijd,
  color,
  Proces,
  Melder,
}: AccidentLocationListItemProps) => {
  const dispatch = useDispatch();

  if (Proces === "null") Proces = "Unknown";
  if (Melder === "null") Melder = "Unknown";
  return (
    <div style={{ width: "100%" }}>
      {" "}
      {/* Set the desired width */}
      <ListItem
        button
        onClick={() => dispatch(updateFlyToLocation(location))}
        sx={{ alignItems: "flex-start" }}
      >
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
                <b>Road side:</b> {zijde}
              </Typography>
              <Typography variant="body2" component="div">
                <b>From HMP:</b> {hmpVan}
              </Typography>
              {hmpTot && !isNaN(hmpTot) && (
                <>
                  <Typography variant="body2" component="div">
                    <b>To HMP:</b> {hmpTot}
                  </Typography>
                </>
              )}
              <Typography variant="body2" component="div">
                <b>Start time:</b> {Startdatum}
              </Typography>
              <Typography variant="body2" component="div">
                <b>End time:</b> {Einddatum}
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
                    <b>Latest end time:</b> {Laatste_eindtijd.split(" ")[0]}
                  </Typography>
                </>
              )}
              {Eerste_tijd_ter_plaatse && (
                <>
                  <Typography variant="body2" component="div">
                    <b>First time on site:</b>{" "}
                    {Eerste_tijd_ter_plaatse.split(" ")[0]}
                  </Typography>
                </>
              )}
              <Typography variant="body2" component="div">
                <b>Reason:</b> {Proces}
              </Typography>
              <Typography variant="body2" component="div">
                <b>Reporter:</b> {Melder}
              </Typography>
            </>
          }
        />
      </ListItem>
    </div>
  );
};

export default AccidentLocationListItem;
