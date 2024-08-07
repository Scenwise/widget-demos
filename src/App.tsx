/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import WidgetWrapper from './components/WidgetWrapper';
import IntersectionDashboard from './components/dashboard/IntersectionDashboard';
import ParkingWidget from './components/parkingWidget/ParkingWidget';
import RiskMap from './components/riskmap/RiskMap';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box
                    sx={{
                        width: '100vw',
                        height: '90vh',
                        placeItems: 'center',
                        display: 'grid',
                    }}
                    className='boxy'
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
        'aria-controls': `simple-tabpanel-${index}`,
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
                width: '100vw',
                height: '100vh',
                placeItems: 'center',
                display: 'grid',
            }}
        >
            <Tabs value={value} onChange={handleChange}>
                <Tab label='RWS Risk Map (Full)' {...a11yProps(0)} />
                <Tab label='RWS Risk Map' {...a11yProps(1)} />
                <Tab label='Brabant Risk Map' {...a11yProps(2)} />
                <Tab label='Amsterdam Parking' {...a11yProps(3)} />
                <Tab label='Intersection Dashboard' {...a11yProps(4)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <WidgetWrapper>
                    <RiskMap
                        title='Rijkswaterstaat'
                        filePath='./accidents-excel/RWS-accidents-new.xlsx'
                        zoom={7}
                        opacityLevel={4}
                        weight={0.1}
                    />
                </WidgetWrapper>
            </TabPanel>
            <TabPanel value={value} index={1}>
                <WidgetWrapper>
                    <RiskMap
                        title='Rijkswaterstaat'
                        filePath='./accidents-excel/Rijkswaterstaat-accidents.xlsx'
                        zoom={7}
                        opacityLevel={7}
                        weight={1}
                    />
                </WidgetWrapper>
            </TabPanel>
            <TabPanel value={value} index={2}>
                <WidgetWrapper>
                    <RiskMap
                        title='Brabant'
                        filePath='./accidents-excel/brabant2022.xlsx'
                        zoom={8}
                        opacityLevel={7}
                        weight={1}
                    />
                </WidgetWrapper>
            </TabPanel>
            <TabPanel value={value} index={3}>
                <WidgetWrapper>
                    <ParkingWidget />
                </WidgetWrapper>
            </TabPanel>
            <TabPanel value={value} index={4}>
                <WidgetWrapper>
                    <IntersectionDashboard />
                </WidgetWrapper>
            </TabPanel>
        </Box>
    );
}

export default App;
