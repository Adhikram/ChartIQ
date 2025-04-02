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

// Custom components for rendering special sections and technical terms
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

// Enhanced styling for markdown content
const EnhancedMarkdown = styled(ReactMarkdown)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.7,
  '& h1': {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginTop: '1.5rem',
    marginBottom: '1rem',
    color: theme.palette.primary.main,
    borderBottom: `1px solid ${theme.palette.primary.light}`,
    paddingBottom: '0.5rem',
    textAlign: 'center',
  },
  '& h2': {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    color: theme.palette.primary.light,
    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
    paddingBottom: '0.4rem',
  },
  '& h3': {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginTop: '1.2rem',
    marginBottom: '0.5rem',
    color: theme.palette.primary.light,
  },
  '& p': {
    marginBottom: '1rem',
  },
  '& ul, & ol': {
    paddingLeft: '2rem',
    marginBottom: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: '1rem 1rem 1rem 3rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  '& li': {
    marginBottom: '0.5rem',
  },
  '& hr': {
    margin: '1.5rem 0',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  '& strong': {
    color: theme.palette.secondary.main,
    fontWeight: 'bold',
  },
  '& blockquote': {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    paddingLeft: '1rem',
    fontStyle: 'italic',
    margin: '1rem 0',
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '0.75rem',
    borderRadius: '0 4px 4px 0',
  },
  '& .timeframe-header': {
    color: '#03dac6',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: 'rgba(3, 218, 198, 0.1)',
  },
  '& .summary-header': {
    color: '#bb86fc',
    backgroundColor: 'rgba(187, 134, 252, 0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  '& .outlook-header': {
    color: '#ff7597',
    backgroundColor: 'rgba(255, 117, 151, 0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  },
  '& .technical-indicator': {
    color: '#64b5f6',
  },
  '& .list-indicator': {
    color: '#64b5f6',
  },
  '& .summary-section': {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid rgba(25, 118, 210, 0.2)',
    marginTop: '0.5rem',
    marginBottom: '1.5rem',
  },
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
            <EnhancedMarkdown>{formatTechnicalAnalysis(message.content)}</EnhancedMarkdown>
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
            <EnhancedMarkdown>{formatTechnicalAnalysis(streamingContent)}</EnhancedMarkdown>
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