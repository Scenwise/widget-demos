/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box } from '@mui/material';
import WidgetWrapper from './components/WidgetWrapper';
import CongestionGraph from './components/dashboard/CongestionGraph'
import VehiclePassingGraph from './components/dashboard/VehiclePassingGraph'
import ParkingWidget from './components/parkingWidget/ParkingWidget';
import ExcelParser from './components/riskmap/ExcelParser'
import IntersectionDashboard from './components/dashboard/IntersectionDashboard';

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
        <IntersectionDashboard />
      </WidgetWrapper>
      <ExcelParser></ExcelParser>
    </Box>
  );
}

export default App;
