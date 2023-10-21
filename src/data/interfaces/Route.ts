// Data type for routes, taken from GTFS structure

export interface Route {
    id: number,
    origin: string,
    routeId: number,
    shapeId: number,
    agencyId: string,
    destination: string,
    routeCommonId: string, // bus number
    routeName: string,
    vehicleType: string,
    geometry: Array<Array<Array<number>>> // list of lists of coordinate pairs
}