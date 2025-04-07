import React, { useEffect, useRef } from 'react';
import { Box, Typography, CircularProgress, Fade, useMediaQuery, useTheme } from '@mui/material';
import { formatTechnicalAnalysis } from '../../../services/MessageUtil';
import { ChatMessage } from '../types';
import { MessageContainer, DateSeparator, TimeStamp, LoadingContainer, MessageWrapper, MessageAvatar } from '../styles';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  messageEndRef: React.RefObject<HTMLDivElement>;
}

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
        color: '#343541',
        backgroundColor: '#f7f7f8'
      }}>
        <Box sx={{ 
          width: isMobile ? '3.5rem' : '4rem', 
          height: isMobile ? '3.5rem' : '4rem', 
          backgroundColor: '#e6f7f2', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 12px rgba(16, 163, 127, 0.15)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.7274 20.4471C21.2795 19.2512 22.5433 17.7025 23.4147 15.9183C24.2861 14.1341 24.7371 12.1633 24.7302 10.1661C24.7302 4.55439 19.5952 0 12.9998 0C6.40451 0 1.26941 4.55439 1.26941 10.1661C1.26941 15.7778 6.40451 20.3321 12.9998 20.3321C13.7473 20.3321 14.4798 20.2718 15.1897 20.1587C16.2343 21.3641 17.8958 22.5 19.3977 22.5C19.6277 22.5 19.8576 22.3869 19.9726 22.1905C20.1025 21.9489 20.0176 21.6219 19.7576 21.4786C18.9727 21.0562 18.2249 20.5534 18.0348 20.1133C18.0343 20.1133 19.3123 20.9392 19.7274 20.4471ZM19.1227 19.8639C18.937 19.8639 18.7507 19.9086 18.5893 19.9924C18.5624 19.9429 18.5329 19.8947 18.5007 19.8483C18.4392 19.7596 18.3707 19.677 18.2961 19.6006C18.83 19.106 19.301 18.5516 19.6982 17.9499C20.5421 16.6221 21 15.0575 21 13.5H22.71C22.71 15.0204 22.3079 16.5182 21.5471 17.8541C20.7863 19.1899 19.6904 20.3198 18.3602 21.1323C18.3602 21.1323 18.36 21.1325 18.36 21.1325C18.6283 20.9032 18.8754 20.6588 19.1006 20.3994C19.1061 20.1092 19.121 19.8639 19.1227 19.8639ZM8.71 10.8H9.79V11.88C9.79 12.15 10.01 12.37 10.28 12.37C10.55 12.37 10.77 12.15 10.77 11.88V10.8H11.85C12.12 10.8 12.34 10.58 12.34 10.31C12.34 10.04 12.12 9.82 11.85 9.82H10.77V8.74C10.77 8.47 10.55 8.25 10.28 8.25C10.01 8.25 9.79 8.47 9.79 8.74V9.82H8.71C8.44 9.82 8.22 10.04 8.22 10.31C8.22 10.58 8.44 10.8 8.71 10.8ZM3.29 13.43C3.56 13.43 3.78 13.21 3.78 12.94C3.78 12.67 3.56 12.45 3.29 12.45H3.28C3.01 12.45 2.79 12.67 2.79 12.94C2.79 13.21 3.01 13.43 3.29 13.43ZM5.5 13.43C5.77 13.43 5.99 13.21 5.99 12.94C5.99 12.67 5.77 12.45 5.5 12.45H5.49C5.22 12.45 5 12.67 5 12.94C5 13.21 5.22 13.43 5.5 13.43Z" fill="#10a37f"/>
          </svg>
        </Box>
        <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#343541' }}>
          How can I help you today?
        </Typography>
        <Typography variant={isMobile ? "body2" : "body1"} sx={{ color: '#666', maxWidth: '20rem', marginBottom: '1.5rem' }}>
          Ask about technical analysis, market trends, or specific stocks.
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      className="message-thread-container"
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        flexGrow: 1,
        overflowY: 'auto',
        padding: isMobile ? '0.75rem 0' : '1rem 0',
        position: 'relative',
        backgroundColor: '#f7f7f8',
      }}
    >
      {/* Loading indicator for loading more messages at top */}
      {loading && messages.length > 0 && (
        <LoadingContainer>
          <CircularProgress size={16} sx={{ color: '#10a37f', marginRight: '8px' }} />
          <Typography variant="caption" sx={{ color: '#666' }}>Loading messages...</Typography>
        </LoadingContainer>
      )}
      
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

        // Determine if this is a system message for icon selection
        const isSystemMessage = message.role === 'SYSTEM';

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
                    backgroundColor: '#f7f7f8', 
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
              
              <MessageWrapper isUser={message.isUser}>
                {!message.isUser && (
                  <MessageAvatar isUser={false}>
                    {isSystemMessage ? (
                      // Display a database/system icon for system messages
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 3.34 2 5V19C2 20.66 6.48 22 12 22C17.52 22 22 20.66 22 19V5C22 3.34 17.52 2 12 2ZM12 4C16.42 4 20 5.09 20 6C20 6.91 16.42 8 12 8C7.58 8 4 6.91 4 6C4 5.09 7.58 4 12 4ZM4 8.55C5.84 9.45 8.75 10 12 10C15.25 10 18.16 9.45 20 8.55V11C20 11.91 16.42 13 12 13C7.58 13 4 11.91 4 11V8.55ZM4 13.55C5.84 14.45 8.75 15 12 15C15.25 15 18.16 14.45 20 13.55V16C20 16.91 16.42 18 12 18C7.58 18 4 16.91 4 16V13.55ZM4 18.55C5.84 19.45 8.75 20 12 20C15.25 20 18.16 19.45 20 18.55V19C20 19.91 16.42 21 12 21C7.58 21 4 19.91 4 19V18.55Z" fill="#0288D1"/>
                      </svg>
                    ) : (
                      // Display the standard assistant icon for regular assistant messages
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 14H21C21 10.13 17.87 7 14 7H13V5.73C13.6 5.39 14 4.74 14 4C14 2.9 13.1 2 12 2C10.9 2 10 2.9 10 4C10 4.74 10.4 5.39 11 5.73V7H10C6.13 7 3 10.13 3 14H2C1.45 14 1 14.45 1 15V18C1 18.55 1.45 19 2 19H3V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V19H22C22.55 19 23 18.55 23 18V15C23 14.45 22.55 14 22 14ZM21 17H19V20H5V17H3V16H5V14C5 11.24 7.24 9 10 9H14C16.76 9 19 11.24 19 14V16H21V17ZM8.5 13.5C7.67 13.5 7 14.17 7 15C7 15.83 7.67 16.5 8.5 16.5C9.33 16.5 10 15.83 10 15C10 14.17 9.33 13.5 8.5 13.5ZM15.5 13.5C14.67 13.5 14 14.17 14 15C14 15.83 14.67 16.5 15.5 16.5C16.33 16.5 17 15.83 17 15C17 14.17 16.33 13.5 15.5 13.5Z" fill="#333333"/>
                      </svg>
                    )}
                  </MessageAvatar>
                )}
                
                <MessageContainer isUser={message.isUser}>
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
                          backgroundColor: 'rgba(0, 137, 123, 0.08)',
                          padding: '0.7rem',
                          borderRadius: '0.6rem',
                          marginBottom: '0.5rem',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                        },
                        '& .Signals-container': {
                          backgroundColor: 'rgba(96, 125, 139, 0.08)',
                          padding: '0.7rem',
                          borderRadius: '0.6rem',
                          marginBottom: '0.5rem',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
                        },
                        '& .assistant-prefix': {
                          fontWeight: 'bold',
                          color: isSystemMessage ? '#0288D1' : '#10a37f', // Different color for system messages
                          marginBottom: '0.5rem',
                          display: 'block',
                        },
                        '& mark': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                          color: 'rgba(25, 118, 210, 0.9)',
                          padding: '0.1rem 0.3rem',
                          borderRadius: '0.2rem',
                        }
                      }}
                      dangerouslySetInnerHTML={{__html: formattedContent}}
                    />
                  )}
                  
                  <TimeStamp>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isSystemMessage && (
                      <span style={{ 
                        marginLeft: '5px', 
                        fontSize: '0.7rem', 
                        color: '#0288D1', 
                        fontWeight: 'bold' 
                      }}>
                        SYSTEM
                      </span>
                    )}
                  </TimeStamp>
                </MessageContainer>
                
                {message.isUser && (
                  <MessageAvatar isUser={true}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C6.53 18.01 6.48 17.84 6.54 17.68C7.18 15.72 9.39 14.5 12 14.5C14.61 14.5 16.82 15.72 17.46 17.68C17.52 17.84 17.47 18.01 17.34 18.12C15.9 19.33 14.03 20 12 20Z" fill="#ffffff"/>
                    </svg>
                  </MessageAvatar>
                )}
              </MessageWrapper>
            </Box>
          </Fade>
        );
      })}
      
      {/* Element for auto-scrolling to the end of messages */}
      <div ref={messageEndRef} style={{ height: '1px', width: '100%' }} />
    </Box>
  );
};

export default ChatMessages; 