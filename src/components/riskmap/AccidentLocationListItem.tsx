import { LngLatLike } from 'mapbox-gl';

interface AccidentLocationListItemProps {
    name: string;
    location: LngLatLike;
  }

const AccidentLocationListItem = ({name, location}: AccidentLocationListItemProps) => {
    return <div></div>;
}

export default AccidentLocationListItem