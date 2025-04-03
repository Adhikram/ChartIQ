import { Box, Paper, Typography, Chip, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import { createGlobalStyle } from 'styled-components';
import { StyledProps, MessageProps } from '../../../types';

// Setup global media queries for different iPhone viewports
export const GlobalStyle = createGlobalStyle`
  /* iPhone 15 - Telegram Mini App */
  @media (min-width: 320px) and (max-width: 340px) {
    html {
      font-size: 12px;
    }
    body {
      max-width: 320px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 12 Mini, 13 Mini - Telegram Mini App */
  @media (min-width: 330px) and (max-width: 350px) {
    html {
      font-size: 13px;
    }
    body {
      max-width: 330px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 11 Pro, 14 Pro - Telegram Mini App */
  @media (min-width: 340px) and (max-width: 375px) {
    html {
      font-size: 14px;
    }
    body {
      max-width: 340px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 12, 13, 14 - Telegram Mini App */
  @media (min-width: 350px) and (max-width: 390px) {
    html {
      font-size: 15px;
    }
    body {
      max-width: 350px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 12 Pro Max, 14 Pro - Telegram Mini App */
  @media (min-width: 390px) and (max-width: 430px) {
    html {
      font-size: 16px;
    }
    body {
      max-width: 390px;
      margin: 0 auto;
    }
  }
  
  /* iPhone 15 Pro, 16 - Telegram Mini App */
  @media (min-width: 400px) {
    html {
      font-size: 17px;
    }
    body {
      max-width: 400px;
      margin: 0 auto;
    }
  }
  
  /* Additional global styles for Telegram Mini App */
  body {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    overscroll-behavior: none;
    user-select: none;
    padding: 0;
  }
`;

// Styled components for App
export const TelegramAppContainer = styled(Box)(({ theme }: StyledProps) => ({
  padding: 0,
  margin: '0 auto', // Center the container
  height: '100%',
  maxHeight: '100vh',
  width: '100%',
  maxWidth: '100%', // Full width on mobile 
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#f5f7fa', // Light gray background
  color: '#333',
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', // Lighter shadow
}));

export const Header = styled(Box)(({ theme }: StyledProps) => ({
  padding: '1rem 1rem 0.75rem',
  backgroundColor: '#5a5ef5', // Indigo color
  position: 'sticky',
  top: 0,
  zIndex: 10,
  textAlign: 'center', // Center text in header
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Subtle shadow
}));

export const AnalysisThreadContainer = styled(Box)(({ theme }: StyledProps) => ({
  flex: 1,
  overflow: 'auto',
  padding: '0.5rem',
  height: 'calc(100vh - 7.25rem)', // Responsive height based on rem
  display: 'flex', 
  flexDirection: 'column',
  backgroundColor: '#ffffff', // White background
  WebkitOverflowScrolling: 'touch', // Add momentum scrolling for iOS
  touchAction: 'pan-y', // Enable vertical touch scrolling
  '&::-webkit-scrollbar': {
    width: '0.25rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.25rem',
  },
}));

export const AnalysisItemContainer = styled(Paper)(({ theme }: StyledProps) => ({
  padding: '1rem',
  marginBottom: '0.75rem',
  backgroundColor: '#ffffff',
  borderRadius: '0.75rem', // Rounded corners
  border: '1px solid #f0f0f0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  WebkitTapHighlightColor: 'rgba(0,0,0,0)', // Remove tap highlight on mobile
  '&:hover': {
    backgroundColor: '#f8f9ff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
    transform: 'translateY(-2px)',
  },
  '&:active': { // Add active state for touch feedback
    backgroundColor: '#f0f2ff',
    transform: 'scale(0.98)',
  },
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', // Subtle shadow
}));

export const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  height: '1.5rem',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  borderRadius: '1rem', // Full rounded for modern look
  padding: '0 0.5rem',
  ...(status === 'COMPLETED' && {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  }),
  ...(status === 'ANALYZING' && {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  }),
  ...(status === 'GENERATING_CHARTS' && {
    backgroundColor: '#fff8e1',
    color: '#f57c00',
  }),
  ...(status === 'FAILED' && {
    backgroundColor: '#ffebee',
    color: '#c62828',
  }),
}));

// Enhanced markdown content styling
export const EnhancedMarkdown = styled(ReactMarkdown)(({ theme }: StyledProps) => ({
  fontSize: '0.95rem',
  lineHeight: 1.7,
  color: '#333',
  '& h1': {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    marginTop: '1rem',
    marginBottom: '0.8rem',
    color: '#5a5ef5',
    borderBottom: '1px solid rgba(90, 94, 245, 0.2)',
    paddingBottom: '0.4rem',
    textAlign: 'center',
  },
  '& h2': {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginTop: '1rem',
    marginBottom: '0.6rem',
    color: '#5a5ef5',
    borderBottom: '1px solid rgba(90, 94, 245, 0.1)',
    paddingBottom: '0.3rem',
  },
  '& h3': {
    fontSize: '1.05rem',
    fontWeight: 'bold',
    marginTop: '0.8rem',
    marginBottom: '0.4rem',
    color: '#5a5ef5',
  },
  '& p': {
    marginBottom: '0.7rem',
  },
  '& ul, & ol': {
    paddingLeft: '1.5rem',
    marginBottom: '0.8rem',
    backgroundColor: '#f8f9ff',
    padding: '0.7rem 0.7rem 0.7rem 2rem',
    borderRadius: '0.5rem',
    border: '1px solid #f0f0f0',
  },
  '& li': {
    marginBottom: '0.4rem',
  },
  '& hr': {
    margin: '1rem 0',
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  '& strong': {
    color: '#5a5ef5',
    fontWeight: 'bold',
  },
  '& blockquote': {
    borderLeft: '4px solid #5a5ef5',
    paddingLeft: '0.8rem',
    fontStyle: 'italic',
    margin: '0.8rem 0',
    color: '#555',
    backgroundColor: '#f8f9ff',
    padding: '0.6rem',
    borderRadius: '0 0.5rem 0.5rem 0',
  },
  '& .timeframe-header': {
    color: '#00796b',
    padding: '0.15rem 0.4rem',
    borderRadius: '0.25rem',
    backgroundColor: 'rgba(0, 121, 107, 0.1)',
  },
  '& .summary-header': {
    color: '#6200ea',
    backgroundColor: 'rgba(98, 0, 234, 0.1)',
    padding: '0.15rem 0.4rem',
    borderRadius: '0.25rem',
  },
  '& .outlook-header': {
    color: '#d81b60',
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
    padding: '0.15rem 0.4rem',
    borderRadius: '0.25rem',
  },
  '& .technical-indicator': {
    color: '#1565c0',
  },
  '& .list-indicator': {
    color: '#1565c0',
  },
}));

export const AnalysisContent = styled(Box)(({ theme }: StyledProps) => ({
  marginTop: '0.75rem',
  padding: '0.75rem',
  backgroundColor: '#f8f9ff',
  borderRadius: '0.75rem',
  border: '1px solid #f0f0f0',
  maxHeight: '18rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  fontSize: '0.9rem',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  WebkitOverflowScrolling: 'touch', // Add momentum scrolling for iOS
  touchAction: 'pan-y', // Enable vertical touch scrolling
  '&::-webkit-scrollbar': {
    width: '0.4rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '0.2rem',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.2rem',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.15)',
    },
  },
}));

export const SymbolHeader = styled(Typography)(({ theme }: StyledProps) => ({
  fontWeight: 'bold',
  color: '#5a5ef5',
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.95rem', // Slightly smaller for mobile
  '& svg': {
    marginRight: theme.spacing(1),
    color: '#5a5ef5',
  },
}));

export const DateDisplay = styled(Typography)(({ theme }: StyledProps) => ({
  fontSize: '0.7rem', // Smaller for mobile
  color: '#888',
  marginBottom: theme.spacing(1),
}));

export const LoadingContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1rem',
  backgroundColor: '#f8f9ff',
  borderRadius: '1rem',
  margin: '0.5rem',
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
}));

export const FloatingButtonContainer = styled(Box)(({ theme }: StyledProps) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 100,
}));

export const ResponsiveContainer = styled(Box)(({ theme }: StyledProps) => ({
  padding: '0.5rem',
  '@media (min-width: 350px)': {
    padding: '0.75rem',
  },
  '@media (min-width: 390px)': {
    padding: '1rem',
  },
}));

export const ChatContainer = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '0.75rem 1.2rem',
  backgroundColor: '#fff',
  borderTop: '1px solid rgba(0, 0, 0, 0.09)',
  width: '100%',
  position: 'sticky',
  bottom: 0,
  zIndex: 5,
  boxShadow: '0 -3px 12px rgba(0, 0, 0, 0.08)',
}));

export const MessageInput = styled(TextField)(({ theme }: StyledProps) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '1.5rem',
    backgroundColor: '#f8f9ff',
    '&:hover': {
      backgroundColor: '#f0f2ff',
    },
    '& fieldset': {
      borderColor: '#e0e0e0',
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4a57ef',
      borderWidth: '2px',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '0.9rem 1.1rem',
    color: '#333', // Ensure input text is dark
    fontSize: '0.95rem',
    lineHeight: 1.5,
  },
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

export const SendButton = styled(IconButton)(({ theme }: StyledProps) => ({
  backgroundColor: '#4a57ef',
  color: '#fff',
  width: '2.7rem',
  height: '2.7rem',
  marginLeft: '0.6rem',
  borderRadius: '50%',
  boxShadow: '0 2px 8px rgba(74, 87, 239, 0.25)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#3e48d0', 
    transform: 'scale(1.05)',
    boxShadow: '0 3px 10px rgba(74, 87, 239, 0.3)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'rgba(74, 87, 239, 0.5)',
    color: 'rgba(255, 255, 255, 0.6)',
  }
}));

export const MessageContainer = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: '0.75rem 1rem',
  borderRadius: isUser ? '1.25rem 1.25rem 0.3rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.3rem',
  marginBottom: '1rem',
  marginTop: '0.5rem',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  backgroundColor: isUser ? '#4a57ef' : '#edf2ff',
  color: isUser ? '#fff' : '#333',
  wordBreak: 'break-word',
  boxShadow: isUser 
    ? '0 3px 8px rgba(74, 87, 239, 0.25)'
    : '0 3px 8px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  lineHeight: '1.6',
  letterSpacing: '0.01em',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: isUser ? '0.3rem' : '0.3rem',
    [isUser ? 'right' : 'left']: isUser ? -6 : -6,
    width: 0,
    height: 0,
    border: '6px solid transparent',
    borderTopColor: isUser ? '#4a57ef' : '#edf2ff',
    borderBottom: 0,
    marginBottom: -6,
  },
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: isUser 
      ? '0 4px 12px rgba(74, 87, 239, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.12)',
  }
}));

export const MessagesDisplay = styled(Box)(({ theme }: StyledProps) => ({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  padding: '0.5rem',
  height: '12rem',
  backgroundColor: '#fff',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  '&::-webkit-scrollbar': {
    width: '0.3rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.25rem',
  },
}));

export const ChatHistoryContainer = styled(Box)(({ theme }: StyledProps) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '0.5rem',
  overflow: 'auto',
  backgroundColor: '#f8f9ff',
  borderRadius: '0.5rem',
  marginBottom: '0.5rem',
  '&::-webkit-scrollbar': {
    width: '0.3rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.25rem',
  },
}));

export const LoadMoreButton = styled(Box)(({ theme }: StyledProps) => ({
  padding: '0.5rem',
  textAlign: 'center',
  backgroundColor: '#f0f2ff',
  color: '#5a5ef5',
  borderRadius: '0.5rem',
  margin: '0.5rem 0',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.8rem',
  '&:hover': {
    backgroundColor: '#e8eaff',
  },
}));

export const MessageThreadContainer = styled(Box)(({ theme }: StyledProps) => ({
  flex: 1,
  overflow: 'auto',
  padding: '0.5rem 1rem',
  height: 'calc(100vh - 12rem)', // Adjusted for better sizing
  minHeight: '300px', // Ensure minimum height
  display: 'flex', 
  flexDirection: 'column',
  backgroundColor: '#ffffff',
  WebkitOverflowScrolling: 'touch',
  touchAction: 'pan-y',
  scrollBehavior: 'smooth',
  position: 'relative', // For proper positioning of children
  '&::-webkit-scrollbar': {
    width: '0.25rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.25rem',
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.15)',
    },
  },
  // Add transition effect for smooth appearance
  transition: 'all 0.3s ease',
  '& > *': {
    animation: 'fadeIn 0.3s ease-in',
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
}));

export const DateSeparator = styled(Box)(({ theme }: StyledProps) => ({
  textAlign: 'center',
  margin: '1.5rem 0',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 0,
  },
}));

export const ChatHistoryPanel = styled(Box)(({ theme }: StyledProps) => ({
  width: '100%',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  backgroundColor: '#f8f9ff',
  padding: '0.5rem',
  overflowX: 'auto',
  display: 'flex',
  flexWrap: 'nowrap',
  '&::-webkit-scrollbar': {
    height: '0.25rem',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.05)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '0.25rem',
  },
}));

export const HistoryChip = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
  padding: '0.5rem 1rem',
  borderRadius: '1.5rem',
  marginRight: '0.5rem',
  fontSize: '0.8rem',
  fontWeight: active ? 'bold' : 'normal',
  backgroundColor: active ? '#5a5ef5' : '#e8eaff',
  color: active ? '#fff' : '#5a5ef5',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  boxShadow: active ? '0 1px 3px rgba(0, 0, 0, 0.2)' : 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: active ? '#4a4ee0' : '#d8daff',
  },
  '& svg': {
    marginRight: '0.4rem',
  },
}));

export const TimeStamp = styled(Typography)<{ color: string }>(({ theme, color }) => ({
  fontSize: '0.65rem',
  color: color,
  display: 'inline-block',
  padding: '0.2rem 0.5rem',
  marginTop: '0.35rem',
  opacity: 0.7,
  borderRadius: '4px',
  transition: 'opacity 0.2s ease',
  '&:hover': {
    opacity: 1
  }
})); 