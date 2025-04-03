import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import '../src/index.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  // Simple iOS scroll fix
  useEffect(() => {
    // Handle viewport settings for iOS
    const updateViewportMeta = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    };
    
    // Call on orientation change
    window.addEventListener('orientationchange', updateViewportMeta);
    
    return () => {
      window.removeEventListener('orientationchange', updateViewportMeta);
    };
  }, []);
  
  return (
    <>
      <Head>
        <title>ChartIQ Trading Platform</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="description" content="Advanced trading analysis and charting platform" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
} 