import { Route } from "../../data/interfaces/Route";

const animateVehicles = (marker: mapboxgl.Marker, route: Route) => {
  const lineStrings = route.geometry;
  let currentLineStringIndex = 0;
  let currentPosition = 0;
  const speed = 1;
  let totalSteps = lineStrings[currentLineStringIndex].length;

  function animateStep() {
    if (currentLineStringIndex >= lineStrings.length) {
      // Bus has reached the end of the route
      return;
    }

    if (currentPosition < totalSteps - 1) {
      const [currentLng, currentLat] =
        lineStrings[currentLineStringIndex][currentPosition];
      const [nextLng, nextLat] =
        lineStrings[currentLineStringIndex][currentPosition + 1];

      const easing = (t: number) => t; // You can use different easing functions for smoother animation
      const progress = (currentPosition % totalSteps) / totalSteps;

      const lng = currentLng + (nextLng - currentLng) * easing(progress);
      const lat = currentLat + (nextLat - currentLat) * easing(progress);

      marker.setLngLat([lng, lat]);

      // Update the currentPosition based on the speed
      currentPosition += speed;

      requestAnimationFrame(animateStep);
    } else {
      // Bus has reached the end of the current LineString
      // Move to the next LineString, if available
      currentLineStringIndex += 1;
      if (currentLineStringIndex < lineStrings.length) {
        currentPosition = 0;
        totalSteps = lineStrings[currentLineStringIndex].length;
      } else {
        // Bus has reached the end of the entire route
        currentLineStringIndex = 0;
        currentPosition = 0;
        animateStep();
        return;
      }

      // Continue the animation
      requestAnimationFrame(animateStep);
    }
  }
  animateStep();
};

export default animateVehicles;
