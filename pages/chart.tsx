import React, { useEffect, useRef } from 'react';
import { Box, styled } from '@mui/material';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for TradingView
const TradingViewWidget = dynamic(
  () => {
    return Promise.resolve((props: any) => {
      const { containerId, ...options } = props;
      
      useEffect(() => {
        // Only import and initialize TradingView on the client side
        const initWidget = async () => {
          try {
            // Make sure the container element exists
            const container = document.getElementById(containerId);
            if (!container) {
              console.error(`Container with ID "${containerId}" not found`);
              return;
            }

            // Clear any previous content
            container.innerHTML = '';
            
            // Load the TradingView script
            if (!window.TradingView?.widget) {
              const script = document.createElement('script');
              script.src = 'https://s3.tradingview.com/tv.js';
              script.async = true;
              script.onload = () => createWidget(container, options);
              script.onerror = () => console.error('Failed to load TradingView script');
              document.head.appendChild(script);
            } else {
              createWidget(container, options);
            }
          } catch (err) {
            console.error('Error initializing TradingView widget:', err);
          }
        };
        
        // Create the actual widget
        const createWidget = (container: HTMLElement, options: any) => {
          try {
            if (window.TradingView?.widget) {
              new window.TradingView.widget({
                ...options,
                container_id: containerId,
              });
            }
          } catch (error) {
            console.error('Error creating TradingView widget:', error);
          }
        };
        
        initWidget();
        
        // Cleanup function
        return () => {
          const container = document.getElementById(containerId);
          if (container) {
            container.innerHTML = '';
          }
        };
      }, [containerId, options]);
      
      // Return the container div for the widget
      return <div id={containerId} style={{ height: '100%', width: '100%' }} />;
    });
  },
  { ssr: false } // Critical: Disable server-side rendering
);

// TypeScript declaration for TradingView
declare global {
  interface Window {
    TradingView?: {
      widget: new (config: any) => any;
    };
  }
}

// Styled container
const ChartContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100vh',
  border: 'none',
  overflow: 'hidden',
}));

const TradingViewChart: React.FC = () => {
  const chartContainerId = useRef<string>(`tradingview-widget-${Math.random().toString(36).substring(2, 9)}`);
  const defaultSymbol = 'BINANCE:BTCUSDT';
  
  return (
    <>
      <Head>
        <title>Trading Chart</title>
        <meta name="description" content="TradingView chart" />
      </Head>

      <ChartContainer>
        <TradingViewWidget
          containerId={chartContainerId.current}
          symbol={defaultSymbol}
          interval="D"
          theme="light"
          locale="en"
          toolbar_bg="#f5f5f5"
          enable_publishing={false}
          hide_top_toolbar={false}
          hide_side_toolbar={false}
          allow_symbol_change={false}
          details={false}
          hotlist={false}
          calendar={false}
          studies={["RSI@tv-basicstudies", "MACD@tv-basicstudies", "BB@tv-basicstudies"]}
          withdateranges={false}
          show_popup_button={false}
          popup_width="1000"
          popup_height="650"
          autosize={true}
          hide_tradingview_branding={true}
          hide_legend={true}
          fullscreen={false}
          save_image={false}
 
        />
      </ChartContainer>
    </>
  );
};

export default TradingViewChart; 