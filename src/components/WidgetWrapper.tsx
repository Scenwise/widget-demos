import { Card } from '@mui/material';
import { ReactNode } from 'react';

interface WidgetWrapperProps {
  children: ReactNode;
}

function WidgetWrapper({ children }: WidgetWrapperProps) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 8, minWidth: 800, minHeight: 400 }}
    >
      {children}
    </Card>
  );
}

export default WidgetWrapper;
