import React, { useRef, useEffect, useState } from 'react';
import { Box, Modal, useMediaQuery, useTheme, IconButton, Typography } from '@mui/material';
import { AppContainer, GlobalStyle } from './styles';
import { AppHeader, ChatInput, ChatMessages, SymbolSelector } from './components';
import { ChatMessage, ConversationMessage, PaginationInfo } from './types';
import { saveMessageToDatabase, removeLastUserMessage, formatTechnicalAnalysis } from '../../services/MessageUtil';

/**
 * AssistantApp - A modern chat interface inspired by ChatGPT
 */
const AssistantApp: React.FC = () => {
  // State variables
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [userId, setUserId] = useState<string>('user123');
  const [lastUserMessageId, setLastUserMessageId] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState<boolean>(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [symbolSearchOpen, setSymbolSearchOpen] = useState<boolean>(false);
  const [symbolButtonPosition, setSymbolButtonPosition] = useState({ top: 0, right: 0 });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasMore: false,
    nextCursor: null
  });
  
  // Theme for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Refs
  const symbolRef = useRef<string>(symbol);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const topVisibleMessageRef = useRef<string | null>(null);
  const [isAtTop, setIsAtTop] = useState<boolean>(false);
  
  // Update ref when symbol changes
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  // Load message history when component mounts or userId changes
  useEffect(() => {
    loadMessageHistory(true);
  }, [userId]);
  
  // Add scroll detection for loading more messages
  useEffect(() => {
    const messageThread = document.querySelector('.message-thread-container');
    if (!messageThread) return;

    let isLoadingRef = false;

    const handleScroll = () => {
      if (messageThread.scrollTop < 50 && !isLoadingRef && pagination.hasMore && !loadingMore) {
        isLoadingRef = true;
        
        // Save current position for restoration
        if (messages.length > 0) {
          topVisibleMessageRef.current = messages[0].id;
        }
        
        // Load more messages
        loadMessageHistory(false).finally(() => {
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
  }, [pagination.hasMore, loadingMore, messages]);

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (!loadingMore && topVisibleMessageRef.current) {
      const messageElement = document.getElementById(`message-${topVisibleMessageRef.current}`);
      if (messageElement) {
        setTimeout(() => {
          messageElement.scrollIntoView({ behavior: 'auto' });
          topVisibleMessageRef.current = null;
        }, 100);
      }
    }
  }, [loadingMore, messages]);

  // Function to load message history
  const loadMessageHistory = async (reset = false) => {
    if (!userId) return Promise.resolve();
    
    try {
      if (reset) {
        setLoading(true);
        setStatusMessage('Loading message history...');
        setPagination(prev => ({ ...prev, page: 1, nextCursor: null }));
        topVisibleMessageRef.current = null;
        
        // Fetch conversation history for the agent when resetting
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
        }
      } else {
        setLoadingMore(true);
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
        
        // For "load more", prepend older messages at the beginning
        setMessages(prev => reset ? formattedMessages : [...formattedMessages, ...prev]);
        
        // Update pagination information
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading message history:', error);
      setStatusMessage('Error loading messages. Please try again.');
      return Promise.reject(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (chatInput.trim() === '' || agentLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput(''); // Clear input
    
    try {
      setAgentLoading(true);
      
      // Add user message to UI immediately for better UX
      const tempUserId = Math.random().toString(36).substring(2, 15);
      const newUserMessage: ChatMessage = {
        id: tempUserId,
        content: userMessage,
        timestamp: new Date().toISOString(),
        isUser: true,
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      // Save user message to database
      const savedUserMessage = await saveMessageToDatabase(userMessage, userId, 'USER');
      
      if (savedUserMessage && savedUserMessage.id) {
        setLastUserMessageId(savedUserMessage.id);
        
        // Update the temp message with the real ID
        setMessages(prev => prev.map(msg => 
          msg.id === tempUserId ? { ...msg, id: savedUserMessage.id } : msg
        ));
      }
      
      // Add the user message to conversation history
      const userHistoryMessage: ConversationMessage = {
        role: 'user',
        content: userMessage
      };
      
      // Update conversation history with the new user message
      const updatedHistory = [...conversationHistory, userHistoryMessage];
      setConversationHistory(updatedHistory);
      
      // Prepare to show assistant is typing
      setStatusMessage('Assistant is thinking...');
      
      // Create and display a temporary assistant message
      const tempAssistantId = Math.random().toString(36).substring(2, 15);
      const newAssistantMessage: ChatMessage = {
        id: tempAssistantId,
        content: '<span class="assistant-prefix">Analyzing</span><div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>',
        timestamp: new Date().toISOString(),
        isUser: false,
        symbol: symbolRef.current
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // Scroll to bottom to show typing indicator
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Call the stock assistant API like in TelegramTradingApp
      const response = await fetch('/api/stock-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: streamingContent,  // Pass accumulated content from last analysis
          question: userMessage,
          userId,
          conversationHistory: updatedHistory, // Send the updated conversation history
        }),
      });
      
      console.log('Response from stock-assistant:', response);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add agent response to messages
      if (data.response) {
        // Update the temporary message with the real content
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantId ? { 
            ...msg, 
            id: data.messageId || tempAssistantId,
            content: data.response, // No need for formatTechnicalAnalysis here
            timestamp: new Date().toISOString()
          } : msg
        ));
        
        // Use the updated conversation history from the server
        if (data.conversationHistory && Array.isArray(data.conversationHistory)) {
          setConversationHistory(data.conversationHistory);
          console.log('Updated conversation history from server', data.conversationHistory.length);
        }
        
        // Database saving is handled by the API endpoint
      } else {
        throw new Error('No response received from assistant');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the temporary assistant message on error
      setMessages(prev => prev.filter(msg => !msg.content.includes('Analyzing')));
      
      // Add an error message instead
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Remove the user message from the database if it causes an error
      if (lastUserMessageId) {
        try {
          await removeLastUserMessage(lastUserMessageId);
        } catch (removeError) {
          console.error('Failed to remove error-causing message:', removeError);
        }
      }
      
    } finally {
      setAgentLoading(false);
      setStatusMessage('');
      
      // Scroll to bottom to show the full conversation
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Handle key press in the input field
  const handleKeyPress = (e: React.KeyboardEvent, symbol: string) => {
    // Send message on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle viewport adjustments for mobile
  useEffect(() => {
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        document.documentElement.style.height = `${window.visualViewport.height}px`;
      }
    };
    
    window.addEventListener('resize', handleVisualViewportResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
    }
    
    // Set viewport meta tag for better mobile experience
    setViewportMetaTag();
    
    return () => {
      window.removeEventListener('resize', handleVisualViewportResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
      }
    };
  }, []);

  // Helper to set the viewport meta tag
  const setViewportMetaTag = () => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.getElementsByTagName('head')[0].appendChild(viewportMeta);
    }
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  };

  // Handler for symbol search submission
  const handleSymbolSearchSubmit = (selectedSymbol: string) => {
    console.log('Symbol search submitted with new symbol:', selectedSymbol);
    // Format the symbol to uppercase for better consistency
    const formattedSymbol = selectedSymbol.toUpperCase();
    // Update symbol
    setSymbol(formattedSymbol);
    setSymbolSearchOpen(false);
    // Set status message to confirm symbol change
    setStatusMessage(`Symbol changed to ${formattedSymbol}`);
    // Reload messages for the new symbol
    setTimeout(() => loadMessageHistory(true), 100);
    // Automatically trigger analysis for the new symbol
    handleAnalyze(formattedSymbol);
  };

  // Handle automatic analysis for a symbol
  const handleAnalyze = async (symbolToAnalyze: string) => {
    if (agentLoading) return;
    
    // Generate ID outside of try block so it's accessible in catch block
    const tempAssistantId = Math.random().toString(36).substring(2, 15);
    
    try {
      setAgentLoading(true);
      
      // Add the user analysis request to the database
      try {
        const message = `Analyze ${symbolToAnalyze}`;
        const lastUserMessage = await saveMessageToDatabase(message, userId, 'USER');
        if (lastUserMessage) {
          setLastUserMessageId(lastUserMessage.id);
          console.log('User analysis request saved to database:', lastUserMessage.id);
        }
      } catch (dbError) {
        console.error('Error saving user analysis request:', dbError);
        // Continue with analysis even if message save fails
      }
      
      // Create and display a temporary assistant message
      const newAssistantMessage: ChatMessage = {
        id: tempAssistantId,
        content: '<span class="assistant-prefix">Analyzing ' + symbolToAnalyze + '</span><div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>',
        timestamp: new Date().toISOString(),
        isUser: false,
        symbol: symbolToAnalyze
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // Scroll to bottom to show typing indicator
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Step 1: Generate charts first
      console.log('Generating charts for symbol:', symbolToAnalyze);
      setStatusMessage(`Generating charts for ${symbolToAnalyze}...`);
      
      const generateChartsResponse = await fetch('/api/generate-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol: symbolToAnalyze })
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
      
      // Step 2: Now analyze the charts with the chartUrls from step 1
      setStatusMessage(`Analyzing ${symbolToAnalyze}...`);
      
      // Prepare the request with the same format as TelegramTradingApp
      const requestData = {
        chartUrls: chartsData.chartUrls,
        symbol: symbolToAnalyze,
        userId
      };
      
      console.log('Sending analyze-charts request:', requestData);
      
      // Call analyze-charts instead of assistant API
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
      
      let accumulatedContent = '';
      let chartUrls: string[] = chartsData.chartUrls;
      const decoder = new TextDecoder();
      
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
                  // Update the AI message in real-time
                  setMessages(prevMessages => 
                    prevMessages.map(msg => 
                      msg.id === tempAssistantId 
                        ? { 
                            ...msg, 
                            content: formatTechnicalAnalysis(accumulatedContent),
                            rawContent: accumulatedContent
                          }
                        : msg
                    )
                  );
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

      // After streaming is complete, ensure the message has the chart URL
      if (accumulatedContent) {
        // Final update with chart URL
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantId ? { 
            ...msg,
            content: formatTechnicalAnalysis(accumulatedContent),
            rawContent: accumulatedContent,
            chartUrl: chartUrls[0]
          } : msg
        ));
        
        // Save the final analysis result to database
        try {
          if (accumulatedContent && accumulatedContent.trim()) {
            await saveMessageToDatabase(accumulatedContent, userId, 'ASSISTANT');
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
      } else {
        throw new Error('No analysis content received');
      }
      
    } catch (error) {
      console.error('Error analyzing symbol:', error);
      
      // Remove the temporary assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempAssistantId));
      
      // Add an error message instead
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `Sorry, I encountered an error analyzing ${symbolToAnalyze}. Please try again.`,
        timestamp: new Date().toISOString(),
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Remove the user message from the database if analysis fails
      if (lastUserMessageId) {
        try {
          await removeLastUserMessage(lastUserMessageId);
          console.log('Removed error-causing user message:', lastUserMessageId);
        } catch (removeError) {
          console.error('Failed to remove error-causing message:', removeError);
        }
      }
      
    } finally {
      setAgentLoading(false);
      setStatusMessage('');
      setLastUserMessageId(null);
      
      // Scroll to bottom to show the full conversation
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          symbol={symbol}
          statusMessage={statusMessage}
          isLoading={agentLoading}
        />
        
        {/* Symbol Search Modal */}
        <Modal
          open={symbolSearchOpen}
          onClose={() => setSymbolSearchOpen(false)}
          aria-labelledby="symbol-search-modal"
          closeAfterTransition
          BackdropProps={{
            timeout: 300,
            style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          }}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: isMobile ? '15%' : '80px',
            overflow: 'hidden',
          }}
        >
          <Box 
            sx={{
              width: isMobile ? '90%' : '450px',
              height: '80%',
              bgcolor: 'background.paper',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              borderRadius: '16px',
              p: isMobile ? '1.5rem 1rem' : 2,
              overflowY: 'auto', // Ensure vertical scrolling for overflowing content
              overflowX: 'visible', // Prevent horizontal overflow
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(16, 163, 127, 0.2)',
              animation: symbolSearchOpen ? 'dialogFadeIn 0.3s ease-out' : 'none',
              zIndex: 999,
              position: 'relative',
              '@keyframes dialogFadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(-20px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              },
              '&::-webkit-scrollbar': {
                width: '5px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.05)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(16, 163, 127, 0.3)',
                borderRadius: '8px',
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
              pb: 1.5,
              borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  mr: 1, 
                  display: 'flex', 
                  backgroundColor: 'rgba(16, 163, 127, 0.1)', 
                  p: 0.7, 
                  borderRadius: '8px' 
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3V21H21" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 14L11 10L15 14L21 8" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ color: '#10a37f', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Select Symbol
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setSymbolSearchOpen(false)}
                sx={{ 
                  color: '#666',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  width: '32px',
                  height: '32px',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </IconButton>
            </Box>
            
            {/* Search tip */}
            <Box sx={{ 
              mb: 2, 
              backgroundColor: 'rgba(16, 163, 127, 0.05)',
              p: 1.5,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Box sx={{ 
                display: 'flex', 
                color: '#10a37f',
                backgroundColor: 'white',
                p: 0.7, 
                borderRadius: '50%',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V12" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8H12.01" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography variant="body2" sx={{ color: '#333', fontSize: '0.85rem' }}>
                Type a stock symbol (e.g., AAPL, MSFT), crypto (e.g., BTCUSDT), or forex pair (e.g., EURUSD)
              </Typography>
            </Box>
            
            {/* Symbol selector container */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}> {/* Ensure scrolling within the SymbolSelector container */}
              <SymbolSelector 
                onSymbolSelect={handleSymbolSearchSubmit}
                initialValue={symbol}
                onKeyPress={(e) => {
                  // Close modal on Escape key
                  if (e.key === 'Escape') {
                    setSymbolSearchOpen(false);
                  }
                }}
              />
            </Box>
          </Box>
        </Modal>
      </AppContainer>
    </>
  );
};

export default AssistantApp;