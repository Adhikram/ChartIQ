import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Header } from '../styles';

interface AppHeaderProps {
  symbol: string;
  onSymbolClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  symbol,
  onSymbolClick
}) => {
  return (
    <Header>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {/* Title */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '1.05rem',
            color: '#10a37f',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          ChartIQ Assistant
        </Typography>
        
        {/* Symbol button */}
        <Tooltip title="Change symbol" arrow>
          <Box 
            onClick={onSymbolClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(16, 163, 127, 0.1)',
              borderRadius: '1rem',
              padding: '6px 12px',
              cursor: 'pointer',
              border: '1px solid rgba(16, 163, 127, 0.2)',
              transition: 'all 0.2s ease',
              position: 'relative',
              '&:hover': {
                backgroundColor: 'rgba(16, 163, 127, 0.15)',
                boxShadow: '0 2px 5px rgba(16, 163, 127, 0.1)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              }
            }}
          >
            {/* Stock icon */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 0.8,
              color: '#10a37f'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 14L11 10L15 14L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'bold', 
                color: '#10a37f',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {symbol || 'AAPL'}
            </Typography>
            
            {/* Change icon */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              ml: 0.8,
              color: '#10a37f',
              opacity: 0.7
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 9l4-4 4 4m0 6l-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
          </Box>
        </Tooltip>
      </Box>
    </Header>
  );
};

export default AppHeader; 