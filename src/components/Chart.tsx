import React, { useEffect, useRef } from 'react';
import { TradingViewWidget } from '../types';

// Remove global declaration to avoid conflicts

interface ChartProps {
  symbol: string;
  onSymbolChange: (newSymbol: string) => void;
}

// Define a type for the TradingView object to use with type assertion
type TradingViewType = {
  widget: new (config: any) => TradingViewWidget;
};

const Chart: React.FC<ChartProps> = ({ symbol, onSymbolChange }) => {
  const tradingViewRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChart = () => {
      // Clear container contents
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      if (!document.getElementById('tradingview-script')) {
        const script = document.createElement('script');
        script.id = 'tradingview-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          initializeWidget();
        };
        document.head.appendChild(script);
      } else {
        initializeWidget();
      }
    };

    const initializeWidget = () => {
      // Check if both TradingView is defined and container exists
      if (!containerRef.current) {
        console.error('Container element not found');
        return;
      }
      
      if (typeof window.TradingView === 'undefined') {
        console.error('TradingView not loaded');
        return;
      }
      
      try {
        // Generate a unique ID for the container
        const containerId = `tradingview-container-${Date.now()}`;
        containerRef.current.id = containerId;
        
        // Use type assertion to help TypeScript understand the TradingView object
        const TradingView = window.TradingView as TradingViewType;
        tradingViewRef.current = new TradingView.widget({
          container_id: containerId,
          symbol: symbol,
          interval: '1D',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: 'rgba(0, 0, 0, 0)',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: true,
          height: '100%',
          width: '100%',
          hideideas: true,
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies',
          ],
          autosize: true,
          fullscreen: false,
          hide_side_toolbar: false,
          withdateranges: true,
          hide_volume: false,
          details: true,
          hotlist: true,
          calendar: true,
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          symbol_change_callback: (symbolData: any) => {
            onSymbolChange(symbolData.name);
          }
        });
        
        const handleResize = () => {
          if (tradingViewRef.current && 'resize' in tradingViewRef.current) {
            try {
              tradingViewRef.current.resize();
            } catch (e) {
              console.error('Error resizing chart:', e);
            }
          }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      } catch (error) {
        console.error('Error initializing TradingView widget:', error);
      }
    };

    // Initialize chart whenever symbol changes
    initializeChart();
  }, [symbol, onSymbolChange]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default Chart; 