import React from 'react';
import { Typography } from '@mui/material';
import { Header } from '../styles/TelegramAppStyles';

interface AppHeaderProps {
  title?: string;
}

/**
 * Component for the app header
 */
const AppHeader: React.FC<AppHeaderProps> = ({ title = 'TechTrader Analysis' }) => {
  return (
    <Header>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 1.5, 
          fontWeight: 'bold', 
          textAlign: 'center',
          fontSize: '1.25rem',
          color: 'white',
        }}
      >
        {title}
      </Typography>
    </Header>
  );
};

export default AppHeader; 