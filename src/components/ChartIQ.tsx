import React, { useState, useEffect, useRef } from 'react';
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
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatService from '../services/chatService';
import { ChatMessage, StyledProps, TradingViewWidget } from '../types';
import ReactMarkdown from 'react-markdown';

// Styled components with improved sizing and spacing
const ChartContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  height: '500px', // Reduced height
  display: 'flex',
  flexDirection: 'column',
}));

const AnalysisContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  height: '650px', // Increased height to focus on history
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
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
  backgroundColor: isUser ? theme.palette.primary.dark : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  maxWidth: '90%', // Increased to allow more content
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[2],
  wordBreak: 'break-word',
}));

const InputContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: 'auto', // Push to bottom
  backgroundColor: theme.palette.background.paper,
  borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
}));

const SectionHeaderContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1, 2),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
}));

const StyledDrawer = styled(Drawer)(({ theme }: StyledProps) => ({
  width: 280,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 280,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.default,
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

const StreamingMessage = styled(Box)(({ theme }: StyledProps) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  margin: theme.spacing(1, 0),
  position: 'relative',
  transition: 'all 0.3s ease',
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

const FullHeightBox = styled(Box)({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
});

const ContentBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

// Add a new styled component for the status badge in the history list
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
  ...(status === 'COMPLETED' && {
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    color: '#fff',
  }),
  ...(status === 'ANALYZING' && {
    backgroundColor: theme.palette.info.dark,
    color: '#fff',
  }),
  ...(status === 'GENERATING_CHARTS' && {
    backgroundColor: theme.palette.warning.dark,
    color: '#fff',
  }),
  ...(status === 'FAILED' && {
    backgroundColor: theme.palette.error.dark,
    color: '#fff',
  }),
}));

declare global {
  interface Window {
    TradingView: { widget: new (config: any) => TradingViewWidget; };
  }
}

// Interface for analysis history items
interface AnalysisHistoryItem {
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

const ChartIQ: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const [showChart, setShowChart] = useState(false); // Default to hiding chart
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const tradingViewRef = useRef<TradingViewWidget | null>(null);
  const chatService = useRef(ChatService.getInstance());
  const messageThreadRef = useRef<HTMLDivElement>(null);

  // Load history on initial render
  useEffect(() => {
    // Load analysis history
    const fetchHistory = async () => {
      try {
        const history = await chatService.current.loadChatHistory('user123');
        if (history && history.length > 0) {
          // Convert ChatHistory[] to AnalysisHistoryItem[]
          const formattedHistory: AnalysisHistoryItem[] = history.map(item => ({
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
          setAnalysisHistory(formattedHistory);
        }
      } catch (err) {
        console.error('Error loading analysis history:', err);
      }
    };
    
    fetchHistory();
  }, []);

  // Scroll messages into view when updated
  useEffect(() => {
    if (messageThreadRef.current) {
      messageThreadRef.current.scrollTop = messageThreadRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Initialize TradingView widget only when needed
  useEffect(() => {
    if (!showChart) return;
    
    // Initialize TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        tradingViewRef.current = new window.TradingView.widget({
          container_id: 'tradingview_chart',
          symbol: symbol,
          interval: '1D',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: false,
          height: '100%', // Use 100% to fit container
          width: '100%',
          hideideas: true,
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies',
          ],
          autosize: true, // Enable autosize
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [showChart, symbol]);

  const handleSelectAnalysis = (analysis: AnalysisHistoryItem) => {
    setSelectedAnalysisId(analysis.id);
    setSymbol(analysis.symbol);
    
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

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);
      setStreamingContent('');
      setSelectedAnalysisId(null);

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Analyzing ${symbol}`,
        timestamp: new Date(),
        isUser: true,
      };
      setMessages([userMessage]);

      // First, generate charts
      const generateResponse = await fetch('/api/generate-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          symbol 
        })
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate charts');
      }

      const generateData = await generateResponse.json();
      
      if (!generateData.chartUrls || generateData.chartUrls.length === 0) {
        throw new Error('No charts were generated');
      }

      // Now analyze the generated charts
      const response = await fetch('/api/analyze-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chartUrls: generateData.chartUrls,
          symbol,
          userId: 'user123'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze charts');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      const decoder = new TextDecoder();
      let chartUrl = generateData.chartUrls[0]; // Use the first chart URL
      let completedAnalysis = '';

      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              switch (data.type) {
                case 'images':
                  // Store first chart URL if provided
                  if (data.data && data.data.length > 0) {
                    chartUrl = data.data[0];
                  }
                  break;
                case 'content':
                  // Update streaming content
                  completedAnalysis += data.data;
                  setStreamingContent(prev => prev + data.data);
                  break;
                case 'error':
                  throw new Error(data.error);
                case 'done':
                  // Explicitly save the completed analysis to database
                  await fetch('/api/save-analysis', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      symbol,
                      analysis: completedAnalysis,
                      chartUrls: generateData.chartUrls,
                      userId: 'user123'
                    })
                  });
                  
                  // Streaming complete, refresh history
                  const history = await chatService.current.loadChatHistory('user123');
                  if (history && history.length > 0) {
                    // Convert ChatHistory[] to AnalysisHistoryItem[]
                    const formattedHistory: AnalysisHistoryItem[] = history.map(item => ({
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
                    setAnalysisHistory(formattedHistory);
                  }
                  break;
              }
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }

      // When streaming completes, set final message
      if (streamingContent) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: streamingContent,
          timestamp: new Date(),
          isUser: false,
          chartUrl: chartUrl,
        };
        setMessages([userMessage, aiMessage]);
        setStreamingContent('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'ANALYZING': return 'info';
      case 'GENERATING_CHARTS': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  // Convert status to display text
  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case 'COMPLETED': return 'DONE';
      default: return status;
    }
  };

  return (
    <FullHeightBox>
      {/* Sidebar with Analysis History */}
      <StyledDrawer variant="permanent" anchor="left">
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" noWrap component="div">
            Analysis History
          </Typography>
        </Box>
        <Divider />
        <List sx={{ overflow: 'auto', flex: 1 }}>
          {analysisHistory.map((analysis) => (
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
        {/* Collapsible Chart Section */}
        <Collapse in={showChart}>
          <ChartContainer elevation={3}>
            <SectionHeaderContainer>
              <Typography variant="h6">Trading Chart</Typography>
              <IconButton onClick={toggleChart}>
                <Typography variant="h6">▲</Typography>
              </IconButton>
            </SectionHeaderContainer>
            <Box id="tradingview_chart" sx={{ flex: 1, width: '100%' }} />
          </ChartContainer>
        </Collapse>

        {/* Analysis Results Section */}
        <AnalysisContainer elevation={3}>
          <SectionHeaderContainer>
            <Typography variant="h6">
              Analysis Results
            </Typography>
            {!showChart && (
              <IconButton onClick={toggleChart}>
                <Typography variant="h6">▼</Typography>
              </IconButton>
            )}
          </SectionHeaderContainer>
          
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
            
            {/* Loading indicator */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} thickness={4} />
              </Box>
            )}
          </MessageThread>
          
          <InputContainer>
            <TextField
              fullWidth
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              variant="outlined"
              size="small"
              placeholder="Enter trading pair (e.g., BINANCE:BTCUSDT)"
            />
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading}
              sx={{ minWidth: '120px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
            </Button>
          </InputContainer>
        </AnalysisContainer>
      </ContentBox>
    </FullHeightBox>
  );
};

export default ChartIQ; 