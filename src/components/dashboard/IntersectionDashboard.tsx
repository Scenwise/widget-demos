import React from 'react';

import { Grid } from '@mui/material';

import WidgetWrapper from '../WidgetWrapper';
import CongestionGraph from './CongestionGraph';
import DataHighlightComponent from './DataHighlightComponent';
import VehiclePassingGraph from './VehiclePassingGraph';

function getColor(value: number): string {
    if (value < 40) {
        return '#a7c97a'; // Green, approximately 20% lighter
    } else if (value >= 40 && value < 60) {
        return '#ffd180'; // Yellow, approximately 20% lighter
    } else if (value >= 60 && value < 80) {
        return '#ffa94d'; // Orange, approximately 20% lighter
    } else {
        return '#f8847a'; // Red, approximately 20% lighter
    }
}

const vehiclePassing = 200;
const congestion = 50;
const violation = 10;

class IntersectionDashboard extends React.Component {
    render() {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f8f8f8' }}>
                <Grid container justifyContent='center' alignItems='center' spacing={20}>
                    <Grid item justifyContent='center' alignItems='center' height='100%'>
                        <DataHighlightComponent text='Vehicle passing' number={vehiclePassing} color='#8EB7DA' />
                    </Grid>
                    <Grid item justifyContent='center' alignItems='center' height='100%'>
                        <DataHighlightComponent text='Violation' number={violation} color='#DA8EB7' />
                    </Grid>
                    <Grid item justifyContent='center' alignItems='center' height='100%'>
                        <DataHighlightComponent
                            text='Average proportion of congestion'
                            number={congestion}
                            color={getColor(congestion)}
                        />
                    </Grid>
                </Grid>

                <div style={{ marginTop: '20px' }} />

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                    }}
                >
                    <WidgetWrapper>
                        <CongestionGraph />
                    </WidgetWrapper>
                    <div style={{ padding: '10px' }}> </div>
                    <WidgetWrapper>
                        <VehiclePassingGraph />
                    </WidgetWrapper>
                </div>
            </div>
        );
    }
}

export default IntersectionDashboard;
