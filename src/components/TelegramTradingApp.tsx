import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress, Select, MenuItem, FormControl, InputLabel, TextField, InputAdornment, IconButton, List, ListItem, ListItemText, Chip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnalysisItem, StyledProps } from '../types';
import ChatService from '../services/chatService';
import SymbolSearch from './SymbolSearch';
import ReactMarkdown from 'react-markdown';
import { createGlobalStyle } from 'styled-components';

// Setup global media queries for different iPhone viewports
const GlobalStyle = createGlobalStyle`
  /* iPhone 15 - Telegram Mini App */
  @media (min-width: 320px) and (max-width: 340px) {
    html {
      font-size: 12px;
    }
    body {
      max-width: 320px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 12 Mini, 13 Mini - Telegram Mini App */
  @media (min-width: 330px) and (max-width: 350px) {
    html {
      font-size: 13px;
    }
    body {
      max-width: 330px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 11 Pro, 14 Pro - Telegram Mini App */
  @media (min-width: 340px) and (max-width: 375px) {
    html {
      font-size: 14px;
    }
    body {
      max-width: 340px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 12, 13, 14 - Telegram Mini App */
  @media (min-width: 350px) and (max-width: 390px) {
    html {
      font-size: 15px;
    }
    body {
      max-width: 350px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 12 Pro Max, 14 Pro - Telegram Mini App */
  @media (min-width: 390px) and (max-width: 430px) {
    html {
      font-size: 16px;
    }
    body {
      max-width: 390px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 15 Pro, 16 - Telegram Mini App */
  @media (min-width: 400px) {
    html {
      font-size: 17px;
    }
    body {
      max-width: 400px;
      margin: 0 auto;
    }
  }
  
  /* Additional global styles for Telegram Mini App */
  body {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    overscroll-behavior: none;
    user-select: none;
    padding: 0;
  }
`;

// Styled components for Telegram Mini App
const TelegramAppContainer = styled(Box)(({ theme }: StyledProps) => ({
  padding: 0,
  margin: '0 auto', // Center the container
  height: '100%',
  maxHeight: '100vh',
  width: '100%',
  maxWidth: '100%', // Full width on mobile 
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#17212b', // Telegram dark theme color
  color: '#fff',
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', // Add shadow for mobile app look
}));

const Header = styled(Box)(({ theme }: StyledProps) => ({
  padding: '1rem',
  backgroundColor: '#232e3c', // Slightly lighter than background
  borderBottom: '1px solid #101921',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  textAlign: 'center', // Center text in header
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const AnalysisThreadContainer = styled(Box)(({ theme }: StyledProps) => ({
  flex: 1,
  overflow: 'auto',
  padding: '0.5rem',
  height: 'calc(100vh - 7.25rem)', // Responsive height based on rem
  display: 'flex', 
  flexDirection: 'column',
  '&::-webkit-scrollbar': {
    width: '0.25rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '0.25rem',
  },
}));

const AnalysisItemContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: '1rem',
  marginBottom: '0.75rem',
  backgroundColor: '#232e3c',
  borderRadius: '0.75rem', // More rounded corners for mobile look
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove tap highlight on mobile
  '&:hover': {
    backgroundColor: '#2a3744',
    borderColor: '#5cabdd',
  },
  '&:active': { // Add active state for touch feedback
    backgroundColor: '#1c2733',
    transform: 'scale(0.98)',
  },
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Add subtle shadow
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  height: '1.25rem',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  borderRadius: '0.75rem', // More rounded for mobile
  padding: '0 0.5rem',
  ...(status === 'COMPLETED' && {
    backgroundColor: '#4caf50',
    color: '#fff',
  }),
  ...(status === 'ANALYZING' && {
    backgroundColor: '#2196f3',
    color: '#fff',
  }),
  ...(status === 'GENERATING_CHARTS' && {
    backgroundColor: '#ff9800',
    color: '#fff',
  }),
  ...(status === 'FAILED' && {
    backgroundColor: '#f44336',
    color: '#fff',
  }),
}));

// Custom formatter for technical analysis content
const formatTechnicalAnalysis = (content: string): string => {
  // Don't attempt to format if content is empty
  if (!content) return content;
  
  // Parse any timeframe headers and add special class
  let formattedContent = content
    // Format ## X-Hour Timeframe or ## Daily Timeframe headers
    .replace(/## ([\w-]+) Timeframe/g, '## <span class="timeframe-header">$1 Timeframe</span>')
    // Format ### Summary sections
    .replace(/### Summary/g, '### <span class="summary-header">Summary</span>')
    // Format Overall Outlook section
    .replace(/### Overall Outlook/g, '### <span class="outlook-header">Overall Outlook</span>')
    // Add classes to technical indicators
    .replace(/\*\*([\w\s-]+):\*\*/g, '**<span class="technical-indicator">$1:</span>**')
    // Enhance lists for better readability
    .replace(/- \*\*([\w\s-]+):\*\*/g, '- **<span class="list-indicator">$1:</span>**');
    
  return formattedContent;
};

// Enhanced markdown content styling
const EnhancedMarkdown = styled(ReactMarkdown)(({ theme }: StyledProps) => ({
  fontSize: '0.95rem',
  lineHeight: 1.7,
  color: '#fff',
  '& h1': {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginTop: '1rem',
    marginBottom: '0.8rem',
    color: '#5cabdd',
    borderBottom: '1px solid rgba(92, 171, 221, 0.3)',
    paddingBottom: '0.4rem',
    textAlign: 'center',
  },
  '& h2': {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginTop: '1rem',
    marginBottom: '0.6rem',
    color: '#5cabdd',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '0.3rem',
  },
  '& h3': {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    marginTop: '0.8rem',
    marginBottom: '0.4rem',
    color: '#5cabdd',
  },
  '& p': {
    marginBottom: '0.7rem',
  },
  '& ul, & ol': {
    paddingLeft: '1.5rem',
    marginBottom: '0.8rem',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '0.7rem 0.7rem 0.7rem 2rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  '& li': {
    marginBottom: '0.4rem',
  },
  '& hr': {
    margin: '1rem 0',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& strong': {
    color: '#bb86fc',
    fontWeight: 'bold',
  },
  '& blockquote': {
    borderLeft: '4px solid #5cabdd',
    paddingLeft: '0.8rem',
    fontStyle: 'italic',
    margin: '0.8rem 0',
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '0.6rem',
    borderRadius: '0 4px 4px 0',
  },
  '& .timeframe-header': {
    color: '#03dac6',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(3, 218, 198, 0.1)',
  },
  '& .summary-header': {
    color: '#bb86fc',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
  },
  '& .outlook-header': {
    color: '#ff7597',
    backgroundColor: 'rgba(255, 117, 151, 0.1)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
  },
  '& .technical-indicator': {
    color: '#64b5f6',
  },
  '& .list-indicator': {
    color: '#64b5f6',
  },
}));

// Enhanced styled components for better visual presentation
const AnalysisContent = styled(Box)(({ theme }: StyledProps) => ({
  marginTop: '0.75rem',
  padding: '0.75rem',
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '0.75rem',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  maxHeight: '18rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  fontSize: '0.9rem',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  '&::-webkit-scrollbar': {
    width: '0.4rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.2rem',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '0.2rem',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  },
}));

const SymbolHeader = styled(Typography)(({ theme }: StyledProps) => ({
  fontWeight: 'bold',
  color: '#5cabdd',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.95rem', // Slightly smaller for mobile
  '& svg': {
    marginRight: theme.spacing(1),
    color: '#5cabdd',
  },
}));

const DateDisplay = styled(Typography)(({ theme }: StyledProps) => ({
  fontSize: '0.7rem', // Smaller for mobile
  color: 'rgba(255, 255, 255, 0.6)',
  marginBottom: theme.spacing(1),
}));

const LoadingContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: '1rem',
  margin: '0.5rem',
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
}));

// Add mobile app style floating button container
const FloatingButtonContainer = styled(Box)(({ theme }: StyledProps) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 100,
}));

// Add a custom responsive container for mobile-friendly spacing
const ResponsiveContainer = styled(Box)(({ theme }: StyledProps) => ({
  padding: '0.5rem',
  '@media (min-width: 350px)': {
    padding: '0.75rem',
  },
  '@media (min-width: 390px)': {
    padding: '1rem',
  },
}));

const TelegramTradingApp: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('BINANCE:BTCUSDT');
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [messages, setMessages] = useState<{
    id: string;
    content: string;
    timestamp: Date;
    isUser: boolean;
    asset?: string;
  }[]>([]);
  const chatService = useRef(ChatService.getInstance());
  const symbolRef = useRef<string>('BINANCE:BTCUSDT');
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update the ref when symbol changes
  useEffect(() => {
    console.log('Symbol state changed, updating ref:', symbol);
    symbolRef.current = symbol;
  }, [symbol]);
  
  // Load analysis history on initial render
  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  // Function to load analysis history
  const loadAnalysisHistory = async () => {
    try {
      const userId = 'user123'; // Should come from auth context in a real app
      console.log('Loading analysis history for user:', userId);
      setLoading(true);
      
      // Load chat history using the chat service
      const history = await chatService.current.loadChatHistory(userId);
      if (history && history.length > 0) {
        // Convert ChatHistory[] to AnalysisItem[]
        const formattedHistory: AnalysisItem[] = history.map(item => {
          // Ensure symbol is properly formatted
          let symbol = item.messages[0]?.asset || 'Unknown';
          
          // Fix symbol format if needed
          if (symbol && !symbol.includes(':') && /^[A-Z0-9]+$/i.test(symbol)) {
            symbol = `BINANCE:${symbol.toUpperCase()}`;
          } else if (symbol) {
            symbol = symbol.toUpperCase();
          }
          
          return {
            id: item.id,
            symbol: symbol,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(), // Default to current date
            messages: item.messages.map(msg => {
              return {
                id: msg.id,
                content: msg.content,
                role: msg.isUser ? 'USER' : 'ASSISTANT',
                timestamp: new Date().toISOString(), // Default to current date
              };
            }),
          };
        });
        
        console.log('Formatted history items:', formattedHistory.length);
        console.log('Symbols in history:', formattedHistory.map(item => item.symbol).join(', '));
        setHistory(formattedHistory);
      } else {
        console.log('No history items found');
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle analyze button click - using the current symbol
  const handleAnalyze = async (explicitSymbol?: string) => {
    // Reset messages and selectedAnalysisId for a fresh chat session
    setMessages([]);
    setSelectedAnalysisId(null);
    setStatusMessage(null);
    
    // First log the current state of symbols
    console.log('Symbol state before analysis:', {
      symbolState: symbol,
      symbolRef: symbolRef.current,
      explicitSymbol
    });
    
    // Use explicitly passed symbol first, fallback to ref (which tracks state)
    let currentSymbol = explicitSymbol || symbolRef.current;
    
    if (!currentSymbol) {
      alert('Please enter a valid trading symbol');
      return;
    }
    
    // Validate symbol format
    if (!currentSymbol.includes(':')) {
      console.warn('Symbol format may be incorrect:', currentSymbol);
      
      // Try to fix the symbol format if possible
      if (/^[A-Z0-9]+$/i.test(currentSymbol)) {
        const fixedSymbol = `BINANCE:${currentSymbol.toUpperCase()}`;
        console.log('Fixed symbol format:', fixedSymbol);
        // Update both state and ref for consistency
        setSymbol(fixedSymbol);
        symbolRef.current = fixedSymbol; // Direct update bypasses the useEffect
        currentSymbol = fixedSymbol;
      }
    }
    
    // Ensure symbol is uppercase for consistency
    if (currentSymbol !== currentSymbol.toUpperCase()) {
      const uppercasedSymbol = currentSymbol.toUpperCase();
      console.log('Converting symbol to uppercase:', uppercasedSymbol);
      setSymbol(uppercasedSymbol);
      symbolRef.current = uppercasedSymbol; // Direct update bypasses the useEffect
      currentSymbol = uppercasedSymbol;
    }
    
    // Ensure the symbolRef is up-to-date with any recent changes
    setLoading(true);
    setSelectedAnalysisId(null);
    setStreamingContent('');
    setError(null);
    
    // Clear any existing intervals
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
    
    try {
      // Already have currentSymbol defined above
      console.log('Analyzing symbol:', currentSymbol);
      setStatusMessage(`Analyzing ${currentSymbol}...`);
      
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
        const errorText = await generateChartsResponse.text();
        console.error('Error response from generate-charts:', errorText);
        throw new Error(`Error generating charts: ${generateChartsResponse.status} - ${errorText}`);
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
          asset: currentSymbol
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
      
      // At the end, save the analysis with the correct data structure
      const analysisData = {
        id: analysisId,
        symbol: currentSymbol,
        analysis: accumulatedContent,
        messages: [
          ...messages,
          {
            id: aiMessageId.toString(),
            content: accumulatedContent,
            role: 'ASSISTANT',
            timestamp: new Date().toISOString()
          }
        ].map(msg => ({
          id: msg.id,
          content: msg.content,
          role: 'isUser' in msg && msg.isUser ? 'USER' : 'ASSISTANT',
          timestamp: typeof msg.timestamp === 'string' 
            ? msg.timestamp 
            : msg.timestamp.toISOString()
        })),
        chartUrls,
        userId: 'user123',
        status: 'COMPLETED'
      };

      console.log('Saving analysis data with symbol:', analysisData.symbol);
      
      const saveResponse = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });
      
      if (!saveResponse.ok) {
        console.error(`Error saving analysis: ${saveResponse.status}`);
      } else {
        console.log('Analysis saved successfully with symbol:', currentSymbol);
      }
      
      // Refresh history
      await loadAnalysisHistory();
      
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during analysis';
      setError(errorMessage);
      setStatusMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnalysis = (analysis: AnalysisItem) => {
    // Toggle selection - if the clicked item is already selected, deselect it
    if (selectedAnalysisId === analysis.id) {
      setSelectedAnalysisId(null);
      return;
    }
    
    setSelectedAnalysisId(analysis.id);
    
    // Always update symbol when selecting an analysis
    if (analysis.symbol) {
      const analysisSymbol = analysis.symbol.toUpperCase();
      console.log('Updating symbol from analysis selection:', analysisSymbol);
      
      // Update both state and ref directly to avoid async issues
      setSymbol(analysisSymbol);
      symbolRef.current = analysisSymbol; // Direct update to avoid relying on useEffect
      
      // Update status message to show user what's selected
      setStatusMessage(`Selected analysis for ${analysisSymbol}`);
      
      // Make symbol available to other components immediately
      console.log('Current symbol after selection:', symbolRef.current);
    } else {
      console.warn('Selected analysis has no symbol:', analysis.id);
    }
  };

  const renderAnalysisContent = (analysis: AnalysisItem) => {
    // Show the analysis content
    const assistantMessages = analysis.messages.filter(msg => msg.role === 'ASSISTANT');
    if (assistantMessages.length === 0) {
      return (
        <LoadingContainer>
          <CircularProgress size="1.5rem" sx={{ mr: 1, color: '#5cabdd' }} />
          <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Analysis in progress...</Typography>
        </LoadingContainer>
      );
    }
    
    return (
      <Box>
        <AnalysisContent>
          {assistantMessages.map(msg => (
            <Box key={msg.id} sx={{ mb: 2 }}>
              <EnhancedMarkdown>
                {formatTechnicalAnalysis(msg.content)}
              </EnhancedMarkdown>
            </Box>
          ))}
        </AnalysisContent>
      </Box>
    );
  };

  // Set viewport meta tag for mobile responsiveness
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  return (
    <>
      <GlobalStyle />
      <TelegramAppContainer>
        {/* Header with Search and Type Selector */}
        <Header>
          <Typography variant="h6" sx={{ 
            mb: 1.5, 
            fontWeight: 'bold', 
            textAlign: 'center',
            fontSize: '1.25rem', // Use relative font size
          }}>
            TradeAnalyst
          </Typography>
          
          <ResponsiveContainer sx={{ width: '100%' }}>
            <SymbolSearch 
              onSearchSubmit={(newSymbol) => {
                console.log('Symbol search submitted with new symbol:', newSymbol);
                // Force uppercase for better consistency
                const formattedSymbol = newSymbol.toUpperCase();
                // Update both state and ref
                setSymbol(formattedSymbol);
                symbolRef.current = formattedSymbol; // Direct update
                // Set status message to confirm symbol change
                setStatusMessage(`Symbol changed to ${formattedSymbol}`);
                // Call handleAnalyze with the explicit symbol value to avoid any race conditions
                handleAnalyze(formattedSymbol);
              }}
              onAnalyze={(explicitSymbol) => {
                // If explicit symbol is provided, use it, otherwise use current ref
                const symbolToAnalyze = explicitSymbol || symbolRef.current;
                console.log('Manual analyze triggered for symbol:', symbolToAnalyze);
                handleAnalyze(symbolToAnalyze);
              }}
            />
          </ResponsiveContainer>
        </Header>

        {/* Analysis Thread Container */}
        <AnalysisThreadContainer>
          <Typography variant="subtitle1" sx={{ 
            mb: 1.5, 
            fontWeight: 'bold', 
            textAlign: 'center',
            fontSize: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '0.5rem',
            borderRadius: '0.5rem',
          }}>
            Analysis History
          </Typography>
        
          
          {loading ? (
            <LoadingContainer>
              <CircularProgress size={30} sx={{ color: '#5cabdd' }} />
            </LoadingContainer>
          ) : (
            <Box>
              {history.map((analysis) => (
                <AnalysisItemContainer 
                  key={analysis.id}
                  onClick={() => handleSelectAnalysis(analysis)}
                  sx={{ 
                    borderLeft: analysis.id === selectedAnalysisId ? '3px solid #5cabdd' : 'none',
                    backgroundColor: analysis.id === selectedAnalysisId ? '#2a3744' : '#232e3c',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <SymbolHeader variant="subtitle2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                      {analysis.symbol?.toUpperCase() || 'Unknown'}
                    </SymbolHeader>
                    <StatusChip
                      label={analysis.status}
                      size="small"
                      status={analysis.status}
                    />
                  </Box>
                  
                  <DateDisplay variant="caption" color="text.secondary">
                    {new Date(analysis.createdAt).toLocaleString()}
                  </DateDisplay>
                  
                  <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                  
                  {analysis.id === selectedAnalysisId && renderAnalysisContent(analysis)}
                </AnalysisItemContainer>
              ))}
            </Box>
          )}
        </AnalysisThreadContainer>
      </TelegramAppContainer>
    </>
  );
};

export default TelegramTradingApp; 