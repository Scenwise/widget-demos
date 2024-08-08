import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { LngLatLike } from 'mapbox-gl';
import { Dispatch, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import { updateSelectedAccidentID } from './accidentsWidgetSlice';

export const selectAccidentAction = (map: mapboxgl.Map, dispatch: Dispatch<any>) => {
    map?.on('click', 'accidentsLayerPoint', function (e) {
        if (e.features) {
            const feature = e.features[0];
            dispatch(updateSelectedAccidentID(String(feature?.properties?.gid)));
        }
    });

    changeMousePointers('accidentsLayerPoint', map);
};

export const useSelectAccident = (
    map: mapboxgl.Map,
    geoJSONDataHeatmap: FeatureCollection<Geometry, GeoJsonProperties>,
) => {
    const selectedAccidentID = useSelector((state: RootState) => state.accidentsWidget.selectedAccidentID);

    useEffect(() => {
        if (map && map.getLayer('accidentsLayerPoint') && selectedAccidentID) {
            map!.setPaintProperty('accidentsLayerPoint', 'circle-radius', [
                'case',
                ['==', ['get', 'gid'], selectedAccidentID],
                10,
                6,
            ]);
            map!.setPaintProperty('accidentsLayerPoint', 'circle-stroke-color', [
                'case',
                ['==', ['get', 'gid'], selectedAccidentID],
                'yellow',
                '#FFF',
            ]);
            map!.flyTo({
                center: (
                    geoJSONDataHeatmap?.features.find(
                        (feature) => String(feature?.properties?.gid) === selectedAccidentID,
                    )?.geometry as GeoJSON.Point
                ).coordinates as LngLatLike,
                zoom: 14,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccidentID]);
};

/**
 * Changes the pointer style to tell the user that an element is clickable.
 * @param layer clickable layer
 * @param map
 */
const changeMousePointers = (layer: string, map: mapboxgl.Map): void => {
    //next two listeners change the pointer style
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map.on('mouseenter', layer, function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map.on('mouseleave', layer, function (e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = '';
    });
};
