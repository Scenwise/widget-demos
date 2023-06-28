import React from 'react';
import { Grid } from '@mui/material';
import CongestionGraph from './CongestionGraph';
import VehiclePassingGraph from './VehiclePassingGraph';
import WidgetWrapper from '../WidgetWrapper';
import DataHighlightComponent from './DataHighlightComponent';

function getColor(value: number): string {
    if (value < 40) {
      return "#a7c97a"; // Green, approximately 20% lighter
    } else if (value >= 40 && value < 60) {
      return "#ffd180"; // Yellow, approximately 20% lighter
    } else if (value >= 60 && value < 80) {
      return "#ffa94d"; // Orange, approximately 20% lighter
    } else {
      return "#f8847a"; // Red, approximately 20% lighter
    }
}

const vehiclePassing = 200;
const congestion = 50;
const violation = 10;

class IntersectionDashboard extends React.Component {
  render() {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8f8f8' }} >
        <Grid container spacing={2}>
          <Grid item xs={4} container justifyContent="center" alignItems="center" height="100%">
            <DataHighlightComponent text="Vehicle passing" number={vehiclePassing} color='#8EB7DA'/>
          </Grid>
          <Grid item xs={4} container justifyContent="center" alignItems="center" height="100%">
            <DataHighlightComponent text="Violation" number={violation} color='#DA8EB7'/>
          </Grid>
          <Grid item xs={4} container justifyContent="center" alignItems="center" height="100%">
            <DataHighlightComponent text="Average proportion of congestion" number={congestion} color={getColor(congestion)}/>
          </Grid>
        </Grid>

        {/* Add a space between the two rows */}
        <div style={{ marginTop: '20px' }} />

        <Grid container spacing={5} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={6}>
            <WidgetWrapper>
              <CongestionGraph />
            </WidgetWrapper>
          </Grid>
          <Grid item xs={6}>
            <WidgetWrapper>
              <VehiclePassingGraph />
            </WidgetWrapper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default IntersectionDashboard;
