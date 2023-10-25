import { Route } from "./Route";
import { Vehicle } from "./Vehicle";

export interface VehicleRoutePair {
    marker: mapboxgl.Marker;
    route: Route;
    vehicle: Vehicle;
}