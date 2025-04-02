import React from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Link from 'next/link';

// Dark theme for the landing page
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5cabdd',
    },
    background: {
      default: '#17212b',
      paper: '#232e3c',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#17212b',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    },
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
            ChartIQ Trading Platform
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            Select which interface you'd like to use:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, justifyContent: 'center' }}>
            <Link href="/tradeapp" passHref style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size="large"
                fullWidth
                sx={{ 
                  py: 2,
                  backgroundImage: 'linear-gradient(to right, #5cabdd, #8774e1)',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(to right, #4a99cb, #7663d0)',
                  }
                }}
              >
                Telegram Mini App UI
              </Button>
            </Link>
            
            <Link href="/chartiq" passHref style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                size="large"
                fullWidth
                sx={{ 
                  py: 2,
                  borderColor: '#2196f3',
                  color: '#2196f3',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                  }
                }}
              >
                Classic ChartIQ UI
              </Button>
            </Link>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
} 