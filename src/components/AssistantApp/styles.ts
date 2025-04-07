import { styled } from '@mui/material/styles';
import { Box, Paper, TextField, Button, IconButton, Typography } from '@mui/material';
import { createGlobalStyle } from 'styled-components';

// Global styles for the AssistantApp
export const GlobalStyle = createGlobalStyle`
  body {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
    -webkit-tap-highlight-color: transparent;
  }
`;

// Main container
export const AppContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  maxHeight: '100vh',
  width: '100%',
  maxWidth: '100vw',
  backgroundColor: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
}));

// Header
export const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.8rem 1rem',
  backgroundColor: '#ffffff',
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
}));

// Messages container
export const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '0.5rem 0',
  scrollBehavior: 'smooth',
  position: 'relative',
  backgroundColor: '#f7f7f8',
  WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
  overscrollBehavior: 'contain', // Prevent pull-to-refresh on mobile
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
  },
}));

// Message date separator
export const DateSeparator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '1rem 0',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '5%',
    right: '5%',
    height: '1px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 0,
  },
}));

// Message wrapper to handle alignment
export const MessageWrapper = styled(Box)<{ isUser: boolean }>(({ isUser }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  width: '100%',
  padding: '0.2rem 1rem',
  position: 'relative',
}));

// User/AI Avatar
export const MessageAvatar = styled(Box)<{ isUser: boolean }>(({ isUser }) => ({
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: isUser ? '#10a37f' : '#f0f0f0',
  color: isUser ? '#ffffff' : '#333333',
  fontWeight: 'bold',
  fontSize: '0.8rem',
  marginRight: isUser ? '0' : '0.6rem',
  marginLeft: isUser ? '0.6rem' : '0',
  flexShrink: 0,
}));

// Individual message container (update)
export const MessageContainer = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '75%',
  padding: '0.9rem 1.1rem',
  borderRadius: '1rem',
  backgroundColor: isUser ? '#10a37f' : '#ffffff',
  color: isUser ? '#ffffff' : '#343541',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  wordBreak: 'break-word',
  transition: 'all 0.2s ease',
  border: isUser ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
  borderTopLeftRadius: isUser ? '1rem' : '0.3rem',
  borderTopRightRadius: isUser ? '0.3rem' : '1rem',
}));

// Message timestamp
export const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: 'rgba(0, 0, 0, 0.5)',
  marginTop: '0.3rem',
  alignSelf: 'flex-end',
}));

// Input container
export const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '0.75rem 1rem',
  backgroundColor: '#ffffff',
  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  position: 'sticky',
  bottom: 0,
  zIndex: 10,
  boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)',
}));

// Message input
export const StyledInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '0.9rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
    padding: '0.5rem 0.5rem 0.5rem 1rem',
    fontSize: '0.95rem',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: '1px !important',
      transition: 'border-color 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(16, 163, 127, 0.3)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#10a37f',
      boxShadow: '0 0 0 1px rgba(16, 163, 127, 0.3)',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '0.7rem 0.25rem',
    fontSize: '0.95rem',
    lineHeight: 1.5,
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.4)',
      opacity: 1,
    }
  },
}));

// Send button
export const SendButton = styled(IconButton)(({ theme, disabled }) => ({
  width: '36px',
  height: '36px',
  backgroundColor: disabled ? 'rgba(16, 163, 127, 0.4)' : '#10a37f',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: disabled ? 'rgba(16, 163, 127, 0.4)' : '#0d8f6f',
  },
  '&:disabled': {
    color: '#ffffff',
    opacity: 0.6,
  },
  marginLeft: '0.5rem',
  transition: 'all 0.2s ease',
}));

// Empty state container
export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  textAlign: 'center',
  padding: '2rem 1.5rem',
}));

// Loading indicator for messages
export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0.5rem 0',
  padding: '0.5rem',
  borderRadius: '1rem',
  backgroundColor: 'rgba(16, 163, 127, 0.1)',
  width: 'fit-content',
  alignSelf: 'center',
})); 