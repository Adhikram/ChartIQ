import { useState, useEffect } from 'react';
import { WebAppInitData, WebAppUser } from '../types/WebAppInitData';
import { createParser } from '../utils/telegramParser';

interface UseTelegramAuthOptions {
  botToken: string;
}

interface UseTelegramAuthResult {
  isLoading: boolean;
  isValid: boolean;
  user: WebAppUser | null;
  initData: WebAppInitData | null;
  error: string | null;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export function useTelegramAuth({ botToken }: UseTelegramAuthOptions): UseTelegramAuthResult {
  const [result, setResult] = useState<UseTelegramAuthResult>({
    isLoading: true,
    isValid: false,
    user: null,
    initData: null,
    error: null,
  });

  useEffect(() => {
    // Check if we're running in Telegram WebApp environment
    if (!window.Telegram?.WebApp) {
      setResult({
        isLoading: false,
        isValid: false,
        user: null,
        initData: null,
        error: 'Not running in Telegram WebApp environment',
      });
      return;
    }

    try {
      // Notify Telegram WebApp that we're ready
      window.Telegram.WebApp.ready();
      
      // Expand the WebApp to take full height
      window.Telegram.WebApp.expand();

      // Get initData from WebApp
      const initDataString = window.Telegram.WebApp.initData;
      
      if (!initDataString) {
        // In development environment, you might want to use unsafe data
        if (process.env.NODE_ENV === 'development' && window.Telegram.WebApp.initDataUnsafe?.user) {
          setResult({
            isLoading: false,
            isValid: true,
            user: window.Telegram.WebApp.initDataUnsafe.user,
            initData: window.Telegram.WebApp.initDataUnsafe as WebAppInitData,
            error: null,
          });
          return;
        }
        
        setResult({
          isLoading: false,
          isValid: false,
          user: null,
          initData: null,
          error: 'No initData provided by Telegram WebApp',
        });
        return;
      }

      // Parse and validate the data
      const parser = createParser(botToken);
      const parseResult = parser.parse(initDataString);

      if (!parseResult.validated) {
        setResult({
          isLoading: false,
          isValid: false,
          user: null,
          initData: null,
          error: 'Failed to validate Telegram WebApp data',
        });
        return;
      }

      setResult({
        isLoading: false,
        isValid: true,
        user: parseResult.data.user || null,
        initData: parseResult.data,
        error: null,
      });

    } catch (err) {
      setResult({
        isLoading: false,
        isValid: false,
        user: null,
        initData: null,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }, [botToken]);

  return result;
} 