import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';

interface ChatProps {
  message: ChatMessage;
  loading: boolean;
  error: string | null;
  streamingContent: string;
  isLastMessage: boolean;
}

const MessageThread = styled(Box)(({ theme }) => ({
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

const Chat: React.FC<ChatProps> = ({
  message,
  loading,
  error,
  streamingContent,
  isLastMessage
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
      }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Analysis Chat - <span style={{ color: '#1976d2' }}>{message.symbol}</span>
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ m: 2, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}
      
      <MessageThread>
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
        
        {streamingContent && (
          <Box sx={{ padding: 3, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(25, 118, 210, 0.2)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', margin: 1, position: 'relative', transition: 'all 0.3s ease' }}>
            <Box 
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(25, 118, 210, 0.7)',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
            >
              LIVE
            </Box>
            <ReactMarkdown>{streamingContent}</ReactMarkdown>
          </Box>
        )}
        
        {loading && !streamingContent && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <Typography sx={{ mr: 2, opacity: 0.7 }}>Analyzing {message.symbol}</Typography>
            <CircularProgress size={24} thickness={4} color="primary" />
          </Box>
        )}
        
        {!loading && !streamingContent && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            opacity: 0.7,
            p: 3
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>No Analysis Selected</Typography>
            <Typography variant="body2" align="center" sx={{ maxWidth: 400 }}>
              Go to the Dashboard tab to select a symbol and analyze it,<br />
              or choose a previous analysis from the sidebar.
            </Typography>
          </Box>
        )}
      </MessageThread>
    </Box>
  );
};

export default Chat; 