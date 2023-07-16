import { AccidentData } from "../../data/interfaces/AccidentData";
import { LngLatLike } from "mapbox-gl";

const convertToFeaturePoint = (data: AccidentData) => {
  const feature = {
    id: data.ID,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [data.Longitude_van, data.Latitude_van] as LngLatLike,
    },
    properties: {
      gid: data.ID,
      weg: data.Weg,
      hmp_van: data["Hmp van"],
      hmp_tot: data["Hmp tot"],
      zijde: data.Zijde,
      startdatum: data.Starttijd,
      einddatum: data.Einddatum,
      proces: data.Proces,
      beschrijving: data.Beschrijving,
      melder: data.Melder,
      "Eerste tijd ter plaatse": data["Eerste tijd ter plaatse"],
      "Laatste eindtijd": data["Laatste eindtijd"],
      ovd: data.ovd,
    },
  };
  return feature;
};

const convertToFeatureSegment = (data: AccidentData) => {
  const feature = {
    id: data.ID,
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [data.Longitude_van, data.Latitude_van] as LngLatLike,
        [data.Longitude_tot, data.Latitude_tot] as LngLatLike,
      ],
    },
    properties: {
      gid: data.ID,
      weg: data.Weg,
      hmp_van: data["Hmp van"],
      hmp_tot: data["Hmp tot"],
      zijde: data.Zijde,
      startdatum: data.Starttijd,
      einddatum: data.Einddatum,
      proces: data.Proces,
      beschrijving: data.Beschrijving,
      melder: data.Melder,
      "Eerste tijd ter plaatse": data["Eerste tijd ter plaatse"],
      "Laatste eindtijd": data["Laatste eindtijd"],
      ovd: data.ovd,
    },
  };
  return feature;
};

const featureCollectionConverter = (dataArray: Array<AccidentData>) => {
  const featureCollectionPoint = {
    type: "FeatureCollection",
    features: [] as Array<unknown>,
  };

  const featureCollectionSegment = {
    type: "FeatureCollection",
    features: [] as Array<unknown>,
  };

  const fullFeatureCollection = {
    type: "FeatureCollection",
    features: [] as Array<unknown>,
  };

  dataArray.forEach((x) => {
    x["Hmp tot"]
      ? featureCollectionSegment.features.push(convertToFeatureSegment(x))
      : featureCollectionPoint.features.push(convertToFeaturePoint(x));
    fullFeatureCollection.features.push(convertToFeaturePoint(x));
  });

  return {
    featureCollectionPoint,
    featureCollectionSegment,
    fullFeatureCollection,
  };
};

export default featureCollectionConverter;
