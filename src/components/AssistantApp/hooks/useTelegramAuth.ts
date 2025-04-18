import { useState, useEffect } from 'react';
import { extractTelegramUserFromUrl, formatTelegramUserId } from '../../../telegramUtils';

// Default user ID when not coming from Telegram
const DEFAULT_USER_ID = 'user123';

export interface TelegramUser {
  id: string | number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramAuthResult {
  userId: string;
  telegramUser: TelegramUser | null;
  isFromTelegram: boolean;
  isAuthValid: boolean | null;
  isValidating: boolean;
}

/**
 * Custom hook to handle Telegram authentication
 */
export const useTelegramAuth = (): TelegramAuthResult => {
  const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isFromTelegram, setIsFromTelegram] = useState<boolean>(false);
  const [isAuthValid, setIsAuthValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(true);

  // Main authentication effect that runs once on mount
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined') return;
    
    console.log("Initial auth setup - checking environment");
    let didAuthenticate = false;
    
    try {
      // Simple rule: if tgWebAppData is in URL, use it to get user data
      const currentUrl = window.location.href;
      
      // Extract Telegram user data from URL parameters
      const userFromUrl = extractTelegramUserFromUrl(currentUrl);
      
      // Log the extracted data
      console.log('Extracted Telegram user data:', userFromUrl);
      
      // If we found valid user data in the URL
      if (userFromUrl && typeof userFromUrl === 'object') {
        console.log('Setting user data from URL parameters');
        setTelegramUser(userFromUrl);
        setIsFromTelegram(true);
        
        // Set user ID if we have an ID
        if (userFromUrl.id) {
          const formattedUserId = formatTelegramUserId(userFromUrl.id);
          console.log(`Using Telegram user ID from URL: ${formattedUserId}`);
          setUserId(formattedUserId);
        }
        
        // Set authentication as valid since it came from Telegram
        setIsAuthValid(true);
        didAuthenticate = true;
      } 
      // If no data in URL, check for Telegram WebApp object
      else {
        // Check if Telegram WebApp is available
        const isTelegramWebApp = window.Telegram?.WebApp !== undefined;
        console.log('Telegram WebApp object:', window.Telegram?.WebApp);
        
        if (isTelegramWebApp) {
          console.log("Running in Telegram environment");
          setIsFromTelegram(true);
          
          // Get user data from Telegram WebApp
          const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
          
          if (user) {
            console.log("Setting Telegram user data from WebApp:", user);
            setTelegramUser(user);
            
            // Set user ID if we have an ID
            if (user.id) {
              const formattedUserId = formatTelegramUserId(user.id);
              console.log(`Using Telegram user ID from WebApp: ${formattedUserId}`);
              setUserId(formattedUserId);
            }
            
            // Set authentication as valid
            setIsAuthValid(true);
            didAuthenticate = true;
          } else {
            console.warn("No Telegram user data available");
            
            // Use fallback user ID for development/testing
            console.log("Using default user ID: user123");
            setUserId(DEFAULT_USER_ID);
            setIsAuthValid(false);
          }
        } else {
          // Not in Telegram environment
          console.log("Not in Telegram environment, using default user ID");
          setUserId(DEFAULT_USER_ID);
          setIsAuthValid(false);
        }
      }
    } catch (error) {
      console.error("Error during Telegram validation:", error);
      
      // Fallback for development/testing
      console.log("Using default user ID due to error: user123");
      setUserId(DEFAULT_USER_ID);
      setIsAuthValid(false);
    } finally {
      if (!didAuthenticate) {
        console.log("No Telegram authentication was successful, using default user ID");
      }
      setIsValidating(false);
    }
  }, []);

  // Secondary effect to watch for WebApp changes in case it initializes after component mount
  useEffect(() => {
    // Skip during SSR or if we've already authenticated
    if (typeof window === 'undefined' || isAuthValid === true) return;
    
    // Define a function to check Telegram WebApp
    const checkTelegramWebApp = () => {
      // If WebApp becomes available and we haven't already authenticated
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        console.log("Detected Telegram WebApp user after initial load:", user);
        
        setTelegramUser(user);
        setIsFromTelegram(true);
        
        if (user.id) {
          const formattedUserId = formatTelegramUserId(user.id);
          console.log(`Setting delayed Telegram user ID: ${formattedUserId}`);
          setUserId(formattedUserId);
        }
        
        setIsAuthValid(true);
      }
    };
    
    // Check once
    checkTelegramWebApp();
    
    // Set up an interval to periodically check for WebApp
    const interval = setInterval(checkTelegramWebApp, 1000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [isAuthValid]);

  // Handle Telegram user ID setting in a separate effect with proper dependency
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Skip if no Telegram user data
    if (!telegramUser || !telegramUser.id) return;
    
    // Format and set the user ID based on telegramUser
    const formattedUserId = formatTelegramUserId(telegramUser.id);
    console.log(`Setting Telegram user ID from user data: ${formattedUserId}`);
    setUserId(formattedUserId);
  }, [telegramUser]);

  return {
    userId,
    telegramUser,
    isFromTelegram,
    isAuthValid,
    isValidating
  };
}; 