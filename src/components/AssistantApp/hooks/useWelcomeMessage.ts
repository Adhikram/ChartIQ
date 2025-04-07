import { useEffect } from 'react';
import { ChatMessage } from '../types';
import { TelegramUser } from './useTelegramAuth';

export const useWelcomeMessage = (
  showWelcomePopup: boolean,
  appInitialized: boolean,
  userId: string,
  messages: ChatMessage[],
  telegramUser: TelegramUser | null,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
): void => {
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // This will run whenever showWelcomePopup changes
    if (!showWelcomePopup && appInitialized && userId) {
      console.log("Welcome popup closed and app initialized");
      
      // Make sure body scroll is restored if it was disabled
      document.body.style.overflow = '';
      
      // Small delay to ensure all state updates are processed
      setTimeout(() => {
        // Only load initial welcome message if there are no messages
        // Check for both null/undefined and empty array
        if (!messages || messages.length === 0) {
          console.log("No messages found, adding welcome message");
          
          let welcomeMessage = `Welcome to ChartIQ Assistant!`;
          
          if (telegramUser && telegramUser.first_name) {
            welcomeMessage = `Welcome, ${telegramUser.first_name}!`;
          }
          
          welcomeMessage += " What would you like to analyze today?";
          
          const welcomeMsg: ChatMessage = {
            id: `welcome-${Date.now()}`,
            content: welcomeMessage,
            timestamp: new Date().toISOString(),
            isUser: false,
            role: 'ASSISTANT'
          };
          
          // Set directly instead of depending on previous state that might be null
          setMessages([welcomeMsg]);
        } else {
          console.log(`Found ${messages.length} existing messages, skipping welcome message`);
        }
      }, 250);
    }
  }, [showWelcomePopup, appInitialized, messages, telegramUser, userId, setMessages]);
}; 