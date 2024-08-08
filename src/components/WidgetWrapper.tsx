import { ReactNode } from 'react';

import { Card } from '@mui/material';

interface WidgetWrapperProps {
    children: ReactNode;
}

function WidgetWrapper({ children }: WidgetWrapperProps) {
    return (
        <Card
            variant='outlined'
            sx={{
                borderRadius: 8,
                minWidth: 800,
                minHeight: 300,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            }}
        >
            {children}
        </Card>
    );
}

export default WidgetWrapper;
