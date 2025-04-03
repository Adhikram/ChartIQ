import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Fade, useMediaQuery, useTheme } from '@mui/material';
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
  // Ref to track previous message count for animations
  const prevMessagesCountRef = useRef<number>(0);
  
  // Get theme and media query
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesCountRef.current = messages.length;
  }, [messages, messageEndRef]);
  
  // Always scroll to bottom when receiving new messages
  useEffect(() => {
    const scrollToBottom = () => {
      if (messages.length > prevMessagesCountRef.current && messageEndRef.current) {
        setTimeout(() => {
          messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    
    scrollToBottom();
    // Also scroll when window is resized
    window.addEventListener('resize', scrollToBottom);
    
    return () => {
      window.removeEventListener('resize', scrollToBottom);
    };
  }, [messages, messageEndRef]);

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
        padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem',
        animation: 'fadeIn 0.3s ease-in-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}>
        <Box sx={{ 
          width: isMobile ? '3.5rem' : '4rem', 
          height: isMobile ? '3.5rem' : '4rem', 
          backgroundColor: '#f0f2ff', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(90, 94, 245, 0.15)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "24" : "28"} height={isMobile ? "24" : "28"} viewBox="0 0 24 24" fill="none" stroke="#5a5ef5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </Box>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#333' }}>
          Start a conversation
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: '#666', maxWidth: '20rem', marginBottom: '1.5rem' }}>
          Search for a stock or cryptocurrency above to analyze trends and get insights.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      flexGrow: 1,
      overflowY: 'auto',
      padding: isMobile ? '0.75rem 0' : '1rem 0',
      position: 'relative', // For proper positioning of children
      '&::-webkit-scrollbar': {
        width: '0.25rem',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '0.25rem',
      }
    }}>
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

        // Check if this is a new message for animation
        const isNewMessage = index >= prevMessagesCountRef.current;

        return (
          <Fade 
            key={message.id} 
            in={true}
            timeout={isNewMessage ? 500 : 0}
            style={{ 
              transitionDelay: isNewMessage ? `${(index - prevMessagesCountRef.current) * 100}ms` : '0ms'
            }}
          >
            <Box id={`message-${message.id}`}>
              {showDateSeparator && (
                <DateSeparator>
                  <Typography variant="caption" sx={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    backgroundColor: 'white', 
                    padding: '0 0.75rem',
                    color: '#666',
                    fontWeight: 'medium',
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                  }}>
                    {new Date(message.timestamp).toLocaleDateString(undefined, {
                      weekday: isMobile ? 'short' : 'long',
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
                  maxWidth: {
                    xs: '88%', // Slightly wider on very small screens
                    sm: '82%', // Slightly wider on small screens
                    md: '70%'  // On medium and up
                  },
                  margin: isMobile ? '0.5rem 0.6rem' : '0.7rem 1.2rem',
                  boxShadow: message.isUser 
                    ? '0 3px 8px rgba(74, 87, 239, 0.25)'
                    : '0 3px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: message.isUser 
                      ? '0 4px 12px rgba(74, 87, 239, 0.3)'
                      : '0 4px 12px rgba(0, 0, 0, 0.12)',
                  },
                  // Mobile specific styles
                  fontSize: isMobile ? '0.9rem' : 'inherit',
                  padding: isMobile ? '0.7rem 0.9rem' : '0.9rem 1.1rem',
                }}
              >
                {message.isUser ? (
                  <Typography variant={isMobile ? "body2" : "body1"} sx={{ 
                    color: '#fff',
                    fontWeight: '400',
                    lineHeight: 1.6,
                    fontSize: isMobile ? '0.9rem' : '0.95rem',
                    letterSpacing: '0.01em',
                  }}>
                    {message.content}
                  </Typography>
                ) : (
                  <Box 
                    component="div"
                    sx={{ 
                      color: '#2d3748', // Darker text for better contrast
                      fontWeight: '400',
                      lineHeight: 1.6,
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                      letterSpacing: '0.01em',
                      '& .mobile-analysis-content': {
                        width: '100%',
                      },
                      '& .timeframe-container': {
                        marginTop: '0.7rem',
                        marginBottom: '0.4rem',
                        padding: '0.4rem 0',
                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                      },
                      '& .section-container': {
                        marginTop: '0.9rem',
                        marginBottom: '0.6rem',
                      },
                      '& .Price-container': {
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        padding: '0.7rem',
                        borderRadius: '0.6rem',
                        marginBottom: '0.9rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                      },
                      '& .On-Balance-container': {
                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        padding: '0.7rem',
                        borderRadius: '0.6rem',
                        marginBottom: '0.9rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                      },
                      '& .Momentum-container': {
                        backgroundColor: 'rgba(255, 152, 0, 0.08)',
                        padding: '0.7rem',
                        borderRadius: '0.6rem',
                        marginBottom: '0.9rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                      },
                      '& .Trend-container': {
                        backgroundColor: 'rgba(156, 39, 176, 0.08)',
                        padding: '0.7rem',
                        borderRadius: '0.6rem',
                        marginBottom: '0.9rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                      },
                      '& .Summary-container': {
                        backgroundColor: 'rgba(13, 71, 161, 0.08)',
                        padding: '0.7rem',
                        borderRadius: '0.6rem',
                        marginBottom: '0.9rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                      },
                      '& .Outlook-container': {
                        backgroundColor: 'rgba(183, 28, 28, 0.08)',
                        padding: '0.7rem',
                        borderRadius: '0.6rem',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                      },
                      '& .indicator-item, & .list-item': {
                        marginBottom: '0.4rem',
                        padding: '0.2rem 0',
                      },
                      '& .timeframe-header': { 
                        fontWeight: '600',
                        color: '#1b5e20',
                        padding: '0.25rem 0',
                        display: 'inline-block',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                      },
                      '& .summary-header, & .section-header': {
                        fontWeight: '600',
                        color: '#0d47a1',
                        padding: '0.25rem 0',
                        display: 'inline-block',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                      },
                      '& .outlook-header': {
                        fontWeight: '600',
                        color: '#b71c1c',
                        padding: '0.25rem 0',
                        display: 'inline-block',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                      },
                      '& .symbol-header': { 
                        fontWeight: '600',
                        color: '#4a57ef',
                        fontSize: isMobile ? '1.1rem' : '1.2rem',
                      },
                      '& .action-header': {
                        fontWeight: '600',
                        color: '#e65100',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                      },
                      '& .technical-indicator': {
                        fontWeight: '600',
                        color: '#4a148c',
                        paddingRight: '0.25rem'
                      },
                      '& .list-indicator': {
                        fontWeight: '600',
                        color: '#004d40',
                        textDecoration: 'underline'
                      },
                      '& h1': {
                        margin: '0.6rem 0',
                        fontSize: isMobile ? '1.1rem' : '1.2rem',
                        textAlign: 'center',
                        color: '#2d3748',
                      },
                      '& h2': {
                        margin: '0.6rem 0 0.5rem',
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        color: '#1b5e20',
                      },
                      '& h3': {
                        margin: '0.6rem 0 0.5rem',
                        fontSize: isMobile ? '0.95rem' : '1rem',
                        color: '#0d47a1',
                      },
                      '& br': {
                        lineHeight: isMobile ? '1.7' : '1.8'
                      },
                      '& strong': {
                        fontWeight: '600',
                        color: '#2d3748',
                      },
                      '& em': {
                        fontStyle: 'italic',
                        color: '#4a5568',
                      },
                      '& div': {
                        width: '100%',
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                  />
                )}
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                  mt: 0.6,
                  mx: 0.3, // Add horizontal margin for timestamps
                }}>
                  <TimeStamp color={message.isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'}>
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </TimeStamp>
                </Box>
              </MessageContainer>
            </Box>
          </Fade>
        );
      })}
      <div ref={messageEndRef} style={{ float: 'left', clear: 'both' }} />
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1, mt: 2 }}>
          <CircularProgress size={isMobile ? 20 : 24} sx={{ color: '#5a5ef5' }} />
        </Box>
      )}
    </Box>
  );
};

export default ChatMessages; 