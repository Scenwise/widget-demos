import 'apexcharts/dist/apexcharts.css';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { Typography } from '@mui/material';

interface State {
    series: {
        name: string;
        data: number[];
    }[];
    options: ApexCharts.ApexOptions;
}

class ApexChart extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            series: [
                {
                    name: 'Vehicle passing',
                    data: [300, 200, 500, 450, 150, 100, 600],
                },
                {
                    name: 'Violation',
                    data: [100, 200, 100, 150, 350, 400, 20],
                },
            ],
            options: {
                chart: {
                    type: 'area',
                    zoom: {
                        enabled: false,
                    },
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    curve: 'straight',
                },
                colors: ['#8EB7DA', '#DA8EB7'],
                title: {
                    text: 'Last 7 days',
                    align: 'left',
                    style: {
                        fontSize: '15px',
                        fontWeight: 'normal',
                        fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;",
                    },
                },
                labels: ['14/05', '15/05', '16/05', '17/05', '18/05', '19/05', '20/05'],
                legend: {
                    horizontalAlign: 'right',
                    position: 'top',
                    fontSize: '15px',
                    width: 130,
                    offsetX: 580,
                },
            },
        };
    }

    render() {
        return (
            <div style={{ padding: '10px' }}>
                <Typography variant='h6' style={{ paddingLeft: '5px' }}>
                    Trend of Vehicle Passing and Violation
                </Typography>
                <ReactApexChart options={this.state.options} series={this.state.series} height='400' type='area' />
            </div>
        );
    }
}

export default ApexChart;
