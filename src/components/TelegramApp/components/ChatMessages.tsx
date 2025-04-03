import React, { useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { ChatMessage } from '../../../types';
import { MessageContainer, DateSeparator, TimeStamp } from '../styles/TelegramAppStyles';
import { formatTechnicalAnalysis } from '../../../services/MessageUtil';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  messageEndRef: React.RefObject<HTMLDivElement>;
}

/**
 * Component to display chat messages
 */
const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, loading, messageEndRef }) => {
  // Debug: Log messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      console.log(`Rendering ${messages.length} messages`);
      // Log the content of the first assistant message for debugging
      const assistantMsg = messages.find(m => !m.isUser);
      if (assistantMsg) {
        console.log('Sample assistant message content:', assistantMsg.content.substring(0, 100) + '...');
      }
    }
  }, [messages]);

  // If no messages, show empty state
  if (messages.length === 0) {
    return (
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem 1.5rem',
      }}>
        <Box sx={{ 
          width: '4rem', 
          height: '4rem', 
          backgroundColor: '#f0f2ff', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5a5ef5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>
          Start a conversation
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', maxWidth: '20rem', marginBottom: '1.5rem' }}>
          Search for a stock or cryptocurrency above to analyze trends and get insights.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Group and display messages */}
      {messages.map((message, index) => {
        // Check if we should show a date separator
        const showDateSeparator = index === 0 || 
          new Date(message.timestamp).toDateString() !== 
          new Date(messages[index - 1].timestamp).toDateString();
        
        // Format message content if it's an assistant message with technical analysis
        const formattedContent = !message.isUser 
          ? formatTechnicalAnalysis(message.content) 
          : message.content;

        // Debug: Log the raw and formatted content
        if (!message.isUser) {
          console.log(`Message ${index} - Raw Length: ${message.content.length}, Formatted Length: ${formattedContent.length}`);
        }

        return (
          <React.Fragment key={message.id}>
            {showDateSeparator && (
              <DateSeparator>
                <Typography variant="caption" sx={{ 
                  position: 'relative', 
                  zIndex: 1, 
                  backgroundColor: 'white', 
                  padding: '0 0.75rem',
                  color: '#666',
                  fontWeight: 'medium',
                  fontSize: '0.75rem',
                }}>
                  {new Date(message.timestamp).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Typography>
              </DateSeparator>
            )}
            <MessageContainer
              isUser={message.isUser}
              sx={{
                alignSelf: message.isUser ? 'flex-end' : 'flex-start',
              }}
            >
              {message.isUser ? (
                <Typography variant="body2" sx={{ 
                  color: message.isUser ? '#fff' : '#333',
                  fontWeight: '400',
                  lineHeight: 1.5,
                }}>
                  {message.content}
                </Typography>
              ) : (
                <Box 
                  component="div"
                  sx={{ 
                    color: '#333',
                    fontWeight: '400',
                    lineHeight: 1.5,
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    fontSize: '0.875rem',
                    '& .timeframe-header': { 
                      fontWeight: 'bold',
                      color: '#1b5e20'
                    },
                    '& .summary-header': {
                      fontWeight: 'bold',
                      color: '#0d47a1'
                    },
                    '& .outlook-header': {
                      fontWeight: 'bold',
                      color: '#b71c1c'
                    },
                    '& .technical-indicator': {
                      fontWeight: 'bold',
                      color: '#4a148c'
                    },
                    '& .list-indicator': {
                      fontWeight: 'bold',
                      textDecoration: 'underline'
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
              )}
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                mt: 0.5,
              }}>
                <TimeStamp color={message.isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </TimeStamp>
              </Box>
            </MessageContainer>
          </React.Fragment>
        );
      })}
      <div ref={messageEndRef} />
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={20} sx={{ color: '#5a5ef5' }} />
        </Box>
      )}
    </>
  );
};

export default ChatMessages; 