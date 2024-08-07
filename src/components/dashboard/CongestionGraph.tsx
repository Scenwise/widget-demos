import 'apexcharts/dist/apexcharts.css';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { Typography } from '@mui/material';

interface State {
    series: number[];
    options: ApexCharts.ApexOptions;
}

function hours() {
    const arr = [];
    for (let i = 0; i < 24; i++) {
        arr.push(i + ':00');
    }
    return arr;
}

function values() {
    const arr = [];
    for (let i = 0; i < 24; i++) {
        arr.push(Math.floor(Math.random() * 70));
    }
    arr[5] = 20;
    arr[6] = 80;
    arr[7] = 90;
    arr[8] = 80;
    arr[9] = 70;

    arr[16] = 70;
    arr[17] = 90;
    arr[18] = 95;
    arr[19] = 70;
    return arr;
}

function getColor(value: number): string {
    if (value < 40) {
        return '#8bc34a'; // Green
    } else if (value >= 40 && value < 60) {
        return '#ffeb3b'; // Yellow
    } else if (value >= 60 && value < 80) {
        return '#ff9800'; // Orange
    } else {
        return '#f44336'; // Red
    }
}

class ApexChart extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        const labels = hours();
        const data = values();
        const colors = data.map((value) => getColor(value));

        this.state = {
            series: data,
            options: {
                chart: {
                    type: 'polarArea',
                },
                tooltip: {
                    fillSeriesColor: false,
                    theme: 'light',
                    marker: {
                        show: false,
                    },
                },
                yaxis: {
                    tickAmount: 6,
                    labels: {
                        style: {
                            fontSize: '15px',
                        },
                    },
                },
                title: {
                    text: 'Today',
                    align: 'left',
                    style: {
                        fontSize: '15px',
                        fontWeight: 'normal',
                        fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;",
                    },
                },
                labels: labels,
                stroke: {
                    colors: colors,
                    width: 1,
                },
                fill: {
                    opacity: 0.6,
                    colors: colors,
                },
                plotOptions: {
                    pie: {
                        startAngle: -90,
                        endAngle: 90,
                        offsetY: 10,
                    },
                    polarArea: {
                        rings: {
                            strokeWidth: 2,
                        },
                        spokes: {
                            strokeWidth: 2,
                        },
                    },
                },
                legend: {
                    position: 'top',
                    fontSize: '15px',
                    offsetY: 20,
                    offsetX: 7,
                    width: 80,
                    height: 125,
                    onItemHover: {
                        highlightDataSeries: false,
                    },
                    floating: true,
                    markers: {
                        fillColors: colors,
                    },
                },
            },
        };
    }

    render() {
        return (
            <div style={{ height: '379.7px', overflow: 'hidden', margin: '10px' }}>
                <style>
                    {`
            .apexcharts-legend {
              border: 1px solid #ccc;
              border-radius: 10px;
              padding: 10px;
              background-color: rgba(0, 0, 0, 0.01);
            }
          `}
                </style>
                <Typography variant='h6' style={{ paddingLeft: '5px' }}>
                    Proportion of Congestion
                </Typography>
                <ReactApexChart options={this.state.options} series={this.state.series} type='polarArea' />
            </div>
        );
    }
}

export default ApexChart;
