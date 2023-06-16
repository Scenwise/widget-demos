import { AccidentData } from "../../data/interfaces/AccidentData";

const convertToFeature = (data: AccidentData) => {
    const feature = {
        "id": data.ID,
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [data.Longitude, data.Latitude]
        },
        "properties": {
            "gid": data.ID,
            "weg": data.Weg,
            "hmp_van": data["Hmp van"],
            "hmp_tot": data["Hmp tot"],
            "zijde": data.Zijde,
            "startdatum": data.Startdatum,
            "einddatum": data.Einddatum,
            "proces": data.Proces,
            "beschrijving": data.Beschrijving,
            "melder": data.Melder
        }
    };
    return feature;
}

const featureCollectionConverter = (dataArray: Array<AccidentData>) => {
    const featureCollection = {
        type: "FeatureCollection",
        feature: [] as Array<unknown>
    }
    featureCollection.feature = dataArray.map(x => convertToFeature(x))
    return featureCollection;
}

export default featureCollectionConverter;