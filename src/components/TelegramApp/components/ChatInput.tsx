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