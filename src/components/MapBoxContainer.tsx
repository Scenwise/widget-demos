/* eslint-disable import/no-webpack-loader-syntax */

import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateFlyToLocation } from './parkingWidget/parkingWidgetSlice';

import 'mapbox-gl/dist/mapbox-gl.css';

// Fix for transpiler issue (see https://github.com/visgl/react-map-gl/issues/1266#issuecomment-1527485925)
// @ts-ignore
import mapboxgl, { LngLatLike } from 'mapbox-gl/dist/mapbox-gl-csp';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';
mapboxgl.workerClass = MapboxWorker;

type mapAndContainer = {
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | null>>;
  mapContainer: React.MutableRefObject<HTMLDivElement | null>;
  location: LngLatLike;
  zoomLevel: number;
  is3D?: boolean;
};

type UseState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

interface MapBoxContainerProps {
  mapState: UseState<mapboxgl.Map | null>;
  location: LngLatLike;
  zoomLevel: number;
  is3D?: boolean;
}

function MapBoxContainer({ mapState, location, zoomLevel, is3D }: MapBoxContainerProps) {
  const [map, setMap] = mapState;
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  useEffect((): void => {
    if (process.env.REACT_APP_MAPBOX_KEY) {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;
    } else {
      throw new Error('Missing accesstoken for mapboxgl');
    }

    if (!map) initializeMap({ setMap, mapContainer, location, zoomLevel, is3D });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const initializeMap = ({ setMap, mapContainer, location, zoomLevel, is3D }: mapAndContainer): void => {
    const center: LngLatLike = location;
    const zoom: number = zoomLevel;
    const pitch: number = is3D ? 45 : 0;
    const map = new mapboxgl.Map({
      container: mapContainer.current as string | HTMLElement,
      style: 'mapbox://styles/ecuzmici/ckxhpe0qo0dkn14lqf9upyv45',
      center,
      pitch,
      zoom,
    });

    map.on('load', async () => {
      setMap(map);
    });

    map.on('move', () => {
      dispatch(updateFlyToLocation(undefined));
    });
  };

  return (
    <div
      ref={(el) => (mapContainer.current = el)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default MapBoxContainer;
