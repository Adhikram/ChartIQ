import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { AppContainer, GlobalStyle } from './styles';

// Import components
import { 
  AppHeader, 
  ChatInput, 
  ChatMessages, 
  SymbolSearchModal
} from './components';

// Import custom hooks
import { 
  useTelegramAuth, 
  useAnalysis, 
  useMessages, 
  useViewport,
  useWelcomeMessage
} from './hooks';

// Import types
import { ChatMessage } from './types';

// Default symbol
const DEFAULT_SYMBOL = 'AAPL';

// Custom hook to safely use layout effects with SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * AssistantApp - A modern chat interface inspired by ChatGPT
 */
const AssistantApp: React.FC = () => {
  // Force re-render function for critical state updates
  const [, forceUpdate] = useState({});
  const rerender = useCallback(() => forceUpdate({}), []);
  
  // State variables
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [symbolSearchOpen, setSymbolSearchOpen] = useState<boolean>(false);
  
  // Refs
  const symbolRef = useRef<string>(symbol);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const historyLoadedRef = useRef<boolean>(false);
  const initialLoadCompletedRef = useRef<boolean>(false);
  
  // Custom hooks
  const { 
    userId, 
    telegramUser, 
    isFromTelegram, 
    isAuthValid, 
    isValidating 
  } = useTelegramAuth();
  
  const {
    previousAnalysis,
    previousAnalysisLoading,
    accumulatedContent,
    loadPreviousAnalysis,
    handleAnalyze
  } = useAnalysis();
  
  const {
    messages,
    conversationHistory,
    loading,
    loadingMore,
    pagination,
    lastUserMessageId,
    loadMessageHistory,
    handleSendMessage,
    setMessages
  } = useMessages();
  
  // Use the viewport hook
  useViewport();
  
  // Use the welcome message hook with modified parameters
  useWelcomeMessage(
    false, // Never show welcome popup
    !!userId && !isValidating, // App is ready when we have a user and validation is done
    userId,
    messages,
    telegramUser,
    setMessages
  );

  // Update ref when symbol changes only - don't load previous analysis here
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Initialize app and handle authentication
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Wait for authentication to complete
    if (isValidating) {
      console.log("Waiting for authentication to complete...");
      return;
    }
    
    console.log("Authentication completed:", { 
      userId, 
      isAuthValid, 
      isDefaultUser: userId === 'user123',
      isFromTelegram 
    });

    // Notify Telegram the app is ready if from Telegram
    if (isFromTelegram && typeof window !== 'undefined') {
      try {
        // Safely check for WebApp API methods
        if (window.Telegram?.WebApp) {
          if (typeof window.Telegram.WebApp.ready === 'function') {
            window.Telegram.WebApp.ready();
          }
          
          // Expand the WebApp if authentication is valid
          if (isAuthValid && typeof window.Telegram.WebApp.expand === 'function') {
            window.Telegram.WebApp.expand();
          }
        }
      } catch (telegramError) {
        console.error("Error in Telegram WebApp API:", telegramError);
      }
    }
  }, [isFromTelegram, isAuthValid, isValidating, userId]);

  // Consolidated effect to load both message history and previous analysis
  // Dependent on userId and validation status to ensure auth is complete
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined') return;
    
    // Only proceed if we have a userId, auth is complete, and we haven't loaded yet
    if (userId && !isValidating && !initialLoadCompletedRef.current) {
      // Removed check for default user ID to allow loading for all users
      
      console.log(`CONSOLIDATED: Loading initial data - both message history and analysis for user: ${userId}`);
      
      // Mark history as loaded temporarily (might be redundant if initialLoad handles it)
      historyLoadedRef.current = true; 
      
      // Load messages first - this should use chat-message API internally
      // and never load UI messages from message-history API
      loadMessageHistory(userId, symbol, true)
        .then(() => {
          // Then load previous analysis for the symbol separately
          // This should only fetch the analysis content, not affect UI messages
          return loadPreviousAnalysis(userId, symbol);
        })
        .then(() => {
          // Successfully loaded both history and analysis
          console.log(`CONSOLIDATED: Successfully loaded initial data for user: ${userId}`);
          // Mark as fully loaded *only* after successful completion
          initialLoadCompletedRef.current = true; 
        })
        .catch(error => {
          console.error("Error during initial data load:", error);
          // Reset the flag on error to allow retry on subsequent renders/changes
          initialLoadCompletedRef.current = false; 
          historyLoadedRef.current = false; // Also reset history flag if load failed
        });
    }
  }, [userId, symbol, loadMessageHistory, loadPreviousAnalysis, isValidating]);

  // Add scroll detection for loading more messages
  useEffect(() => {
    // Skip this effect during server-side rendering
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const messageThread = document.querySelector('.message-thread-container');
    if (!messageThread) return;

    let isLoadingRef = false;

    const handleScroll = () => {
      if (messageThread.scrollTop < 50 && !isLoadingRef && pagination.hasMore && !loadingMore) {
        isLoadingRef = true;
        
        // Load more messages
        loadMessageHistory(userId, symbol, false).finally(() => {
          setTimeout(() => {
            isLoadingRef = false;
          }, 500);
        });
      }
    };

    messageThread.addEventListener('scroll', handleScroll);
    return () => {
      messageThread.removeEventListener('scroll', handleScroll);
    };
  }, [pagination.hasMore, loadingMore, userId, symbol, loadMessageHistory]);

  // Handle key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(
        chatInput,
        userId,
        symbolRef,
        accumulatedContent,
        previousAnalysis,
        agentLoading,
        messageEndRef,
        setAgentLoading,
        setStatusMessage,
        setChatInput
      );
    }
  };

  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    // normalize the symbol to uppercase and trim
    const formattedSymbol = newSymbol.trim().toUpperCase();
    
    // If same symbol, do nothing
    if (formattedSymbol === symbolRef.current) {
      setSymbolSearchOpen(false);
      return;
    }
    
    // Update the symbol state and ref
    setSymbol(formattedSymbol);
    symbolRef.current = formattedSymbol;
    
    // Close the search modal
    setSymbolSearchOpen(false);
    
    // Update the status message for clear user feedback about the symbol change
    setStatusMessage(`Symbol changed to ${formattedSymbol}`);
    
    // Reset history loaded flag when changing symbols
    historyLoadedRef.current = false;
    initialLoadCompletedRef.current = false;
    
    console.log(`Loading data for symbol change to ${formattedSymbol} for user ${userId}`);
    
    // Consolidated: Load both history and analysis for the new symbol
    // First load message history
    loadMessageHistory(userId, formattedSymbol, true)
      .then(() => {
        // Then load previous analysis
        return loadPreviousAnalysis(userId, formattedSymbol);
      })
      .then(() => {
        // Finally, automatically trigger analysis for the new symbol
        handleAnalyze(
          formattedSymbol,
          userId,
          setMessages,
          messageEndRef,
          setAgentLoading,
          setStatusMessage
        );
      })
      .catch(error => {
        console.error("Error during symbol change data load:", error);
      });
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {/* App Header */}
        <AppHeader 
          symbol={symbol}
          onSymbolClick={() => setSymbolSearchOpen(true)}
        />
        
        {/* Chat Messages */}
        <ChatMessages 
          messages={messages}
          loading={loading || loadingMore}
          messageEndRef={messageEndRef}
        />
        
        {/* Chat Input */}
        <ChatInput
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendMessage={() => handleSendMessage(
            chatInput,
            userId,
            symbolRef,
            accumulatedContent,
            previousAnalysis,
            agentLoading,
            messageEndRef,
            setAgentLoading,
            setStatusMessage,
            setChatInput
          )}
          handleKeyPress={handleKeyPress}
          symbol={symbol}
          statusMessage={statusMessage}
          isLoading={agentLoading}
        />
        
        {/* Symbol Search Modal */}
        <SymbolSearchModal
          open={symbolSearchOpen}
          onClose={() => setSymbolSearchOpen(false)}
          currentSymbol={symbol}
          onSymbolSelect={handleSymbolChange}
        />
      </AppContainer>
    </>
  );
};

export default AssistantApp;