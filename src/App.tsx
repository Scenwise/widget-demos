import { Box } from '@mui/material';
import React from 'react';
import ParkingWidget from './components/parkingWidget/ParkingWidget';
import WidgetWrapper from './components/WidgetWrapper';

function App() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        placeItems: 'center',
        display: 'grid',
      }}
    >
      <WidgetWrapper>
        <ParkingWidget />
      </WidgetWrapper>
    </Box>
  );
}

export default App;
