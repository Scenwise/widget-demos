import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import { VehicleRoutePair } from "../../data/interfaces/VehicleRoutePair";

const animateAlongRoute = (vehicleRoutePair: VehicleRoutePair, newPosition: Array<number>, map: mapboxgl.Map) => {

  // Reduce the multiline string into a single linestring for easier traversal
  let line = vehicleRoutePair.route.coordinates.flat();

  // Find current and new positions on route and slice the route to that zone only
  const convertedLine = turf.featureCollection(line.map(x => turf.point(x)))
  let startPosition = turf.nearestPoint(vehicleRoutePair.marker.getLngLat().toArray(), convertedLine).geometry.coordinates
  let endPosition = turf.nearestPoint(newPosition, convertedLine).geometry.coordinates

  // If distance between actual location and location on route is > 100 meters, we misintersected
  if(turf.distance(turf.point(endPosition), turf.point(newPosition)) > 0.1) return false;

  let startIndex = line.findIndex(coord => coord[0] === startPosition[0] && coord[1] === startPosition[1])
  let endIndex = line.findIndex(coord => coord[0] === endPosition[0] && coord[1] === endPosition[1])

  let increment = 1
  if(startIndex > endIndex) increment = -1 // if start is after end in the route, we move backwards

  let counter = startIndex
  function animate() {
    // If decreasing, we start from endIndex
      if(counter === endIndex + increment) return;
      vehicleRoutePair.marker.setLngLat([line[counter][0], line[counter][1]]).addTo(map);

      // Request the next frame of animation
      counter += increment;
      requestAnimationFrame(animate)
  }
 
  animate();
  return true;
};

export default animateAlongRoute;