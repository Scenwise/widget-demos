import React from 'react';

import { Card, Typography } from '@mui/material';

interface DataHighlightComponentProps {
    text: string;
    number: number;
    color: string;
}

function DataHighlightComponent({ text, number, color }: DataHighlightComponentProps) {
    return (
        <Card
            variant='outlined'
            sx={{
                borderRadius: 8,
                width: 300,
                height: 200,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                backgroundColor: color,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px',
                boxSizing: 'border-box',
                position: 'relative',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body1' style={{ fontSize: '0.75rem', textAlign: 'left' }}>
                    Today
                </Typography>
                <Typography variant='h6' style={{ fontSize: '1.5rem', textAlign: 'right' }}>
                    {text}
                </Typography>
            </div>
            <div>
                <Typography variant='body1' style={{ fontSize: '4rem', textAlign: 'left' }}>
                    {number}
                </Typography>
            </div>
        </Card>
    );
}

export default DataHighlightComponent;
