import React from 'react';
import { Modal, useMediaQuery, useTheme, IconButton, Typography, Box } from '@mui/material';
import { SymbolSelector } from './index';

interface SymbolSearchModalProps {
  open: boolean;
  onClose: () => void;
  currentSymbol: string;
  onSymbolSelect: (symbol: string) => void;
}

const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  open,
  onClose,
  currentSymbol,
  onSymbolSelect
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="symbol-search-modal"
      closeAfterTransition
      BackdropProps={{
        timeout: 300,
        style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: isMobile ? '15%' : '80px',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{
          width: isMobile ? '90%' : '450px',
          height: '80%',
          bgcolor: 'background.paper',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
          p: isMobile ? '1.5rem 1rem' : 2,
          overflowY: 'auto',
          overflowX: 'visible',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(16, 163, 127, 0.2)',
          animation: open ? 'dialogFadeIn 0.3s ease-out' : 'none',
          zIndex: 999,
          position: 'relative',
          '@keyframes dialogFadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          '&::-webkit-scrollbar': {
            width: '5px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(16, 163, 127, 0.3)',
            borderRadius: '8px',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 1.5,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              mr: 1, 
              display: 'flex', 
              backgroundColor: 'rgba(16, 163, 127, 0.1)', 
              p: 0.7, 
              borderRadius: '8px' 
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3V21H21" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 14L11 10L15 14L21 8" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Box>
            <Typography variant="h6" sx={{ color: '#10a37f', fontWeight: 'bold', fontSize: '1.1rem' }}>
              Select Symbol
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: '#666',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              width: '32px',
              height: '32px',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </IconButton>
        </Box>
        
        {/* Search tip */}
        <Box sx={{ 
          mb: 2, 
          backgroundColor: 'rgba(16, 163, 127, 0.05)',
          p: 1.5,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <Box sx={{ 
            display: 'flex', 
            color: '#10a37f',
            backgroundColor: 'white',
            p: 0.7, 
            borderRadius: '50%',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8H12.01" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Box>
          <Typography variant="body2" sx={{ color: '#333', fontSize: '0.85rem' }}>
            Type a stock symbol (e.g., AAPL, MSFT), crypto (e.g., BTCUSDT), or forex pair (e.g., EURUSD)
          </Typography>
        </Box>
        
        {/* Symbol selector container */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <SymbolSelector 
            onSymbolSelect={onSymbolSelect}
            initialValue={currentSymbol}
            onKeyPress={(e) => {
              // Close modal on Escape key
              if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export default SymbolSearchModal; 