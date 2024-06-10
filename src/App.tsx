/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import WidgetWrapper from "./components/WidgetWrapper";
import ParkingWidget from "./components/parkingWidget/ParkingWidget";
import RiskMap from "./components/riskmap/RiskMap";
import IntersectionDashboard from "./components/dashboard/IntersectionDashboard";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            width: "100vw",
            height: "90vh",
            placeItems: "center",
            display: "grid",
          }}
          className="boxy"
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        placeItems: "center",
        display: "grid",
      }}
    >
      {/* <Tabs
        value={value}
        onChange={handleChange}
      >
        <Tab label="Risk Map" {...a11yProps(0)} />
        <Tab label="Parking Widget" {...a11yProps(1)} />
        <Tab label="Intersection Dashboard" {...a11yProps(2)} />
        
      </Tabs>
      <TabPanel value={value} index={0}>
        <WidgetWrapper>
          <RiskMap />
        </WidgetWrapper>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <WidgetWrapper>
          <ParkingWidget />
        </WidgetWrapper>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <WidgetWrapper>
          <IntersectionDashboard />
        </WidgetWrapper>
      </TabPanel> */}
      <WidgetWrapper>
        <RiskMap />
      </WidgetWrapper>
    </Box>
  );
}

export default App;
