import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AssistantApp from './components/AssistantApp/AssistantApp';

// Light theme configuration
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#5cabdd', // Blue
    },
    secondary: {
      main: '#8774e1', // Purple for accents
    },
    background: {
      default: '#ffffff', // White background
      paper: '#f8f9fa',   // Light gray for cards
    },
    text: {
      primary: '#333333',
      secondary: 'rgba(0, 0, 0, 0.7)',
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
          backgroundColor: '#ffffff',
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
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AssistantApp />
    </ThemeProvider>
  );
}

export default App; 