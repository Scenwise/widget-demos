import React, { useEffect, useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Typography } from '@mui/material';
import AutoSizer from 'react-virtualized-auto-sizer';
import AccidentLocationListItem from './AccidentLocationListItem'; // Import your component
import { AccidentData } from '../../data/interfaces/AccidentData';
import { useSelector } from 'react-redux';
import { pointCoordinates } from './featureCollectionConverter';
import { RootState } from '../../store';

interface AccidentLocationListProps {
    filteredAccidentData: AccidentData[];
}

const AccidentLocationList: React.FC<AccidentLocationListProps> = ({ filteredAccidentData}) => {
  const virtuosoRef = useRef(null);

  const selectedAccidentID = useSelector((state: RootState) => state.accidentsWidget.selectedAccidentID);

  useEffect(() => {
    const index = filteredAccidentData.findIndex(location => location.ID + '' === selectedAccidentID);
    if (index !== -1 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index,
        align: 'center',
        behavior: 'smooth'
      });
    }
  }, [selectedAccidentID, filteredAccidentData]);

  if (filteredAccidentData.length === 0) {
    return <Typography variant="h6">No accidents found.</Typography>;
  }

  return (
    <Virtuoso
      ref={virtuosoRef}
      style={{ height: `230px` }}
      totalCount={filteredAccidentData.length}
      itemContent={(index: number) => {
        const location = filteredAccidentData[index];
        return (
          <AccidentLocationListItem
            key={location.ID}
            id={location.ID + ''}
            name={location.Weg}
            location={pointCoordinates(location)}
            zijde={location.Zijde}
            hmpVan={location["Hmp van"]}
            hmpTot={location["Hmp tot"]}
            ovd={location.ovd ? location.ovd.toTimeString() : ""}
            Startdatum={location.Einddatum.toLocaleString("nl-NL")}
            Einddatum={location.Einddatum.toLocaleString("nl-NL")}
            Eerste_tijd_ter_plaatse={
              location["Eerste tijd ter plaatse"]
                ? location["Eerste tijd ter plaatse"].toTimeString()
                : ""
            }
            Laatste_eindtijd={
              location["Laatste eindtijd"]
                ? location["Laatste eindtijd"].toTimeString()
                : ""
            }
            color={location["Points"] ? "orange" : "red"}
            Proces={location.Proces}
            Melder={location.Melder}
          />
        );
      }}
    />
  );
};

export default AccidentLocationList;
