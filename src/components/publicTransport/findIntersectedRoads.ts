import { Vehicle } from "../../data/interfaces/Vehicle";
import { Route } from "../../data/interfaces/Route";
import * as turf from "@turf/turf";

const findIntersectedRoads = (vehicle: Vehicle, routeTree: any) => {
  // Find corresponding road
  const vehiclePoint = turf.point([vehicle.longitude, vehicle.latitude]);

  // Query the spatial index to find intersecting route bounding boxes
  const intersectingBB = routeTree.current.search({
    minX: vehicle.longitude,
    minY: vehicle.latitude,
    maxX: vehicle.longitude,
    maxY: vehicle.latitude,
  });

  // Find actual roads the vehicle point intersects
  var intersectedRoads = new Array<Route>();
  for (var bbox of intersectingBB) {
    // Use a buffer of 2 meters radius to account for precision issues
    if (!turf.booleanDisjoint(turf.buffer(vehiclePoint, 0.002), bbox.route)) {
      intersectedRoads.push({
        id: bbox.route.properties.id,
        origin: bbox.route.properties.origin,
        routeId: bbox.route.properties.route_id,
        shapeId: bbox.route.properties.shape_id,
        agencyId: bbox.route.properties.agency_id,
        destination: bbox.route.properties.destinatio,
        routeCommonId: bbox.route.properties.line_numbe,
        routeName: bbox.route.properties.route_name,
        vehicleType: bbox.route.properties.vehicle_ty,
        geometry: bbox.route.geometry
      });
    }
  }
  return intersectedRoads;
};

export default findIntersectedRoads;
