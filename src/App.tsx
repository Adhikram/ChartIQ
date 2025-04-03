import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TelegramTradingApp from './components/TelegramApp/TelegramTradingApp';

// Dark theme configuration for Telegram-like appearance
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5cabdd', // Telegram blue
    },
    secondary: {
      main: '#8774e1', // Nice purple for accents
    },
    background: {
      default: '#17212b', // Telegram dark background
      paper: '#232e3c',   // Slightly lighter for cards
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#17212b',
          height: '100%',
          overflow: 'hidden',
        },
        html: {
          height: '100%',
        },
        '#root': {
          height: '100%',
        },
      },
    },
  },
});

// We've moved the routing to Next.js pages
function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <TelegramTradingApp />
    </ThemeProvider>
  );
}

export default App; 