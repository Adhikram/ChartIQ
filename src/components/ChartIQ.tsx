import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress, Alert, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatService from '../services/chatService';
import { ChatMessage, StyledProps, MessageProps, TradingViewWidget } from '../types';

// Styled components
const ChartContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  height: '600px',
  display: 'flex',
  flexDirection: 'column',
}));

const AnalysisContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(2),
  maxHeight: '400px',
  overflowY: 'auto',
}));

const MessageThread = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const Message = styled(Box)<MessageProps>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: isUser ? theme.palette.primary.light : theme.palette.background.default,
  maxWidth: '80%',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
}));

const InputContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

declare global {
  interface Window {
    TradingView: any;
  }
}

const ChartIQ: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
  const tradingViewRef = useRef<TradingViewWidget | null>(null);
  const chatService = useRef(ChatService.getInstance());

  useEffect(() => {
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
          height: 500,
          width: '100%',
          hideideas: true,
          studies: [
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies',
          ],
        });
      }
    };
    document.head.appendChild(script);

    // Load chat history
    const loadHistory = async () => {
      const history = await chatService.current.loadChatHistory('user123');
      if (history.length > 0) {
        setMessages(history[0].messages);
      }
    };
    loadHistory();

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (tradingViewRef.current) {
      tradingViewRef.current.setSymbol(symbol, '1D');
    }
  }, [symbol]);

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await chatService.current.sendMessage(symbol);
      if (response.error) {
        throw new Error(response.error);
      }

      setMessages(response.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ChartContainer elevation={3}>
        <Typography variant="h5" gutterBottom>
          Technical Analysis Dashboard
        </Typography>
        <Box id="tradingview_chart" sx={{ flex: 1 }} />
      </ChartContainer>

      <AnalysisContainer elevation={3}>
        <Typography variant="h6" gutterBottom>
          Analysis Results
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        )}
        <MessageThread>
          {messages.map((message) => (
            <Message key={message.id} isUser={message.isUser}>
              <Typography variant="body1">{message.content}</Typography>
              {message.chartUrl && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={message.chartUrl}
                    alt="Technical Analysis Chart"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
            </Message>
          ))}
        </MessageThread>
        <InputContainer>
          <TextField
            fullWidth
            label="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            variant="outlined"
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={loading}
          >
            Analyze
          </Button>
        </InputContainer>
      </AnalysisContainer>
    </Box>
  );
};

export default ChartIQ; 