import mapboxgl from "mapbox-gl";
import { Route } from "../../data/interfaces/Route";
import * as turf from "@turf/turf";

const animateAlongRoute = (marker: mapboxgl.Marker, newPos: Array<number>, route: Route, map: mapboxgl.Map) => {
  // Reduce the multiline string into a single linestring for easier traversal
  let line = route.coordinates.reduce((acc, segment) => acc.concat(segment), []);

  // Find current and new positions on route and slice the route to that zone only
  const convertedLine = turf.featureCollection(line.map(x => turf.point(x)))
  let startPosition = turf.nearestPoint(marker.getLngLat().toArray(), convertedLine).geometry.coordinates
  let endPosition = turf.nearestPoint(newPos, convertedLine).geometry.coordinates

  const startIndex = line.findIndex(coord => coord[0] === startPosition[0] && coord[1] === startPosition[1])
  const endIndex = line.findIndex(coord => coord[0] === endPosition[0] && coord[1] === endPosition[1])

  line = line.slice(startIndex, endIndex + 1)

  let counter = 0;
  function animate() {
    if(counter === line.length) return;
    marker.setLngLat([line[counter][0], line[counter][1]]).addTo(map);

    // Request the next frame of animation
    requestAnimationFrame(animate)
    counter++;
  }

  animate();
};

export default animateAlongRoute;