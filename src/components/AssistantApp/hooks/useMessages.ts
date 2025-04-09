import { useState, useRef, useCallback } from 'react';
import { ChatMessage, ConversationMessage, PaginationInfo } from '../types';
import { saveMessageToDatabase, removeLastUserMessage } from '../../../services/MessageUtil';

// Helper function to create a fallback welcome message
const createWelcomeMessage = (symbol: string): ChatMessage => {
  return {
    id: `welcome-${Date.now()}`,
    content: `Welcome to ChartIQ Assistant! What would you like to analyze today?`,
    timestamp: new Date().toISOString(),
    isUser: false,
    role: 'ASSISTANT',
    symbol: symbol
  };
};

export interface MessagesResult {
  messages: Array<ChatMessage>;
  conversationHistory: ConversationMessage[];
  loading: boolean;
  loadingMore: boolean;
  pagination: PaginationInfo;
  lastUserMessageId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Array<ChatMessage>>>;
  loadMessageHistory: (userId: string, symbol: string, reset?: boolean) => Promise<void>;
  handleSendMessage: (
    chatInput: string,
    userId: string,
    symbolRef: React.MutableRefObject<string>,
    accumulatedContent: string, 
    previousAnalysis: string,
    agentLoading: boolean, 
    messageEndRef: React.RefObject<HTMLDivElement>,
    setAgentLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setStatusMessage: React.Dispatch<React.SetStateAction<string>>,
    setChatInput: React.Dispatch<React.SetStateAction<string>>
  ) => Promise<void>;
}

export const useMessages = (): MessagesResult => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [lastUserMessageId, setLastUserMessageId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    totalPages: 1,
    hasMore: false,
    nextCursor: null
  });
  
  // Refs for tracking scroll position and loading state
  const topVisibleMessageRef = useRef<string | null>(null);
  const historyLoadedRef = useRef<boolean>(false);
  const welcomeMessageAddedRef = useRef<boolean>(false);
  
  // Track loaded state with symbol to prevent duplicate calls
  const lastLoadedRef = useRef<{
    symbol: string | null;
    userId: string | null;
    timestamp: number;
  }>({
    symbol: null,
    userId: null,
    timestamp: 0
  });

  // Helper function to load conversation history from message-history API
  // This is the ONLY place we should call message-history API
  // This function only updates conversationHistory state, never UI messages
  const loadConversationHistoryFromAPI = async (userId: string): Promise<ConversationMessage[]> => {
    // REMOVED: No longer loading from message-history API
    // Instead, we'll derive conversation history from the UI messages
    console.log("Message history API has been disabled - using chat messages only");
    return [];
  };

  // Function to load message history - ALWAYS use chat-message API for messages
  const loadMessageHistory = useCallback(async (userId: string, symbol: string, reset = false) => {
    if (!userId) return Promise.resolve();
    
    // If not resetting and already loaded this symbol recently (within 5 seconds), skip
    const now = Date.now();
    if (!reset && 
        lastLoadedRef.current.symbol === symbol && 
        lastLoadedRef.current.userId === userId &&
        now - lastLoadedRef.current.timestamp < 5000) {
      console.log(`Skipping loadMessageHistory for ${symbol} - recently loaded`);
      return Promise.resolve();
    }
    
    try {
      if (reset) {
        console.log(`Loading message history (reset=true) for user ${userId} and symbol ${symbol}`);
        setLoading(true);
        
        // Reset pagination
        setPagination(prev => ({ ...prev, page: 1, nextCursor: null }));
        topVisibleMessageRef.current = null;
        
        // Update loaded ref to prevent duplicate calls
        lastLoadedRef.current = {
          symbol,
          userId,
          timestamp: now
        };
        
        // REMOVED: Don't load conversation history here anymore
      } else {
        console.log("Loading more messages (reset=false)");
        setLoadingMore(true);
        if (!topVisibleMessageRef.current && messages.length > 0) {
          topVisibleMessageRef.current = messages[0].id;
        }
      }
      
      // ALWAYS use chat-message API for loading UI messages
      const requestData = {
        userId,
        symbol,
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
      let hasSetMessages = false;
      
      // Update chat messages if available
      if (data.messages && Array.isArray(data.messages)) {
        const formattedMessages = data.messages.map((msg: any) => {
          const isAssistant = msg.role === 'ASSISTANT' || msg.role === 'SYSTEM';
          return {
            id: msg.id || `msg-${Date.now()}-${Math.random()}`,
            content: msg.content,
            rawContent: isAssistant ? msg.content : undefined,
            timestamp: msg.createdAt || new Date().toISOString(),
            isUser: msg.role === 'USER',
            symbol: symbol,
            role: msg.role
          };
        });
        
        if (formattedMessages.length > 0) {
          // If resetting, replace all messages with new ones
          // For "load more", prepend older messages at the beginning
          setMessages(prev => reset ? formattedMessages : [...formattedMessages, ...prev]);
          hasSetMessages = true;
          
          // Mark that we've displayed real messages - no need for welcome message
          if (reset && formattedMessages.length > 0) {
            welcomeMessageAddedRef.current = true;
          }
        } else {
          console.log('No messages returned from server');
        }
      }
      
      // Update pagination information
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
      // If we're resetting and got no messages, show a welcome message
      // Only add welcome message if we haven't added one before to prevent duplicates
      if (reset && !hasSetMessages && messages.length === 0 && !welcomeMessageAddedRef.current) {
        console.log('No messages found, adding default welcome message');
        setMessages([createWelcomeMessage(symbol)]);
        welcomeMessageAddedRef.current = true;
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error loading message history:', error);
      
      // If error occurs and we have no messages, add a fallback welcome message
      // Only add welcome message if we haven't added one before
      if (reset && messages.length === 0 && !welcomeMessageAddedRef.current) {
        console.log('Error loading messages, adding fallback welcome message');
        setMessages([createWelcomeMessage(symbol)]);
        welcomeMessageAddedRef.current = true;
      }
      
      return Promise.reject(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.page, pagination.pageSize, pagination.nextCursor, messages.length]);

  // Handle sending a message
  const handleSendMessage = async (
    chatInput: string,
    userId: string,
    symbolRef: React.MutableRefObject<string>,
    accumulatedContent: string, 
    previousAnalysis: string,
    agentLoading: boolean, 
    messageEndRef: React.RefObject<HTMLDivElement>,
    setAgentLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setStatusMessage: React.Dispatch<React.SetStateAction<string>>,
    setChatInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (chatInput.trim() === '' || agentLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput(''); // Clear input
    
    // Check if this is an analyze command - we'll need to reload history if it is
    const isAnalyzeCommand = userMessage.toLowerCase().includes('analyze');
    
    try {
      setAgentLoading(true);
      
      // Add user message to UI immediately for better UX
      const tempUserId = Math.random().toString(36).substring(2, 15);
      const newUserMessage: ChatMessage = {
        id: tempUserId,
        content: userMessage,
        timestamp: new Date().toISOString(),
        isUser: true,
        role: 'USER',
        symbol: symbolRef.current
      };
      
      // 1. Add message to UI
      setMessages(prev => [...prev, newUserMessage]);
      
      // 2. Save user message to database via API instead of direct DB call
      try {
        const savedUserMessage = await saveMessageToDatabase(userMessage, userId, 'USER');
        
        if (savedUserMessage && savedUserMessage.id) {
          setLastUserMessageId(savedUserMessage.id);
          
          // Update the temp message with the real ID
          setMessages(prev => prev.map(msg => 
            msg.id === tempUserId ? { ...msg, id: savedUserMessage.id } : msg
          ));
        }
      } catch (dbError) {
        console.error('Error saving user message to database:', dbError);
      }
      
      // 3. Create conversation history from UI messages only
      // IMPORTANT: No longer using message-history API, only deriving from UI messages
      console.log("Creating conversation history from UI messages");
      const currentUIMessages = [...messages, newUserMessage];
      
      const currentConversationHistory: ConversationMessage[] = currentUIMessages
        .filter(msg => !msg.content.includes('typing-indicator')) // Skip loading indicators
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.rawContent || msg.content.replace(/<[^>]*>/g, '') // Strip HTML tags
        }));
        
      // Update conversation history state
      setConversationHistory(currentConversationHistory);
      
      // 4. Create and display a temporary assistant message
      const tempAssistantId = Math.random().toString(36).substring(2, 15);
      const newAssistantMessage: ChatMessage = {
        id: tempAssistantId,
        content: '<span class="assistant-prefix">Analyzing</span><div class="typing-indicator"><span>.</span><span>.</span><span>.</span></div>',
        timestamp: new Date().toISOString(),
        isUser: false,
        role: 'ASSISTANT',
        symbol: symbolRef.current
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // 5. Scroll to bottom to show typing indicator
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // 6. Check if we have accumulated content from a previous analysis or need to load it
      const analysisContent = accumulatedContent || previousAnalysis;
      
      // If no analysis is available, show a helpful message and suggest to run analyze first
      if (!analysisContent) {
        // Replace the temporary message with a helpful response
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantId ? { 
            ...msg, 
            content: `I need to analyze ${symbolRef.current} first before I can answer questions about it. Please type "analyze" or "analyze ${symbolRef.current}" to run a technical analysis.`,
            timestamp: new Date().toISOString()
          } : msg
        ));
        
        setAgentLoading(false);
        setStatusMessage('');
        return;
      }
      
      // 7. Call the stock assistant API with the conversation history we've prepared
      const response = await fetch('/api/stock-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysisContent,
          question: userMessage,
          userId,
          symbol: symbolRef.current,
          conversationHistory: currentConversationHistory
        }),
      });
      
      console.log('Response from stock-assistant:', response);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `API error: ${response.status}`;
        
        // If the error is about missing analysis, trigger a new analysis and inform the user
        if (errorData.status === 'error' && errorData.error && errorData.error.includes('No previous analysis found')) {
          throw new Error(`I need to analyze ${symbolRef.current} first. Please type "analyze" to run a technical analysis.`);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // 8. Add agent response to messages
      if (data.response) {
        // Update the temporary message with the real content
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantId ? { 
            ...msg, 
            id: data.messageId || tempAssistantId,
            content: data.response,
            rawContent: data.response,
            timestamp: new Date().toISOString(),
            role: 'ASSISTANT',
          } : msg
        ));
        
        await saveMessageToDatabase(data.response, userId, 'ASSISTANT');
        // 9. Manually update conversation history to keep it in sync
        // This avoids unnecessary API calls
        const assistantHistoryMessage: ConversationMessage = {
          role: 'assistant',
          content: data.response
        };
        
        // Always append the new assistant response to conversation history
        setConversationHistory(prev => [...prev, assistantHistoryMessage]);
        
        // If we need to refresh messages after certain operations, do it here
        // This would be a good place to refresh message UI if needed
        if (isAnalyzeCommand && data.shouldRefreshMessages) {
          try {
            // After analyze, refresh messages to show any new SYSTEM messages
            // But don't reset the welcome message flag
            await loadMessageHistory(userId, symbolRef.current, true);
          } catch (refreshErr) {
            console.error("Error refreshing messages after analyze:", refreshErr);
          }
        }
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
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your request. Please try again.',
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

  return {
    messages,
    conversationHistory,
    loading,
    loadingMore,
    pagination,
    lastUserMessageId,
    setMessages,
    loadMessageHistory,
    handleSendMessage
  };
}; 