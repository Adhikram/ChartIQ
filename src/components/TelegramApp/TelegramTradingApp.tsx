import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { GlobalStyle, TelegramAppContainer, MessageThreadContainer, ResponsiveContainer } from './styles/TelegramAppStyles';
import SymbolSearch from '../SymbolSearch';
import AppHeader from './components/AppHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import { saveMessageToDatabase, removeLastUserMessage, formatTechnicalAnalysis } from '../../services/MessageUtil';
import { ChatMessage } from '../../types';
import { ConversationMessage } from '../../services/agents/stockAssistantAgent';


/**
 * Main TelegramTradingApp component
 */
const TelegramTradingApp: React.FC = () => {
  // State variables
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [userId, setUserId] = useState<string>('user123');
  const [lastUserMessageId, setLastUserMessageId] = useState<string | null>(null);
  
  // Add new state for tracking if an AI response is being generated
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  
  // Add state to maintain conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasMore: false,
    nextCursor: null as string | null
  });
  
  // Refs
  const symbolRef = useRef<string>(symbol);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Add a ref to track the top visible message before loading more
  const topVisibleMessageRef = useRef<string | null>(null);
  
  // Add state to track if we're at the top of the chat
  const [isAtTop, setIsAtTop] = useState<boolean>(false);
  
  // Update ref when symbol changes
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Load message history when component mounts or userId changes
  useEffect(() => {
    loadMessageHistory(true);
  }, [userId]);
  
  // Add scroll detection to automatically load more messages when scrolling up
  useEffect(() => {
    const messageThread = document.querySelector('.message-thread-container');
    if (!messageThread) return;

    // Track if we're currently loading to prevent multiple requests
    let isLoadingRef = false;

    const handleScroll = () => {
      // Auto-load when very near the top (within 50px)
      if (messageThread.scrollTop < 50 && !isLoadingRef && pagination.hasMore && !loadingMore) {
        console.log('Auto-loading earlier messages');
        isLoadingRef = true;
        
        // Save current position for restoration
        if (messages.length > 0) {
          topVisibleMessageRef.current = messages[0].id;
        }
        
        // Show a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'auto-load-indicator';
        loadingIndicator.innerHTML = '<div class="spinner"></div>';
        loadingIndicator.style.cssText = `
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 8px 16px;
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(90, 94, 245, 0.3);
        `;
        
        // Add spinner style
        const style = document.createElement('style');
        style.textContent = `
          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid rgba(90, 94, 245, 0.3);
            border-top: 2px solid #5a5ef5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
        
        messageThread.appendChild(loadingIndicator);
        
        // Load more messages
        loadMessageHistory(false).finally(() => {
          // Remove loading indicator
          if (loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator);
          }
          // Reset loading flag with slight delay to prevent multiple triggers
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
  }, [pagination.hasMore, loadingMore]);

  // We need to restore scroll position after loading more messages
  useEffect(() => {
    if (!loadingMore && topVisibleMessageRef.current) {
      // Find the previously top message in the new message list
      const messageElement = document.getElementById(`message-${topVisibleMessageRef.current}`);
      if (messageElement) {
        // Scroll to that message with a slight delay to ensure rendering is complete
        setTimeout(() => {
          messageElement.scrollIntoView({ behavior: 'auto' });
          topVisibleMessageRef.current = null;
        }, 100);
      }
    }
  }, [loadingMore, messages]);

  // Function to load message history - modified to return a promise
  const loadMessageHistory = async (reset = false) => {
    if (!userId) return Promise.resolve();
    
    try {
      // If resetting, clear existing messages and set page to 1
      if (reset) {
        setLoading(true);
        setStatusMessage('Loading message history...');
        setPagination(prev => ({ ...prev, page: 1, nextCursor: null }));
        // Clear the anchor message since we're resetting
        topVisibleMessageRef.current = null;
        
        // Also fetch conversation history for the agent when resetting
        try {
          const historyResponse = await fetch('/api/message-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              limit: 20,
              includeConversationHistory: true
            }),
          });
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.conversationHistory && Array.isArray(historyData.conversationHistory)) {
              setConversationHistory(historyData.conversationHistory);
              console.log('Initialized conversation history with', historyData.conversationHistory.length, 'messages');
            }
          }
        } catch (historyError) {
          console.error('Error initializing conversation history:', historyError);
          // Continue even if this fails, will rebuild from database as needed
        }
      } else {
        setLoadingMore(true);
        // If we're loading more but don't have a reference point, use the first message
        if (!topVisibleMessageRef.current && messages.length > 0) {
          topVisibleMessageRef.current = messages[0].id;
        }
      }
      
      const requestData = {
        userId,
        symbol: symbolRef.current,
        page: reset ? 1 : pagination.page + 1,
        pageSize: pagination.pageSize,
        cursor: reset ? null : pagination.nextCursor
      };
      
      console.log('Loading messages with params:', requestData);
      
      const response = await fetch('/api/chat-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Failed to load message history: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.messages && Array.isArray(data.messages)) {
        // Convert to the format expected by ChatMessages component
        const formattedMessages = data.messages.map((msg: any) => {
          // Store both raw and formatted content for assistant messages
          const isAssistant = msg.role === 'ASSISTANT';
          return {
            id: msg.id,
            content: isAssistant ? formatTechnicalAnalysis(msg.content) : msg.content,
            rawContent: isAssistant ? msg.content : undefined,
            timestamp: msg.createdAt,
            isUser: msg.role === 'USER',
            ...(isAssistant && data.symbol ? { symbol: data.symbol } : {})
          };
        });
        
        // FIXED: For "load more", prepend older messages at the beginning
        // If resetting, replace all messages; otherwise prepend earlier messages
        setMessages(prev => reset ? formattedMessages : [...formattedMessages, ...prev]);
        
        // Update pagination information
        if (data.pagination) {
          setPagination(data.pagination);
        }
        
        console.log(`Loaded ${formattedMessages.length} messages, has more: ${data.pagination?.hasMore}`);
        
        // Log a sample formatted message for debugging
        const assistantMsg = formattedMessages.find((m: ChatMessage) => !m.isUser);
        if (assistantMsg) {
          console.log('Sample formatted message:', assistantMsg.content.substring(0, 100));
          console.log('Raw content sample:', assistantMsg.rawContent?.substring(0, 100));
        }
      }
    } catch (error) {
      console.error('Error loading message history:', error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Clear the anchor on error
      topVisibleMessageRef.current = null;
      return Promise.reject(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setStatusMessage('');
    }
    
    return Promise.resolve();
  };

  // Handle analyze button click - using the current symbol
  const handleAnalyze = async (explicitSymbol?: string) => {
    // Don't reset messages anymore, just continue the conversation
    // setMessages([]);
    setStatusMessage('');
    
    // Reset conversation history when starting a new analysis
    setConversationHistory([]);
    console.log('Reset conversation history for new analysis');
    
    // First log the current state of symbols
    console.log('Symbol state before analysis:', {
      symbolState: symbol,
      symbolRef: symbolRef.current,
      explicitSymbol
    });
    
    // Use explicitly passed symbol first, fallback to ref (which tracks state)
    let currentSymbol = explicitSymbol || symbolRef.current;
    
    if (!currentSymbol) {
      alert('Please enter a valid trading symbol');
      return;
    }
    
    // Validate symbol format
    if (!currentSymbol.includes(':')) {
      console.warn('Symbol format may be incorrect:', currentSymbol);
      
      // Try to fix the symbol format if possible
      if (/^[A-Z0-9]+$/i.test(currentSymbol)) {
        const fixedSymbol = `BINANCE:${currentSymbol.toUpperCase()}`;
        console.log('Fixed symbol format:', fixedSymbol);
        // Update both state and ref for consistency
        setSymbol(fixedSymbol);
        symbolRef.current = fixedSymbol; // Direct update bypasses the useEffect
        currentSymbol = fixedSymbol;
      }
    }
    
    // Ensure symbol is uppercase for consistency
    if (currentSymbol !== currentSymbol.toUpperCase()) {
      const uppercasedSymbol = currentSymbol.toUpperCase();
      console.log('Converting symbol to uppercase:', uppercasedSymbol);
      setSymbol(uppercasedSymbol);
      symbolRef.current = uppercasedSymbol; // Direct update bypasses the useEffect
      currentSymbol = uppercasedSymbol;
    }
    
    // Ensure the symbolRef is up-to-date with any recent changes
    setLoading(true);
    setStreamingContent('');
    
    
    try {
      // Already have currentSymbol defined above
      console.log('Analyzing symbol:', currentSymbol);
      setStatusMessage(`Analyzing ${currentSymbol}...`);
      
      // Add user message to the chat immediately
      const userMessageId = Date.now().toString();
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: userMessageId,
          content: `Analyzing ${currentSymbol}`,
          timestamp: new Date(),
          isUser: true,
          asset: currentSymbol
        }
      ]);
      
      // Try to save the user message but don't let an error stop the analysis
      try {
        // Ensure we have a valid message to save
        if (currentSymbol) {
          const message = `Analyze ${currentSymbol}`;
          const lastUserMessage = await saveMessageToDatabase(message, userId, 'USER');
          if (lastUserMessage) {
            setLastUserMessageId(lastUserMessage.id);
          }
        }
      } catch (dbError) {
        console.error('Error saving user message:', dbError);
        // Continue with analysis even if message save fails
      }
      
      // Step 1: Generate charts first
      console.log('Generating charts for symbol:', currentSymbol);
      const generateChartsResponse = await fetch('/api/generate-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: currentSymbol })
      });
      
      if (!generateChartsResponse.ok) {
        const errorText = await generateChartsResponse.text();
        console.error('Error response from generate-charts:', errorText);
        throw new Error(`Error generating charts: ${generateChartsResponse.status} - ${errorText}`);
      }
      
      const chartsData = await generateChartsResponse.json();
      console.log('Generated charts:', chartsData);
      
      if (!chartsData.chartUrls || chartsData.chartUrls.length === 0) {
        throw new Error('No chart URLs generated. Please try again.');
      }
      
      // Step 2: Analyze the charts with the chartUrls from step 1
      const requestData = {
        chartUrls: chartsData.chartUrls,
        symbol: currentSymbol,
        userId: userId
      };
      
      
      console.log('Sending analyze-charts request:', requestData);
      
      const response = await fetch('/api/analyze-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Process streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }
      
      let analysisId = '';
      let accumulatedContent = '';
      let chartUrls: string[] = chartsData.chartUrls;
      const decoder = new TextDecoder();
      
      // Create a placeholder for the AI message that will be updated as we stream
      const aiMessageId = Date.now() + 1000;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: aiMessageId.toString(),
          content: "",
          timestamp: new Date(),
          isUser: false,
          // Remove chartUrl from the message
          // chartUrl: chartUrls[0],
        }
      ]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log('Received chunk:', chunk);
        
        // Process each line (which should be in format "data: {...}")
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          // Process only lines that start with "data: "
          if (line.startsWith('data: ')) {
            try {
              // Extract the JSON part
              const jsonStr = line.substring(6); // Remove "data: "
              const data = JSON.parse(jsonStr);
              
              console.log('Processed data:', data);
              
              switch (data.type) {
                case 'content':
                  // Append new content
                  accumulatedContent += data.data;
                  // Update the streaming content
                  setStreamingContent(accumulatedContent);
                  // Update the AI message in real-time
                  setMessages(prevMessages => 
                    prevMessages.map(msg => 
                      msg.id === aiMessageId.toString() 
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                  break;
                  
                // Images case is already commented out
                // case 'images':
                //   // Update chart URLs
                //   if (Array.isArray(data.data) && data.data.length > 0) {
                //     chartUrls = data.data;
                //     // Update the AI message with the first chart URL
                //     setMessages(prevMessages => 
                //       prevMessages.map(msg => 
                //         msg.id === aiMessageId.toString() 
                //           ? { ...msg, chartUrl: chartUrls[0] }
                //           : msg
                //       )
                //     );
                //   }
                //   break;
                  
                case 'error':
                  console.error('Stream error:', data.data);
                  break;
                  
                case 'done':
                  console.log('Stream completed');
                  break;
              }
            } catch (e) {
              console.error('Error parsing line:', line, e);
              // Continue processing other lines even if one fails
            }
          }
        }
      }

      
      // At the end of the analysis
      // Save the final analysis result to database
      try {
        // Only save if we have actual content
        if (streamingContent && streamingContent.trim()) {
          await saveMessageToDatabase(streamingContent, userId, 'ASSISTANT');
          console.log('Analysis result saved to database successfully');
        } else {
          console.warn('No content to save to database');
          if (lastUserMessageId) {
            console.log('Removing last user message from database:', lastUserMessageId);
            removeLastUserMessage(lastUserMessageId);
          }
        }
      } catch (saveError) {
        console.error('Failed to save analysis result to database:', saveError);
        // Continue anyway - user can still see the result in UI
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during analysis';
      setStatusMessage(`Error: ${errorMessage}`);
      if (lastUserMessageId) {
        removeLastUserMessage(lastUserMessageId);
      }
    } finally {
      setLoading(false);
      setLastUserMessageId(null);
    }
  };

  // Handler functions
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    // Create a unique ID for the message
    const messageId = Date.now().toString();
    
    // Add user message to UI immediately
    const userMessage = {
      id: messageId,
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
      isUser: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Save message to database
    try {
      const savedMessage = await saveMessageToDatabase(chatInput, userId, 'USER');
      if (savedMessage) {
        console.log('Message saved successfully:', savedMessage.id);
      }
    } catch (error) {
      console.error('Failed to save user message:', error);
    }
    
    // Add the user message to conversation history
    const userHistoryMessage: ConversationMessage = {
      role: 'user',
      content: chatInput
    };
    
    // Update conversation history with the new user message
    const updatedHistory = [...conversationHistory, userHistoryMessage];
    setConversationHistory(updatedHistory);
    
    // If there are previous AI messages, treat this as a follow-up question
    const previousAiMessage = [...messages].reverse().find(msg => !msg.isUser);
    
    if (previousAiMessage) {
      try {
        setAgentLoading(true);
        setStatusMessage('Processing your question...');
        
        // Call the stock assistant API
        const response = await fetch('/api/stock-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: chatInput,
            userId,
            conversationHistory: updatedHistory, // Send the updated conversation history
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add agent response to messages
        if (data.response) {
          const agentMessageId = Date.now().toString();
          
          const agentMessage = {
            id: agentMessageId,
            content: data.response,
            timestamp: new Date().toISOString(),
            isUser: false,
          };
          
          setMessages(prev => [...prev, agentMessage]);
          
          // Use the updated conversation history from the server
          if (data.conversationHistory && Array.isArray(data.conversationHistory)) {
            setConversationHistory(data.conversationHistory);
            console.log('Updated conversation history from server', data.conversationHistory.length);
          }
          
          // Database saving is handled by the API endpoint
        }
      } catch (error) {
        console.error('Error getting agent response:', error);
        // Add error message
        const errorMessageId = Date.now().toString();
        const errorMessage = {
          id: errorMessageId,
          content: "I'm sorry, I couldn't process your question. Please try again.",
          timestamp: new Date().toISOString(),
          isUser: false,
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setAgentLoading(false);
        setStatusMessage('');
      }
    }
    
    // Clear input regardless of success
    setChatInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<Element>, symbol: string) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // Add touch event handlers for mobile scrolling
  useEffect(() => {
    // Set the viewport meta tag for iOS
    const setViewportMetaTag = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    };
    
    // Apply viewport settings
    setViewportMetaTag();
    
    // Add listener for orientation changes
    window.addEventListener('orientationchange', setViewportMetaTag);
    
    return () => {
      window.removeEventListener('orientationchange', setViewportMetaTag);
    };
  }, []);

  return (
    <>
      <GlobalStyle />
      <TelegramAppContainer className="telegram-app">
        {/* Header with integrated SymbolSearch */}
        <AppHeader 
          onSearchSubmit={(newSymbol) => {
            console.log('Symbol search submitted with new symbol:', newSymbol);
            // Force uppercase for better consistency
            const formattedSymbol = newSymbol.toUpperCase();
            // Update symbol
            setSymbol(formattedSymbol);
            // Set status message to confirm symbol change
            setStatusMessage(`Symbol changed to ${formattedSymbol}`);
            // Call handleAnalyze with the explicit symbol value
            handleAnalyze(formattedSymbol);
          }}
        />
        
        {/* Messages Thread Area */}
        <MessageThreadContainer 
          className="message-thread-container" 
          sx={{ position: 'relative', p: 0 }}
        >
          {/* Chat Messages */}
          <ChatMessages 
            messages={messages}
            loading={loading || agentLoading}
            messageEndRef={messageEndRef}
          />
        </MessageThreadContainer>
        
        {/* Chat Input */}
        <ChatInput 
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleSendMessage={handleSendMessage}
          handleKeyPress={(e: React.KeyboardEvent<Element>) => handleKeyPress(e, symbolRef.current)}
          symbol={symbolRef.current}
          statusMessage={statusMessage}
          isLoading={agentLoading || loading}
        />
      </TelegramAppContainer>
    </>
  );
};

export default TelegramTradingApp; 