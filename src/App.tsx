import { Box } from '@mui/material';
import WidgetWrapper from './components/WidgetWrapper';
import CongestionGraph from './components/congestionGraphWidget/CongestionGraph'
import ParkingWidget from './components/parkingWidget/ParkingWidget';

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
        <CongestionGraph />
      </WidgetWrapper>
      <WidgetWrapper>
        <ParkingWidget />
      </WidgetWrapper>
    </Box>
  );
}

export default App;
