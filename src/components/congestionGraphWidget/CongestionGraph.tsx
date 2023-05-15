import React from "react";
import ReactApexChart from "react-apexcharts";
import "apexcharts/dist/apexcharts.css";
import {Typography} from '@mui/material';

interface State {
  series: number[];
  options: ApexCharts.ApexOptions;
}

function hours() {
  let arr = [];
  for (let i = 0; i < 24; i++) {
    arr.push(i + ":00");
  }
  return arr;
}

function values() {
  let arr = [];
  for (let i = 0; i < 24; i++) {
    arr.push(Math.floor(Math.random() * 100));
  }
  return arr;
}

function getColor(value: number): string {
  if (value < 40) {
    return "#00FF00"; // Green
  } else if (value >= 40 && value < 60) {
    return "#FFFF00"; // Yellow
  } else if (value >= 60 && value < 80) {
    return "#FFA500"; // Orange
  } else {
    return "#FF0000"; // Red
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
          type: "polarArea",
        },
        tooltip: {
          fillSeriesColor: false,
          theme: "light",
          marker: {
            show: false,
          },
        },
        yaxis: {
          tickAmount: 6,
          labels: {
            style: {
              fontSize: "15px",
            },
          },
        },
        labels: labels,
        stroke: {
          colors: colors,
          width: 1,
        },
        fill: {
          opacity: 0.7,
          colors: colors,
        },
        plotOptions: {
          pie: {
            startAngle: -90,
            endAngle: 90,
            offsetY: 10,
          },
        },
        legend: {
          position: "top",
          fontSize: "15px",
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
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "left",
              },
            },
          },
        ],
      },
    };
  }

  render() {
    return (
      <div id="chart">
        <style>
          {`
            .apexcharts-legend {
              border: 1px solid #ccc;
              border-radius: 5px;
              padding: 10px;
            }
          `}
        </style>
        <Typography variant="h6" style={{paddingLeft:'20px', paddingTop:'20px'}}>Proportion of congestion</Typography>
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="polarArea"
        />
      </div>
    );
  }
}

export default ApexChart;
