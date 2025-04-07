import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AssistantApp } from '../src/components/AssistantApp';
import Head from 'next/head';

// Light theme configuration for ChatGPT-like appearance
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10a37f', // ChatGPT green
    },
    secondary: {
      main: '#6e6e80', // Secondary text color
    },
    background: {
      default: '#ffffff',
      paper: '#f7f7f8',
    },
    text: {
      primary: '#343541',
      secondary: '#6e6e80',
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
          height: '100dvh', // Use dynamic viewport height for mobile
          overflow: 'hidden',
          position: 'fixed',
          width: '100%',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
        },
        html: {
          height: '100%',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        },
        '#__next': {
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        },
      },
    },
  },
});

export default function AssistantPage() {
  return (
    <>
      <Head>
        <title>ChartIQ Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <AssistantApp />
      </ThemeProvider>
    </>
  );
} 