import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTelegramAuth } from '../hooks/useTelegramAuth';

interface TelegramAuthWrapperProps {
  botToken: string;
  children: React.ReactNode | ((userId: number, firstName: string) => React.ReactNode);
}

const TelegramAuthWrapper: React.FC<TelegramAuthWrapperProps> = ({ botToken, children }) => {
  const { isLoading, isValid, user, error } = useTelegramAuth({ botToken });

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100%',
        backgroundColor: '#f7f7f8'
      }}>
        <CircularProgress size={40} sx={{ color: '#10a37f', marginBottom: 2 }} />
        <Typography variant="body1" color="textSecondary">
          Authenticating with Telegram...
        </Typography>
      </Box>
    );
  }

  if (!isValid || !user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100%',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f7f7f8'
      }}>
        <Box sx={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          backgroundColor: '#ffebee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#e53935"/>
          </svg>
        </Box>
        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#333' }}>
          Authentication Failed
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '400px' }}>
          {error || 'Could not authenticate with Telegram. Please try again or contact support.'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ marginTop: 4, fontSize: '0.8rem' }}>
          Please make sure you're opening this app from Telegram.
        </Typography>
      </Box>
    );
  }

  // If children is a function, call it with the user ID and first name
  if (typeof children === 'function') {
    return <>{children(user.id, user.first_name)}</>;
  }

  // Otherwise, just render the children
  return <>{children}</>;
};

export default TelegramAuthWrapper; 