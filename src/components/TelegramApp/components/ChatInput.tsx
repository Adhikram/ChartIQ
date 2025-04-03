import React from 'react';
import { Box, Typography, InputAdornment } from '@mui/material';
import { ChatContainer, MessageInput, SendButton } from '../styles/TelegramAppStyles';

interface ChatInputProps {
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (symbol: string) => void;
  handleKeyPress: (e: React.KeyboardEvent, symbol: string) => void;
  symbol: string;
  statusMessage: string | null;
}

/**
 * Component for chat input with send button
 */
const ChatInput: React.FC<ChatInputProps> = ({
  chatInput,
  setChatInput,
  handleSendMessage,
  handleKeyPress,
  symbol,
  statusMessage
}) => {
  return (
    <Box sx={{ 
      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: '#fff',
    }}>
      {/* Asset info (shown when a symbol is selected) */}
      {symbol && (
        <Box sx={{ 
          padding: '0.5rem 1rem',
          backgroundColor: '#f8f9ff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="subtitle2" sx={{ 
            fontWeight: 'bold',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            {symbol}
          </Typography>
          {statusMessage && (
            <Typography variant="caption" sx={{ color: '#666' }}>
              {statusMessage}
            </Typography>
          )}
        </Box>
      )}
      
      {/* Chat Messages Input */}
      <ChatContainer>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MessageInput
            fullWidth
            placeholder="Ask about technical analysis..."
            variant="outlined"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, symbol)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SendButton onClick={() => handleSendMessage(symbol)} disabled={chatInput.trim() === ''}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </SendButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ mt: 0.5, color: 'rgba(0, 0, 0, 0.5)', fontSize: '0.7rem' }}>
          Try asking about support/resistance levels, trend analysis, or recommendations
        </Typography>
      </ChatContainer>
    </Box>
  );
};

export default ChatInput; 