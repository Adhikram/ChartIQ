import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ChartIQ from '../src/components/ChartIQ';

// Chart UI Theme - Original theme
const chartTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#121212',
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

export default function ChartIQPage() {
  return (
    <ThemeProvider theme={chartTheme}>
      <CssBaseline />
      <ChartIQ />
    </ThemeProvider>
  );
} 