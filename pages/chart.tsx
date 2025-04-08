import React, { useEffect, useRef } from 'react';
import { Box, styled } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

// Styled container
const ChartContainer = styled(Box)({
  width: '100%',
  height: '100vh',
  border: 'none',
  overflow: 'hidden',
});

// Make component client-side only
const TradingViewChart: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (!container.current) return;
    
    // Get query parameters from URL
    const { symbol, interval } = router.query;
    console.log(`symbol: ${symbol}, interval: ${interval}`);
    
    // Use default values if parameters are not provided
    const defaultSymbol = 'BINANCE:BTCUSDT';
    const defaultInterval = 'D';
    
    const chartSymbol = typeof symbol === 'string' ? symbol : defaultSymbol;
    const chartInterval = typeof interval === 'string' ? interval : defaultInterval;
    
    // Set page title based on symbol and interval
    document.title = `${chartSymbol} (${chartInterval}) - Trading Chart`;
    
    // Clear any existing content
    container.current.innerHTML = `
      <div class="tradingview-widget-container__widget" style="height: calc(100% - 32px); width: 100%;"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span class="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    `;
    
    // Create and inject the script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${chartSymbol}",
        "interval": "${chartInterval}",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f5f5f5",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "calendar": false,
        "studies": ["RSI@tv-basicstudies", "MACD@tv-basicstudies", "BB@tv-basicstudies"],
        "hide_legend": true,
        "support_host": "https://www.tradingview.com",
        "saved_data": "${chartSymbol}_${chartInterval}",
        "container_id": "tradingview_chart"
      }
    `;
    
    container.current.appendChild(script);
    
    // Set up TradingView message handler to capture symbol changes
    const handleTradingViewMessage = (event: MessageEvent) => {
      if (
        event.data && 
        typeof event.data === 'object' && 
        (
          (event.data.name === 'tv-widget-symbol-changed' && event.data.symbol) ||
          (event.data.type === 'symbol-change' && event.data.symbol)
        )
      ) {
        const newSymbol = event.data.symbol;
        const currentInterval = chartInterval;
        
        // Update URL without refreshing the page
        router.push(
          { 
            pathname: '/chart', 
            query: { 
              symbol: newSymbol, 
              interval: currentInterval 
            } 
          },
          undefined,
          { shallow: true }
        );
      }
    };
    
    // Add global event listener for TradingView messages
    window.addEventListener('message', handleTradingViewMessage);
    
    // Cleanup function
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
      window.removeEventListener('message', handleTradingViewMessage);
    };
  }, [router, router.query]); // Re-run when router.query changes
  
  return (
    <>
      <Head>
        <title>Trading Chart</title>
        <meta name="description" content="TradingView chart" />
      </Head>

      <ChartContainer>
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}></div>
      </ChartContainer>
    </>
  );
};

export default TradingViewChart; 