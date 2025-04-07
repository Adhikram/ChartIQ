import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, InputAdornment, CircularProgress, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { InputContainer, StyledInput, SendButton } from '../styles';

interface ChatInputProps {
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (symbol: string) => void;
  handleKeyPress: (e: React.KeyboardEvent, symbol: string) => void;
  symbol: string;
  statusMessage: string | null;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  chatInput,
  setChatInput,
  handleSendMessage,
  handleKeyPress,
  symbol,
  statusMessage,
  isLoading = false
}) => {
  // Ref for textarea auto-focus
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Auto-focus on input when component mounts
  useEffect(() => {
    if (inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isMobile]);
  
  // Auto-growing input height based on content
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  // Return focus to input after sending a message
  useEffect(() => {
    if (!chatInput && inputRef.current && !isLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatInput, isLoading]);

  return (
    <InputContainer 
      sx={{
        paddingBottom: isMobile ? `max(0.75rem, env(safe-area-inset-bottom))` : '0.75rem',
        position: 'relative',
        // Add shadow above the input
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10px',
          left: 0,
          right: 0,
          height: '10px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.05), transparent)',
          pointerEvents: 'none',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-end',
        position: 'relative',
        width: '100%'
      }}>
        <StyledInput
          fullWidth
          inputRef={inputRef}
          multiline
          maxRows={4}
          placeholder="Message..."
          variant="outlined"
          value={chatInput}
          onChange={handleInputChange}
          onKeyPress={(e) => handleKeyPress(e, symbol)}
          disabled={isLoading}
          sx={{
            mb: 0.5, // Add small margin at bottom
            '& .MuiOutlinedInput-root': {
              padding: isMobile ? '8px 12px' : '12px 16px', // Adjust padding for mobile
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: '#10a37f' }} />
                ) : (
                  <SendButton 
                    onClick={() => handleSendMessage(symbol)} 
                    disabled={chatInput.trim() === ''}
                    aria-label="Send message"
                    sx={{
                      width: isMobile ? '32px' : '36px', // Slightly smaller on mobile
                      height: isMobile ? '32px' : '36px',
                    }}
                  >
                    <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </SendButton>
                )}
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Status Message or Hint */}
      {(statusMessage || isLoading) && (
        <Box sx={{ 
          minHeight: '18px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          mt: 0.25,
        }}>
          {isLoading ? (
            <Typography variant="caption" sx={{ color: '#10a37f', fontWeight: 500, fontSize: '0.7rem' }}>
              {statusMessage || 'Thinking...'}
            </Typography>
          ) : statusMessage ? (
            <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.7rem' }}>
              {statusMessage}
            </Typography>
          ) : null}
        </Box>
      )}
      
      {/* Disclaimer */}
      <Typography variant="caption" sx={{ 
        textAlign: 'center', 
        color: 'rgba(0, 0, 0, 0.5)', 
        fontSize: '0.65rem', 
        mt: 0.5,
        display: 'block',
        px: 1,
        opacity: 0.8,
      }}>
        ChartIQ may produce inaccurate information. Verify all information before making investment decisions.
      </Typography>
    </InputContainer>
  );
};

export default ChatInput; 