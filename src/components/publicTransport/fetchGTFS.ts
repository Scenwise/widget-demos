import axios from "axios";

const fetchGTFS = async (tableName: String) => {
    const res = await axios.get('https://gateway.scenwise.nl/graph-service/geojson/'+tableName);
    const geoData = res.data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
    return geoData;
}

export default fetchGTFS;