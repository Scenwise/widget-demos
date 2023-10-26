import { Vehicle } from "../../data/interfaces/Vehicle";
import { Route } from "../../data/interfaces/Route";
import * as turf from "@turf/turf";

const findIntersectedRoads = (vehicle: Vehicle, routeTree: any) => {
  // Find corresponding road
  const vehiclePoint = turf.point([vehicle.longitude, vehicle.latitude]);

  // Query the spatial index to find intersecting route bounding boxes
  let intersectingBB = routeTree.current.search({
    minX: vehicle.longitude,
    minY: vehicle.latitude,
    maxX: vehicle.longitude,
    maxY: vehicle.latitude,
  });

  // Find actual roads the vehicle point intersects
  intersectingBB = intersectingBB
  .filter((bbox: any) => !turf.booleanDisjoint(turf.buffer(vehiclePoint, 0.005), bbox.route)) // Use a buffer of 5 meters radius
  .map((bbox: any) => ({
    id: bbox.route.properties.id,
    origin: bbox.route.properties.origin,
    routeId: bbox.route.properties.route_id,
    shapeId: bbox.route.properties.shape_id,
    agencyId: bbox.route.properties.agency_id,
    destination: bbox.route.properties.destinatio,
    routeCommonId: bbox.route.properties.line_numbe,
    routeName: bbox.route.properties.route_name,
    vehicleType: bbox.route.properties.vehicle_ty,
    coordinates: bbox.route.geometry.coordinates
  } as Route))
  .filter((route: Route) => route.agencyId === vehicle.dataOwnerCode)
  return intersectingBB;
};
export default findIntersectedRoads;
