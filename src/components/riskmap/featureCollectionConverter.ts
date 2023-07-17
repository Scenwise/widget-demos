import { AccidentData } from "../../data/interfaces/AccidentData";
import { LngLatLike } from 'mapbox-gl';

const segmentCoordinates = (data: AccidentData) => {
    const coordinates: Array<number[]> = []
    data.Points.split(";").forEach(coordinate => {
        const lnglat = coordinate.split(",")
        const points: number[] = []
        lnglat.forEach(x => points.push(Number.parseFloat(x)))
        coordinates.push(points)
    })
    return coordinates
}

const pointCoordinates = (data: AccidentData) => {
    return [data.Longitude_van, data.Latitude_van] as LngLatLike
}

const convertToFeature = (data: AccidentData, segment: string) => {
    const coordinates = segment === "LineString" ? segmentCoordinates(data) : pointCoordinates(data)
    const feature = {
        "id": data.ID,
        "type": "Feature",
        "geometry": {
            "type": segment,
            "coordinates": coordinates
        },
        "properties": {
            "gid": data.ID,
            "weg": data.Weg,
            "hmp_van": data["Hmp van"],
            "hmp_tot": data["Hmp tot"],
            "zijde": data.Zijde,
            "startdatum": data.Starttijd,
            "einddatum": data.Einddatum,
            "proces": data.Proces,
            "beschrijving": data.Beschrijving,
            "melder": data.Melder,
            "Eerste tijd ter plaatse": data["Eerste tijd ter plaatse"],
            "Laatste eindtijd": data["Laatste eindtijd"],
            "ovd": data.ovd
        }
    };
    return feature;
}

const featureCollectionConverter = (dataArray: Array<AccidentData>) => {
    const featureCollectionPoint = {
        type: "FeatureCollection",
        features: [] as Array<unknown>
    }

    const featureCollectionSegment = {
        type: "FeatureCollection",
        features: [] as Array<unknown>
    }

    dataArray.forEach((x) => {
        x["Hmp tot"] ?
            featureCollectionSegment.features.push(convertToFeature(x, "LineString"))
            :
            featureCollectionPoint.features.push(convertToFeature(x, "Point"));
    })
    
    return {featureCollectionPoint, featureCollectionSegment};
}

export default featureCollectionConverter;