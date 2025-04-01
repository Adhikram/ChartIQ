import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import ChartIQ from './components/ChartIQ';

const theme = createTheme({
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
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChartIQ />
    </ThemeProvider>
  );
}

export default App; 