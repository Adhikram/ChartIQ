import React from 'react';
import { Modal, useMediaQuery, useTheme, Typography, Button, Paper, Avatar, Box } from '@mui/material';
import { TelegramUser } from '../hooks/useTelegramAuth';

interface WelcomePopupProps {
  open: boolean;
  onClose: () => void;
  telegramUser: TelegramUser | null;
  isFromTelegram: boolean;
  isAuthValid: boolean | null;
  userId: string;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({
  open,
  onClose,
  telegramUser,
  isFromTelegram,
  isAuthValid,
  userId
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Modal
      open={open}
      aria-labelledby="welcome-popup"
      disableAutoFocus
      disableEnforceFocus
      disableEscapeKeyDown={false}
      keepMounted={false}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(5px)',
      }}
    >
      <Paper 
        elevation={5}
        onClick={(e) => e.stopPropagation()}
        sx={{
          width: isMobile ? '90%' : '400px',
          p: 3,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          backgroundColor: 'white',
          position: 'relative',
          zIndex: 10000
        }}
      >
        {/* Logo or icon */}
        <Box 
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: 'rgba(25, 196, 144, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3V21H21" stroke="#19C490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 14L11 10L15 14L21 8" stroke="#19C490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Box>
        
        <Typography variant="h5" component="h2" sx={{ color: '#19C490', fontWeight: 600, textAlign: 'center' }}>
          Welcome to ChartIQ Assistant
        </Typography>
        
        {telegramUser ? (
          <>
            {/* User avatar if available */}
            {telegramUser.photo_url && (
              <Avatar 
                src={telegramUser.photo_url} 
                alt={telegramUser.first_name || 'User'} 
                sx={{ width: 80, height: 80, mb: 1 }}
              />
            )}
            
            <Typography variant="h6" sx={{ fontWeight: 500, textAlign: 'center' }}>
              {telegramUser.first_name} {telegramUser.last_name || ''}
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 1 }}>
              Thanks for connecting with Telegram! You're about to use ChartIQ Assistant with your Telegram account.
            </Typography>
            
            {/* Authentication status indicator */}
            {isFromTelegram && (
              <Box sx={{ 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1,
                mb: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor: isAuthValid ? 'rgba(25, 196, 144, 0.1)' : 'rgba(231, 76, 60, 0.1)'
              }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    borderRadius: '50%', 
                    backgroundColor: isAuthValid ? '#19C490' : '#e74c3c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isAuthValid ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: isAuthValid ? '#19C490' : '#e74c3c', fontWeight: 500 }}>
                  {isAuthValid 
                    ? 'Telegram authentication verified' 
                    : 'Telegram authentication failed. Data may not be secure.'}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ 
              backgroundColor: 'rgba(223, 242, 238, 1)',
              p: 2,
              borderRadius: 1,
              mb: 2,
              width: '100%',
              border: '1px solid rgba(25, 196, 144, 0.2)'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#19C490', mb: 1 }}>User Details:</Typography>
              <Typography variant="body2">ID: telegram-{telegramUser.id}</Typography>
              {telegramUser.username && <Typography variant="body2">Username: {telegramUser.username}</Typography>}
              {telegramUser.language_code && <Typography variant="body2">Language: {telegramUser.language_code}</Typography>}
              {isFromTelegram && <Typography variant="body2">Auth Status: {isAuthValid ? 'Valid' : 'Invalid'}</Typography>}
            </Box>
          </>
        ) : (
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 2 }}>
            You're using ChartIQ Assistant in standalone mode.
          </Typography>
        )}
        
        <Button 
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ 
            backgroundColor: '#19C490',
            p: 1.5,
            fontWeight: 'bold',
            fontSize: '1rem',
            textTransform: 'uppercase',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#13a679',
            }
          }}
        >
          Continue as {telegramUser ? `${telegramUser.first_name}` : userId}
        </Button>
      </Paper>
    </Modal>
  );
};

export default WelcomePopup; 