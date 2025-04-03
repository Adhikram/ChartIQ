import React from 'react';
import { Typography, Box } from '@mui/material';
import { Header } from '../styles/TelegramAppStyles';
import SymbolSearch from '../../SymbolSearch';

interface AppHeaderProps {
  title?: string;
  onSearchSubmit?: (symbol: string) => void;
}

/**
 * Component for the app header
 */
const AppHeader: React.FC<AppHeaderProps> = ({ title = 'TechTrader Analysis', onSearchSubmit }) => {
  return (
    <Header>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 0.5, 
          fontWeight: 'bold', 
          textAlign: 'center',
          fontSize: '1.25rem',
          color: 'white',
        }}
      >
        {title}
      </Typography>
      
      {onSearchSubmit && (
        <Box sx={{ width: '100%', maxWidth: '500px', mt: 0, mb: 0 }}>
          <SymbolSearch onSearchSubmit={onSearchSubmit} />
        </Box>
      )}
    </Header>
  );
};

export default AppHeader; 