import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert, 
  TextField, 
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatService from '../services/chatService';
import { ChatMessage, StyledProps } from '../types';
import SymbolSearch from './SymbolSearch';
import AnalysisHistory from './AnalysisHistory';
import Chat from './Chat';
import { AnalysisItem } from '../types';

// Styled components with improved sizing and spacing
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

// Full height container
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

// Section header styling
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

const ChartIQ: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('BINANCE:BTCUSDT');
  const [history, setHistory] = useState<AnalysisItem[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const symbolRef = useRef<string>('BINANCE:BTCUSDT');
  const chatService = useRef(ChatService.getInstance());
  const messageThreadRef = useRef<HTMLDivElement>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
            createdAt: item.createdAt,
            messages: item.messages.map((msg: ChatMessage) => ({
              id: msg.id,
              content: msg.content,
              role: msg.isUser ? 'USER' : 'ASSISTANT',
              timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
            })),
            chartUrls: item.messages
              .filter((msg: ChatMessage) => msg.chartUrl)
              .map((msg: ChatMessage) => msg.chartUrl as string),
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
  };

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
      }
    };
    
    // Check on mount and when URL changes
    checkUrlForSymbol();
    
    // Listen to URL changes (popstate event)
    const handlePopState = () => {
      checkUrlForSymbol();
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Scroll messages into view when updated
  useEffect(() => {
    if (messageThreadRef.current) {
      messageThreadRef.current.scrollTop = messageThreadRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSelectAnalysis = (analysis: AnalysisItem) => {
    setSelectedAnalysisId(analysis.id);
    
    if (analysis.symbol && analysis.symbol !== symbolRef.current) {
      setSymbol(analysis.symbol);
      symbolRef.current = analysis.symbol;
      
      const url = new URL(window.location.href);
      url.searchParams.set('symbol', analysis.symbol);
      window.history.replaceState({}, '', url.toString());
    }
    
    const formattedMessages: ChatMessage[] = analysis.messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      isUser: msg.role === 'USER',
      chartUrl: msg.role === 'ASSISTANT' ? analysis.chartUrls[0] : undefined,
      symbol: analysis.symbol,
      role: msg.role
    }));
    
    setMessages(formattedMessages);
    setStreamingContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      timestamp: new Date(),
      isUser: true,
      symbol: symbol,
      role: 'USER'
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatService.current.sendMessage(input, symbol);
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.content,
        timestamp: new Date(),
        isUser: false,
        chartUrl: response.chartUrl,
        symbol: symbol,
        role: 'ASSISTANT'
      };

      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
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
    // Reset messages and selectedAnalysisId for a fresh chat session
    setMessages([]);
    setSelectedAnalysisId(null);
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
    
    // Clear existing messages if not continuing an analysis
    if (selectedAnalysisId === null) {
      setStreamingContent('');
    }
    
    setLoading(true);
    setSelectedAnalysisId(null);
    
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

  return (
    <Box sx={{ height: '100%', display: 'flex', gap: 2 }}>
      {/* Analysis History Panel */}
      <Box sx={{ width: '300px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper sx={{ p: 2, backgroundColor: 'rgba(25, 32, 42, 0.95)' }}>
          <SymbolSearch onSearchSubmit={updateSymbol} onAnalyze={handleAnalyze} />
        </Paper>
        <AnalysisHistory
          history={history.map(item => ({
            ...item,
            messages: item.messages.map(msg => ({
              ...msg,
              isUser: msg.role === 'USER'
            }))
          }))}
          selectedAnalysisId={selectedAnalysisId}
          onSelect={handleSelectAnalysis}
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Main Content Area - Now only contains Analysis Chat */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Container */}
        <AnalysisContainer>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" color="primary">Analysis Chat</Typography>
          </Box>
          <MessageThread ref={messageThreadRef}>
            {messages.map((message, index) => (
              <Chat
                key={message.id || index}
                message={message}
                loading={loading}
                error={error}
                streamingContent={streamingContent}
                isLastMessage={index === messages.length - 1}
              />
            ))}
          </MessageThread>
          {/* Chat Input */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Ask about the chart analysis..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !input.trim()}
                  sx={{
                    minWidth: '100px',
                    alignSelf: 'flex-end',
                    backgroundImage: 'linear-gradient(to right, #1565C0, #0D47A1)',
                    '&:hover': {
                      backgroundImage: 'linear-gradient(to right, #0D47A1, #0A2472)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
                </Button>
              </Box>
            </form>
          </Box>
        </AnalysisContainer>
      </Box>
    </Box>
  );
};

export default ChartIQ; 