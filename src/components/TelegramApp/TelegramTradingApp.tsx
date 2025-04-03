import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { GlobalStyle, TelegramAppContainer, MessageThreadContainer, ResponsiveContainer } from './styles/TelegramAppStyles';
import SymbolSearch from '../SymbolSearch';
import AppHeader from './components/AppHeader';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';
import { saveMessageToDatabase, removeLastUserMessage, formatTechnicalAnalysis } from '../../services/MessageUtil';
import { ChatMessage } from '../../types';

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
  
  // Update ref when symbol changes
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Load message history when component mounts or userId changes
  useEffect(() => {
    loadMessageHistory(true);
  }, [userId]);
  
  // Function to load message history
  const loadMessageHistory = async (reset = false) => {
    if (!userId) return;
    
    try {
      // If resetting, clear existing messages and set page to 1
      if (reset) {
        setLoading(true);
        setStatusMessage('Loading message history...');
        setPagination(prev => ({ ...prev, page: 1, nextCursor: null }));
      } else {
        setLoadingMore(true);
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
        
        // If resetting, replace all messages; otherwise append
        setMessages(prev => reset ? formattedMessages : [...prev, ...formattedMessages]);
        
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
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setStatusMessage('');
    }
  };

  // Load more messages
  const handleLoadMore = () => {
    loadMessageHistory(false);
  };

  // Handle analyze button click - using the current symbol
  const handleAnalyze = async (explicitSymbol?: string) => {
    // Reset messages and selectedAnalysisId for a fresh chat session
    setMessages([]);
    setStatusMessage('');
    
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
      
      // Try to save the user message but don't let an error stop the analysis
      try {
        // Ensure we have a valid message to save
        if (currentSymbol) {
          const message = `Analyze ${currentSymbol}...`;
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
      
      // Add user message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          content: `Analyzing ${currentSymbol}`,
          timestamp: new Date(),
          isUser: true,
          asset: currentSymbol
        }
      ]);
      
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
          chartUrl: chartUrls[0],
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
                  
                case 'images':
                  // Update chart URLs
                  if (Array.isArray(data.data) && data.data.length > 0) {
                    chartUrls = data.data;
                    // Update the AI message with the first chart URL
                    setMessages(prevMessages => 
                      prevMessages.map(msg => 
                        msg.id === aiMessageId.toString() 
                          ? { ...msg, chartUrl: chartUrls[0] }
                          : msg
                      )
                    );
                  }
                  break;
                  
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
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    // Create a unique ID for the message
    const messageId = Date.now().toString();
    
    // Add user message to UI immediately
    const userMessage = {
      id: messageId,
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Save message to database but don't wait for it
    saveMessageToDatabase(chatInput, userId, 'USER')
      .then(savedMessage => {
        if (savedMessage) {
          console.log('Message saved successfully:', savedMessage.id);
        } else {
          console.warn('Message saved to UI but not to database');
        }
      })
      .catch(error => console.error('Failed to save user message:', error));
    
    // Clear input regardless of save success
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
        {/* Header */}
        <AppHeader />
        <ResponsiveContainer sx={{ width: '100%' }}>
          <SymbolSearch 
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
        </ResponsiveContainer>

        {/* Messages Thread Area */}
        <MessageThreadContainer>
          {/* "Load More" button */}
          {pagination.hasMore && messages.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              padding: '12px' 
            }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleLoadMore}
                disabled={loadingMore}
                sx={{ 
                  textTransform: 'none',
                  color: '#5a5ef5',
                  borderColor: '#5a5ef5',
                  '&:hover': {
                    borderColor: '#4a4ed5',
                    backgroundColor: 'rgba(90, 94, 245, 0.04)'
                  }
                }}
              >
                {loadingMore ? (
                  <CircularProgress size={16} sx={{ color: '#5a5ef5', mr: 1 }} />
                ) : null}
                {loadingMore ? 'Loading...' : 'Load earlier messages'}
              </Button>
            </Box>
          )}
          
          {/* Chat Messages */}
          <ChatMessages 
            messages={messages}
            loading={loading}
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
        />
      </TelegramAppContainer>
    </>
  );
};

export default TelegramTradingApp; 