import React, { useEffect, useRef } from 'react';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDispatch } from 'react-redux';
import { updateFlyToLocation } from './parkingWidget/parkingWidgetSlice';

type mapAndContainer = {
  setMap: React.Dispatch<React.SetStateAction<mapboxgl.Map | null>>;
  mapContainer: React.MutableRefObject<HTMLDivElement | null>;
};

type UseState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

interface MapBoxContainerProps {
  mapState: UseState<mapboxgl.Map | null>;
}

function MapBoxContainer({ mapState }: MapBoxContainerProps) {
  const [map, setMap] = mapState;
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const dispatch = useDispatch();

  useEffect((): void => {
    if (process.env.REACT_APP_MAPBOX_KEY) {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY;
    } else {
      throw new Error('Missing accesstoken for mapboxgl');
    }

    if (!map) initializeMap({ setMap, mapContainer });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const initializeMap = ({ setMap, mapContainer }: mapAndContainer): void => {
    const center: LngLatLike = [4.89746, 52.374367];
    const zoom: number = 11;

    const map = new mapboxgl.Map({
      container: mapContainer.current as string | HTMLElement,
      style: 'mapbox://styles/ecuzmici/ckxhpe0qo0dkn14lqf9upyv45',
      center,
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
