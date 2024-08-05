import { AccidentData } from "../../data/interfaces/AccidentData";
import { LngLatLike } from "mapbox-gl";

const segmentCoordinates = (data: AccidentData) => {
  const coordinates: Array<number[]> = [];
  if (data["Points"] !== undefined && data["Points"] !== "") {
    data.Points.split(";").forEach((coordinate) => {
      const lnglat = coordinate.split(",");
      const points: number[] = [];
      lnglat.forEach((x) => points.push(Number.parseFloat(x)));
      coordinates.push(points);
    });
  } else {
    coordinates.push([data["Longitude_van"], data["Latitude_van"]]);
    coordinates.push([data["Longitude_tot"], data["Latitude_tot"]]);
  }
  return coordinates;
};

export const pointCoordinates = (data: AccidentData) => {
  if (data.Longitude !== undefined && data.Latitude !== undefined) {
    const log10Long = Math.log10(data.Longitude);
    const exponentLong = Math.floor(log10Long);
    const longitude = data.Longitude / Math.pow(10, exponentLong);

    const log10Lat = Math.log10(data.Latitude);
    const exponentLat = Math.floor(log10Lat);
    const latitude = data.Latitude / Math.pow(10, exponentLat - 1);
    return [longitude, latitude] as LngLatLike;
  }
  return [data.Longitude_van, data.Latitude_van] as LngLatLike;
};

const convertToFeature = (data: AccidentData, segment: string) => {
  const coordinates =
    segment === "LineString"
      ? segmentCoordinates(data)
      : pointCoordinates(data);
  const feature = {
    id: data.ID,
    type: "Feature",
    geometry: {
      type: segment,
      coordinates: coordinates,
    },
    properties: {
      gid: data.ID + "",
      weg: data.Weg,
      hmp_van: data["Hmp van"],
      hmp_tot: data["Hmp tot"],
      zijde: data.Zijde,
      starttijd: data.Starttijd,
      eindtijd: data.Eindtijd,
      startdatum: data.Startdatum,
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
    if (x["Points"] !== undefined && x["Points"] !== "")
      featureCollectionSegment.features.push(convertToFeature(x, "LineString"));
    // else if (
    //   x["Longitude_tot"] !== -1 &&
    //   (x["Longitude_van"] !== x["Longitude_tot"] ||
    //     x["Latitude_van"] !== x["Latitude_tot"])
    // )
    //   featureCollectionSegment.features.push(convertToFeature(x, "LineString"));
    else featureCollectionPoint.features.push(convertToFeature(x, "Point"));
    // For the heatmap, all features need to be points
    fullFeatureCollection.features.push(convertToFeature(x, "Point"));
  });

  return {
    featureCollectionPoint,
    featureCollectionSegment,
    fullFeatureCollection,
  };
};

export default featureCollectionConverter;
