import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert, 
  TextField, 
  Button, 
  IconButton, 
  Collapse, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemButton, 
  ListItemAvatar, 
  Avatar, 
  Divider,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatService from '../services/chatService';
import { ChatMessage, StyledProps, TradingViewWidget } from '../types';
import ReactMarkdown from 'react-markdown';

// Styled components with improved sizing and spacing
const ChartContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: 0,
  margin: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
}));

const AnalysisContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: 0,
  margin: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  borderRadius: 4,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
}));

const MessageThread = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
}));

const Message = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  backgroundColor: isUser 
    ? 'rgba(25, 118, 210, 0.15)' 
    : 'rgba(255, 255, 255, 0.05)',
  color: theme.palette.text.primary,
  maxWidth: '90%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  wordBreak: 'break-word',
  border: isUser 
    ? '1px solid rgba(25, 118, 210, 0.2)' 
    : '1px solid rgba(255, 255, 255, 0.1)',
}));

// Sidebar component with improved styling
const Sidebar = styled(Box)(({ theme }: StyledProps) => ({
  width: 250,
  height: '100%',
  borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
  overflow: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
}));

// Main content area
const MainArea = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

// StyledDrawer component with matching styling
const StyledDrawer = styled(Drawer)(({ theme }: StyledProps) => ({
  width: 250,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 250,
    boxSizing: 'border-box',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: theme.shadows[5],
  },
}));

const HistoryListItem = styled(ListItem)(({ theme }: StyledProps) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Improved stream message
const StreamingMessage = styled(Box)(({ theme }: StyledProps) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(25, 118, 210, 0.2)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  margin: theme.spacing(1, 0),
  position: 'relative',
  transition: 'all 0.3s ease',
}));

// Polished status badge
const StatusBadge = styled(Box)<{ status: string }>(({ theme, status }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  ...(status === 'COMPLETED' && {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    color: '#fff',
    border: '1px solid rgba(46, 125, 50, 0.5)',
  }),
  ...(status === 'ANALYZING' && {
    backgroundColor: theme.palette.info.dark,
    color: '#fff',
    border: '1px solid rgba(25, 118, 210, 0.5)',
  }),
  ...(status === 'GENERATING_CHARTS' && {
    backgroundColor: theme.palette.warning.dark,
    color: '#fff',
    border: '1px solid rgba(237, 108, 2, 0.5)',
  }),
  ...(status === 'FAILED' && {
    backgroundColor: theme.palette.error.dark,
    color: '#fff',
    border: '1px solid rgba(211, 47, 47, 0.5)',
  }),
}));

const StatusChip = styled(Chip)(({ theme, color }: any) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  ...(color === 'success' && {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '0.7rem',
  }),
}));

// Modify FullHeightBox to use full viewport
const FullHeightBox = styled(Box)({
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: '#121212',
});

const ContentBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

// Make the section header more polished
const SectionHeaderContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  backgroundColor: 'rgba(25, 118, 210, 0.08)',
  color: theme.palette.text.primary,
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
  fontSize: '1rem',
  gap: theme.spacing(2),
}));

// Enhanced tabs
const NavTabs = styled(Tabs)(({ theme }: StyledProps) => ({
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiTab-root': {
    textTransform: 'uppercase',
    minWidth: 100,
    fontWeight: 'bold',
    minHeight: 48,
    padding: '6px 16px',
    transition: 'all 0.2s ease',
  },
  '& .Mui-selected': {
    color: '#1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#1976d2',
    height: 3,
  },
}));

// Update SymbolDisplayBox styling
const SymbolDisplayBox = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginLeft: 'auto',
  marginRight: theme.spacing(2),
  backgroundColor: 'rgba(25, 118, 210, 0.12)',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(25, 118, 210, 0.2)',
}));

// More minimal input container
const InputContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  marginTop: 'auto',
  backgroundColor: 'transparent', // Remove dark background
  borderRadius: 0,
  borderTop: `1px solid ${theme.palette.divider}`, // Simple divider
}));

// Update the TabPanel to use percentage-based height
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      style={{ height: 'calc(100% - 48px)', padding: 0, overflow: 'hidden' }}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%', width: '100%', overflow: 'hidden' }}>{children}</Box>}
    </div>
  );
}

// Interface for analysis history items
interface AnalysisItem {
  id: string;
  symbol: string;
  status: string;
  createdAt: string;
  messages: {
    id: string;
    content: string;
    role: string;
    timestamp: string;
  }[];
  chartUrls: string[];
}

// Add TradingView MediumWidget interface
interface TradingViewSymbolData {
  name: string;
  pro_name?: string;
  exchange?: string;
  [key: string]: any;
}

// Handle messages from TradingView
interface TradingViewSymbolMessage {
  name?: string;
  type?: string;
  method?: string;
  symbol?: string;
  params?: string[];
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => TradingViewWidget;
    };
  }
}

// More polished button
const AnalyzeButton = styled(Button)(({ theme }: StyledProps) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.75, 2),
  fontWeight: 'bold',
  textTransform: 'uppercase',
  minWidth: '100px',
  backgroundImage: 'linear-gradient(to right, #1565C0, #0D47A1)',
  '&:hover': {
    backgroundImage: 'linear-gradient(to right, #0D47A1, #0A2472)',
  },
}));

// Add a custom symbol search component for TradingView
const TradingViewSymbolSearch = styled(Box)(({ theme }: StyledProps) => ({
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  width: '100%',
  maxWidth: '400px',
}));

const ChartIQ: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('BINANCE:BTCUSDT');
  const [showChart, setShowChart] = useState(true); // Default to showing chart
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for Dashboard, 1 for Chat
  const tradingViewRef = useRef<any>(null);
  const chartContainerId = useRef<string>(`tradingview-widget-${Math.random().toString(36).substring(2, 9)}`);
  const symbolSearchContainerId = useRef<string>(`symbol-search-${Math.random().toString(36).substring(2, 9)}`);
  const symbolRef = useRef<string>('BINANCE:BTCUSDT');
  const chatService = useRef(ChatService.getInstance());
  const messageThreadRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDarkMode = false; // Default theme
  const [searchInput, setSearchInput] = useState<string>('');

  // Update the ref when symbol changes
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Load history on initial render
  useEffect(() => {
    // Load analysis history
    const fetchHistory = async () => {
      try {
        const history = await chatService.current.loadChatHistory('user123');
        if (history && history.length > 0) {
          // Convert ChatHistory[] to AnalysisHistoryItem[]
          const formattedHistory: AnalysisItem[] = history.map(item => ({
            id: item.id,
            symbol: item.messages[0]?.asset || 'Unknown',
            status: 'COMPLETED',
            createdAt: item.createdAt.toISOString(),
            messages: item.messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              role: msg.isUser ? 'USER' : 'ASSISTANT',
              timestamp: msg.timestamp.toISOString(),
            })),
            chartUrls: item.messages
              .filter(msg => msg.chartUrl)
              .map(msg => msg.chartUrl as string),
          }));
          setHistory(formattedHistory);
        }
      } catch (err) {
        console.error('Error loading analysis history:', err);
      }
    };
    
    fetchHistory();
  }, []);

  // Function to update the current symbol and related UI
  const updateSymbol = (newSymbol: string) => {
    console.log('Updating symbol to:', newSymbol);
    
    // Make sure the symbol is valid
    if (!newSymbol || newSymbol.trim() === '') {
      console.warn('Attempted to update to empty symbol');
      return;
    }
    
    // Update both state and ref to ensure consistency
    setSymbol(newSymbol);
    symbolRef.current = newSymbol;
    
    // Update URL with new symbol for sharing
    const url = new URL(window.location.href);
    url.searchParams.set('symbol', newSymbol);
    window.history.replaceState({}, '', url.toString());
    
    // Update any DOM elements directly if needed
    const symbolDisplayElements = document.querySelectorAll('[id$="symbol-display"]');
    symbolDisplayElements.forEach(el => {
      el.textContent = newSymbol;
    });
    
    // Force symbol update if we have a TradingView instance
    if (tradingViewRef.current && tradingViewRef.current.activeChart && tradingViewRef.current.activeChart.setSymbol) {
      try {
        tradingViewRef.current.activeChart.setSymbol(newSymbol);
      } catch (e) {
        console.error('Error updating TradingView symbol:', e);
      }
    }
    
    console.log('Symbol update complete:', {
      symbolState: newSymbol, 
      symbolRef: symbolRef.current, 
      displayElements: symbolDisplayElements.length
    });
  };

  // Listen for TradingView symbol changes (including from symbol search)
  useEffect(() => {
    const handleTradingViewMessage = (event: MessageEvent) => {
      // TradingView sends messages in various formats when symbols change
      if (event.data && typeof event.data === 'object') {
        // Handle symbol-change message format
        if (
          (event.data.name === 'tv-widget-symbol-changed' && event.data.symbol) ||
          (event.data.type === 'symbol-change' && event.data.symbol) ||
          (event.data.method === 'symbolChange' && event.data.params?.[0])
        ) {
          const newSymbol = event.data.symbol || event.data.params?.[0];
          if (newSymbol && newSymbol !== symbolRef.current) {
            console.log('Symbol changed detected from TradingView:', newSymbol);
            
            // Update state and ref
            setSymbol(newSymbol);
            symbolRef.current = newSymbol;
            
            // Update URL for sharing
            const url = new URL(window.location.href);
            url.searchParams.set('symbol', newSymbol);
            window.history.replaceState({}, '', url.toString());
            
            // Update any DOM elements directly if needed
            const symbolDisplayElements = document.querySelectorAll('[id$="symbol-display"]');
            symbolDisplayElements.forEach(el => {
              el.textContent = newSymbol;
            });
          }
        }
      }
    };
    
    // Add global event listener
    window.addEventListener('message', handleTradingViewMessage);
    
    return () => {
      window.removeEventListener('message', handleTradingViewMessage);
    };
  }, []);

  // Setup listener for external symbol changes (from URL or user interaction)
  useEffect(() => {
    // Check URL for symbol parameter
    const checkUrlForSymbol = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSymbol = urlParams.get('symbol');
      if (urlSymbol && urlSymbol !== symbolRef.current) {
        console.log('URL symbol change detected:', urlSymbol);
        setSymbol(urlSymbol);
        symbolRef.current = urlSymbol;
        
        // Update all display elements
        const symbolDisplayElements = document.querySelectorAll('[id$="symbol-display"]');
        symbolDisplayElements.forEach(el => {
          el.textContent = urlSymbol;
        });
      }
    };
    
    // Check on mount and when URL changes
    checkUrlForSymbol();
    
    // Listen to URL changes (popstate event)
    const handlePopState = () => {
      checkUrlForSymbol();
      if (activeTab === 0) {
        initializeChart();
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Setup global handler for TradingView messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data && typeof event.data === 'object') {
        // Log all TradingView messages for debugging
        if (event.data.name?.includes('tv-') || 
            event.data.type?.includes('symbol') || 
            event.data.method?.includes('symbol')) {
          console.log('TradingView message:', event.data);
        }
        
        // Handle various TradingView message formats
        if (event.data.name === 'tv-widget-symbol-changed' ||
            event.data.type === 'symbol-change' || 
            (event.data.method && event.data.method === 'symbolChange')) {
          const newSymbol = event.data.symbol || event.data.params?.[0];
          if (newSymbol && newSymbol !== symbolRef.current) {
            console.log('External symbol change detected from TradingView message:', newSymbol);
            updateSymbol(newSymbol);
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('message', handleMessage);
    };
  }, [activeTab]);

  // Listen for direct symbol search input changes and TradingView symbol changes
  useEffect(() => {
    // Add event listener for TradingView symbol search selection
    const handleSymbolSelect = (event: MessageEvent) => {
      try {
        // Check for symbol search widget's selection events
        if (
          event.data && 
          typeof event.data === 'object' &&
          (event.data.name === 'symbolSelect' || 
           event.data.type === 'symbol-select' ||
           (event.data.id && event.data.id.includes('symbol-search')))
        ) {
          const newSymbol = event.data.symbol || event.data.value;
          if (newSymbol && newSymbol !== symbolRef.current) {
            console.log('Symbol selected from search widget:', newSymbol);
            updateSymbol(newSymbol);
          }
        }
      } catch (error) {
        console.error('Error handling symbol select:', error);
      }
    };
    
    // Add global event listener
    window.addEventListener('message', handleSymbolSelect);
    
    return () => {
      window.removeEventListener('message', handleSymbolSelect);
    };
  }, []);

  // Update the Analyze button symbol input in the Analysis Chat tab
  useEffect(() => {
    const chatSymbolInput = document.querySelector('.MuiInputBase-input[value]');
    if (chatSymbolInput) {
      try {
        // @ts-ignore: Setting the value property directly
        chatSymbolInput.value = symbolRef.current;
      } catch (e) {
        console.error('Error updating symbol input:', e);
      }
    }
  }, [activeTab, symbol]);

  // Function to handle manual symbol search submit
  const handleSymbolSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput && searchInput.trim() !== '') {
      // Format symbol if needed (e.g., add BINANCE: prefix if missing for crypto)
      let formattedSymbol = searchInput.trim();
      
      // Add exchange prefix if missing
      if (!formattedSymbol.includes(':') && 
          /^[A-Z0-9]+$/i.test(formattedSymbol)) {
        formattedSymbol = `BINANCE:${formattedSymbol.toUpperCase()}`;
      }
      
      console.log('Symbol search submitted:', formattedSymbol);
      
      // Update symbol in our app state and in TradingView
      updateSymbol(formattedSymbol);
      
      // Try to update TradingView chart directly
      if (tradingViewRef.current) {
        try {
          // If TradingView widget has setSymbol method
          if (typeof tradingViewRef.current.setSymbol === 'function') {
            tradingViewRef.current.setSymbol(formattedSymbol);
          }
          // If we can access chart object directly
          else if (tradingViewRef.current.chart && 
                  typeof tradingViewRef.current.chart.setSymbol === 'function') {
            tradingViewRef.current.chart.setSymbol(formattedSymbol);
          }
          // Last resort: reinitialize
          else {
            initializeChart();
          }
        } catch (e) {
          console.error('Error updating TradingView symbol:', e);
          // If direct update fails, reinitialize chart
          initializeChart();
        }
      }
    }
  };

  // Function to initialize/reinitialize the TradingView chart
  const initializeChart = () => {
    // Clear any existing chart
    const container = document.getElementById(chartContainerId.current);
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
    
    // Log current symbol state before initializing
    console.log('Initializing chart with symbol:', {
      symbolState: symbol,
      symbolRef: symbolRef.current, 
      urlSymbol: new URLSearchParams(window.location.search).get('symbol')
    });
    
    // Load the TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        // Get the current symbol (from ref to ensure it's up to date)
        const currentSymbol = symbolRef.current;
        
        // Initialize main chart with Symbol Search enabled
        tradingViewRef.current = new window.TradingView.widget({
          container_id: chartContainerId.current,
          symbol: currentSymbol,
          interval: '1D',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: 'rgba(0, 0, 0, 0)', // Transparent toolbar background
          enable_publishing: false,
          allow_symbol_change: true, // Allow symbol changes
          save_image: true,
          height: '100%', // Use 100% height
          width: '100%',
          hideideas: true,
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies',
          ],
          autosize: true, // Enable autosize
          fullscreen: false,
          hide_side_toolbar: false,
          withdateranges: true, // Show date range selector
          hide_volume: false,
          details: true,
          hotlist: true,
          calendar: true,
          // Enable symbol search capabilities
          show_popup_button: true, 
          popup_width: '1000',
          popup_height: '650',
          // Add the official symbol change callback
          symbol_change_callback: (symbolData: TradingViewSymbolData) => {
            console.log("TradingView symbol_change_callback:", symbolData.name);
            // Update our custom input when TradingView changes symbol
            setSearchInput(symbolData.name);
            updateSymbol(symbolData.name);
          }
        });
        
        // Add resize listener to handle window resizing
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
        
        // Update the UI with the current symbol
        updateSymbol(currentSymbol);
        
        // Return cleanup function that removes resize listener
        return () => {
          window.removeEventListener('resize', handleResize);
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    };
    document.head.appendChild(script);
  };

  // Function to initialize the TradingView symbol search widget
  const initializeSymbolSearch = () => {
    // Clear any existing container contents
    const container = document.getElementById('tradingview-widget-search-container');
    if (container) {
      container.innerHTML = '';
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container';
      
      // Set up the symbol search widget
      const script = document.createElement('script');
      script.id = 'tradingview-widget-search-script';
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-search.js';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "38",
        "symbolsGroups": [
          {
            "name": "Cryptocurrencies",
            "originalName": "Cryptocurrencies",
            "symbols": [
              { "name": "BINANCE:BTCUSDT", "displayName": "Bitcoin" },
              { "name": "BINANCE:ETHUSDT", "displayName": "Ethereum" },
              { "name": "BINANCE:BNBUSDT", "displayName": "BNB" },
              { "name": "BINANCE:SOLUSDT", "displayName": "Solana" },
              { "name": "BINANCE:ADAUSDT", "displayName": "Cardano" }
            ]
          }
        ],
        "colorTheme": "dark",
        "isTransparent": true,
        "locale": "en"
      });
      
      widgetContainer.appendChild(script);
      container.appendChild(widgetContainer);
    }
  };

  // Initialize chart when component mounts
  useEffect(() => {
    if (showChart) {
      // Check URL for symbol parameter first and update if needed
      const urlParams = new URLSearchParams(window.location.search);
      const urlSymbol = urlParams.get('symbol');
      if (urlSymbol && urlSymbol !== symbolRef.current) {
        console.log('Setting initial symbol from URL:', urlSymbol);
        setSymbol(urlSymbol);
        symbolRef.current = urlSymbol;
      }
      
      initializeChart();
    }
  }, [showChart]);
  
  // Reinitialize chart when tab changes to Dashboard
  useEffect(() => {
    if (activeTab === 0) { // Dashboard tab
      initializeChart();
    }
  }, [activeTab]);
  
  // Scroll messages into view when updated
  useEffect(() => {
    if (messageThreadRef.current) {
      messageThreadRef.current.scrollTop = messageThreadRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSelectAnalysis = (analysis: AnalysisItem) => {
    setSelectedAnalysisId(analysis.id);
    
    // Update symbol from the selected analysis
    if (analysis.symbol && analysis.symbol !== symbolRef.current) {
      setSymbol(analysis.symbol);
      symbolRef.current = analysis.symbol;
      
      // Update URL with the symbol
      const url = new URL(window.location.href);
      url.searchParams.set('symbol', analysis.symbol);
      window.history.replaceState({}, '', url.toString());
      
      // If we're on the dashboard tab, reinitialize the chart with the new symbol
      if (activeTab === 0) {
        initializeChart();
      }
    }
    
    setActiveTab(1); // Switch to Chat tab
    
    // Format messages from the analysis
    const formattedMessages: ChatMessage[] = analysis.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      isUser: msg.role === 'USER',
      chartUrl: msg.role === 'ASSISTANT' ? analysis.chartUrls[0] : undefined,
    }));
    
    setMessages(formattedMessages);
    setStreamingContent(''); // Clear any streaming content
  };

  // Function to load analysis history
  const loadAnalysisHistory = async () => {
    try {
      const userId = 'user123'; // Should come from auth context in a real app
      console.log('Loading analysis history for user:', userId);
      
      const response = await fetch(`/api/analysis-history/${userId}`);
      if (!response.ok) {
        console.error(`Error loading history: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log('Analysis history response:', data);
      
      // Handle different response formats
      let historyData = data;
      
      // Check if data is wrapped in a data property
      if (data.data && Array.isArray(data.data)) {
        historyData = data.data;
      }
      
      // Check if we got an array
      if (!Array.isArray(historyData)) {
        console.error('History data is not an array:', historyData);
        return;
      }
      
      // Make sure we have items
      if (historyData.length === 0) {
        console.log('No history items found');
        return;
      }
      
      // Process the history items
      const formattedHistory = historyData.map(item => {
        // Ensure item has required fields or provide defaults
        return {
          id: item.id || `history_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          symbol: item.symbol || 'Unknown',
          status: item.status || 'COMPLETED',
          createdAt: item.createdAt || new Date().toISOString(),
          messages: Array.isArray(item.messages) ? item.messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            content: msg.content || '',
            role: msg.role || (msg.isUser ? 'USER' : 'ASSISTANT'),
            timestamp: msg.timestamp || new Date().toISOString(),
          })) : [],
          chartUrls: Array.isArray(item.chartUrls) ? item.chartUrls : []
        };
      });
      
      console.log('Formatted history items:', formattedHistory.length);
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading analysis history:', error);
    }
  };

  // Cleanup timers when component unmounts
  useEffect(() => {
    return () => {
      // Clear any polling intervals when component unmounts
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  // Handle analyze button click - using the current symbol
  const handleAnalyze = async () => {
    // First log the current state of symbols
    console.log('Symbol state before analysis:', {
      symbolState: symbol,
      symbolRef: symbolRef.current,
      urlSymbol: new URLSearchParams(window.location.search).get('symbol')
    });
    
    if (!symbolRef.current) {
      alert('Please enter a valid trading symbol');
      return;
    }
    
    // Ensure the symbolRef is up-to-date with any recent changes
    // This helps if the symbol was changed but not properly reflected in the ref
    const urlSymbol = new URLSearchParams(window.location.search).get('symbol');
    if (urlSymbol && urlSymbol !== symbolRef.current) {
      console.log('Updating symbolRef from URL:', urlSymbol);
      symbolRef.current = urlSymbol;
      setSymbol(urlSymbol);
    }
    
    // Double-check the current symbol display to make sure it's in sync
    const displayElement = document.getElementById('current-symbol-display');
    if (displayElement && displayElement.textContent && 
        displayElement.textContent !== symbolRef.current) {
      console.log('Updating symbolRef from display:', displayElement.textContent);
      symbolRef.current = displayElement.textContent;
      setSymbol(displayElement.textContent);
    }
    
    // Clear existing messages if not continuing an analysis
    if (!selectedAnalysisId) {
      setMessages([]);
      setStreamingContent('');
    }
    
    setLoading(true);
    setActiveTab(1); // Switch to Analysis Chat tab
    
    // Clear any existing intervals
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
    
    try {
      // Get the current symbol from the ref (most up-to-date)
      const currentSymbol = symbolRef.current;
      console.log('Analyzing symbol:', currentSymbol);
      
      // Step 1: Generate charts first
      console.log('Generating charts for symbol:', currentSymbol);
      const generateChartsResponse = await fetch('/api/generate-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: currentSymbol })
      });
      
      if (!generateChartsResponse.ok) {
        throw new Error(`Error generating charts: ${generateChartsResponse.status}`);
      }
      
      const chartsData = await generateChartsResponse.json();
      console.log('Generated charts:', chartsData);
      
      if (!chartsData.chartUrls || chartsData.chartUrls.length === 0) {
        throw new Error('No chart URLs generated. Please try again.');
      }
      
      // Add user message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          content: `Analyzing ${currentSymbol}`,
          timestamp: new Date(),
          isUser: true,
          asset: currentSymbol,
        }
      ]);
      
      // Step 2: Analyze the charts with the chartUrls from step 1
      const requestData = {
        chartUrls: chartsData.chartUrls,
        symbol: currentSymbol,
        userId: 'user123'
      };
      
      // If we have an analysisId, include it (for continuing analyses)
      if (selectedAnalysisId) {
        Object.assign(requestData, { analysisId: selectedAnalysisId });
      }
      
      console.log('Sending analyze-charts request:', requestData);
      
      // Use the analyze method with the correct parameters
      // BUT DON'T PARSE JSON directly - it's streaming data
      const response = await fetch('/api/analyze-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }
      
      let analysisId = '';
      let accumulatedContent = '';
      let chartUrls: string[] = chartsData.chartUrls;
      const decoder = new TextDecoder();
      
      // Create a placeholder for the AI message that will be updated as we stream
      const aiMessageId = Date.now() + 1000;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: aiMessageId.toString(),
          content: "",
          timestamp: new Date(),
          isUser: false,
          chartUrl: chartUrls[0],
        }
      ]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        
        // Process each line (which should be in format "data: {...}")
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          // Process only lines that start with "data: "
          if (line.startsWith('data: ')) {
            try {
              // Extract the JSON part
              const jsonStr = line.substring(6); // Remove "data: "
              const data = JSON.parse(jsonStr);
              
              console.log('Processed data:', data);
              
              switch (data.type) {
                case 'content':
                  // Append new content
                  accumulatedContent += data.data;
                  // Update the streaming content
                  setStreamingContent(accumulatedContent);
                  // Update the AI message in real-time
                  setMessages(prevMessages => 
                    prevMessages.map(msg => 
                      msg.id === aiMessageId.toString() 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                  break;
                  
                case 'images':
                  // Update chart URLs
                  if (Array.isArray(data.data) && data.data.length > 0) {
                    chartUrls = data.data;
                    // Update the AI message with the first chart URL
                    setMessages(prevMessages => 
                      prevMessages.map(msg => 
                        msg.id === aiMessageId.toString() 
                          ? { ...msg, chartUrl: chartUrls[0] }
                          : msg
                      )
                    );
                  }
                  break;
                  
                case 'analysisId':
                  // Store the analysis ID
                  analysisId = data.data;
                  break;
                  
                case 'error':
                  console.error('Stream error:', data.data);
                  break;
                  
                case 'done':
                  console.log('Stream completed');
                  break;
              }
            } catch (e) {
              console.error('Error parsing line:', line, e);
              // Continue processing other lines even if one fails
            }
          }
        }
      }
      
      // If we didn't get an analysisId from the stream, generate one
      if (!analysisId) {
        analysisId = `analysis_${Date.now()}`;
      }
      
      console.log('Stream completed. Analysis ID:', analysisId);
      
      // Set the selected analysis ID
      setSelectedAnalysisId(analysisId);
      
      // Save the completed analysis
      console.log('Saving completed analysis');
      
      // Final messages after streaming is complete
      const finalMessages = [...messages];
      
      // Use structure matching chatService.saveAnalysis
      const saveResponse = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: analysisId,
          symbol: currentSymbol,
          analysis: accumulatedContent,
          messages: finalMessages,
          chartUrls: chartUrls,
          userId: 'user123',
          status: 'COMPLETED'
        })
      });
      
      if (!saveResponse.ok) {
        console.error(`Error saving analysis: ${saveResponse.status}`);
      }
      
      // Refresh history
      await loadAnalysisHistory();
      setLoading(false);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during analysis');
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Convert status to display text
  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'COMPLETED': return 'DONE';
      default: return status;
    }
  };

  // Update TradingView container reference 
  const setChartContainerRef = (el: HTMLDivElement) => {
    chartContainerRef.current = el;
  };

  // Update all symbol display elements when symbol changes
  useEffect(() => {
    // Update all elements with IDs ending in "symbol-display"
    const symbolDisplayElements = document.querySelectorAll('[id$="symbol-display"]');
    symbolDisplayElements.forEach(el => {
      el.textContent = symbolRef.current;
    });
    
    // Log the change
    console.log('Symbol display elements updated to:', symbolRef.current);
  }, [symbol]); // Depends on symbol state

  return (
    <FullHeightBox>
      {/* Sidebar with Analysis History - Now labeled as Chat Dashboard */}
      <StyledDrawer variant="permanent" anchor="left">
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Chat History
          </Typography>
        </Box>
        <Divider />
        <List sx={{ overflow: 'auto', flex: 1 }}>
          {history.map((analysis) => (
            <HistoryListItem 
              key={analysis.id}
              disablePadding
              sx={{ position: 'relative' }}
            >
              <ListItemButton 
                onClick={() => handleSelectAnalysis(analysis)}
                selected={selectedAnalysisId === analysis.id}
                dense
                sx={{ py: 1.5 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {analysis.symbol.substring(0, 1)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={analysis.symbol} 
                  secondary={new Date(analysis.createdAt).toLocaleString()}
                  primaryTypographyProps={{ noWrap: true }}
                />
                <StatusBadge status={analysis.status}>
                  {getStatusDisplay(analysis.status)}
                </StatusBadge>
              </ListItemButton>
            </HistoryListItem>
          ))}
        </List>
      </StyledDrawer>

      {/* Main Content */}
      <ContentBox>
        {/* Tabs for Dashboard and Chat */}
        <NavTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Dashboard" />
          <Tab label="Analysis Chat" />
        </NavTabs>

        {/* Dashboard Tab */}
        <TabPanel value={activeTab} index={0}>
          <ChartContainer>
            <SectionHeaderContainer>
              <Typography variant="h6" sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                TradingView Chart
              </Typography>
              
              {/* Custom Search Input with TradingView Integration */}
              <Box component="form" onSubmit={handleSymbolSearchSubmit} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%', 
                maxWidth: 400, 
                ml: 2,
                gap: 1,
                position: 'relative',
              }}>
                <TextField
                  id="symbol-search-input"
                  placeholder="Search symbol (e.g. BTCUSDT, META)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    // When input is focused, trigger TradingView's symbol search
                    if (tradingViewRef.current && tradingViewRef.current.chart) {
                      try {
                        // Attempt to open TradingView's native symbol search
                        tradingViewRef.current.chart.executeActionById("symbolSearch");
                      } catch (e) {
                        console.error("Error opening TradingView symbol search:", e);
                      }
                    }
                  }}
                  variant="outlined"
                  size="small"
                  fullWidth
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976d2',
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        type="submit" 
                        size="small"
                        sx={{ color: '#1976d2' }}
                        aria-label="search"
                        onClick={() => {
                          // Click handler that also tries to open TradingView's symbol search
                          if (tradingViewRef.current && tradingViewRef.current.chart) {
                            try {
                              tradingViewRef.current.chart.executeActionById("symbolSearch");
                            } catch (e) {
                              console.error("Error opening TradingView symbol search:", e);
                            }
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </IconButton>
                    ),
                  }}
                  inputProps={{
                    list: "symbol-suggestions"
                  }}
                />
                <datalist id="symbol-suggestions">
                  <option value="BINANCE:BTCUSDT">Bitcoin</option>
                  <option value="BINANCE:ETHUSDT">Ethereum</option>
                  <option value="BINANCE:BNBUSDT">BNB</option>
                  <option value="BINANCE:SOLUSDT">Solana</option>
                  <option value="BINANCE:ADAUSDT">Cardano</option>
                  <option value="BINANCE:DOGEUSDT">Dogecoin</option>
                  <option value="BINANCE:XRPUSDT">XRP</option>
                  <option value="NASDAQ:META">Meta Platforms</option>
                  <option value="NASDAQ:AAPL">Apple</option>
                  <option value="NASDAQ:MSFT">Microsoft</option>
                </datalist>
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <SymbolDisplayBox>
                <Typography id="current-symbol-display" variant="body2" fontWeight="bold">
                  {symbolRef.current}
        </Typography>
              </SymbolDisplayBox>
              
              <AnalyzeButton
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={loading}
                size="small"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Analyze
              </AnalyzeButton>
            </SectionHeaderContainer>
            
            <Box 
              id={chartContainerId.current} 
              sx={{ 
                flexGrow: 1,
                width: '100%', 
                position: 'relative',
                minHeight: '300px',
                height: 'calc(100% - 50px)',
              }} 
            />
      </ChartContainer>
        </TabPanel>

        {/* Chat Tab */}
        <TabPanel value={activeTab} index={1}>
          <AnalysisContainer>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
            }}>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                Analysis Chat - <span id="analysis-symbol-display">{symbolRef.current}</span>
        </Typography>
              {selectedAnalysisId && (
                <Button
                  onClick={() => setSelectedAnalysisId(null)}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: '20px', textTransform: 'none' }}
                >
                  New Analysis
                </Button>
              )}
            </Box>
            
        {error && (
              <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
            
            <MessageThread ref={messageThreadRef}>
              {/* Regular messages */}
          {messages.map((message) => (
            <Message key={message.id} isUser={message.isUser}>
                  {message.isUser ? (
              <Typography variant="body1">{message.content}</Typography>
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
              {message.chartUrl && (
                    <Box sx={{ mt: 2 }}>
                  <img
                    src={message.chartUrl}
                    alt="Technical Analysis Chart"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Message>
          ))}
              
              {/* Streaming content */}
              {streamingContent && (
                <StreamingMessage>
                  <StatusChip 
                    label="Live Analysis" 
                    color="primary" 
                    size="small"
                    variant="outlined"
                  />
                  <ReactMarkdown>{streamingContent}</ReactMarkdown>
                </StreamingMessage>
              )}
              
              {/* Analyzing indicator */}
              {loading && !streamingContent && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <Typography sx={{ mr: 2 }}>Analyzing {symbolRef.current}</Typography>
                  <CircularProgress size={24} thickness={4} />
                </Box>
              )}
              
              {/* Empty state */}
              {!loading && messages.length === 0 && !streamingContent && (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  opacity: 0.7
                }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>No Analysis Selected</Typography>
                  <Typography variant="body2" align="center">
                    Select a symbol in the Dashboard tab and click Analyze,<br />
                    or choose a previous analysis from the sidebar.
                  </Typography>
                </Box>
              )}
        </MessageThread>
            
        <InputContainer>
          <TextField
            fullWidth
                id="analysis-symbol-input"
            label="Symbol"
                value={symbolRef.current}
                onChange={(e) => {
                  const newSymbol = e.target.value;
                  console.log('Chat symbol input changed to:', newSymbol);
                  setSymbol(newSymbol);
                  symbolRef.current = newSymbol;
                  
                  // Update other display elements
                  const symbolDisplayElements = document.querySelectorAll('[id$="symbol-display"]');
                  symbolDisplayElements.forEach(el => {
                    el.textContent = newSymbol;
                  });
                }}
            variant="outlined"
            size="small"
                placeholder="Enter trading pair (e.g., BINANCE:BTCUSDT)"
          />
              <AnalyzeButton
            variant="contained"
                onClick={() => {
                  // Ensure symbolRef is consistent with displayed symbol
                  const displayEl = document.getElementById('analysis-symbol-display');
                  if (displayEl && displayEl.textContent && displayEl.textContent !== symbolRef.current) {
                    console.log('Updating symbolRef before analysis:', displayEl.textContent);
                    symbolRef.current = displayEl.textContent;
                    setSymbol(displayEl.textContent);
                  }
                  
                  // Now perform analysis with verified symbol
                  handleAnalyze();
                }}
            disabled={loading}
          >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
              </AnalyzeButton>
        </InputContainer>
      </AnalysisContainer>
        </TabPanel>
      </ContentBox>
    </FullHeightBox>
  );
};

export default ChartIQ; 