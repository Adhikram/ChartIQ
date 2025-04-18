import { useState, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { saveMessageToDatabase, removeLastUserMessage } from '../../../services/MessageUtil';

export interface AnalysisResult {
  previousAnalysis: string;
  previousAnalysisLoading: boolean;
  accumulatedContent: string;
  loadPreviousAnalysis: (userId: string, symbol: string) => Promise<void>;
  handleAnalyze: (symbolToAnalyze: string, userId: string, setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>, messageEndRef: React.RefObject<HTMLDivElement>, setAgentLoading: React.Dispatch<React.SetStateAction<boolean>>, setStatusMessage: React.Dispatch<React.SetStateAction<string>>) => Promise<void>;
}

export const useAnalysis = (): AnalysisResult => {
  const [previousAnalysis, setPreviousAnalysis] = useState<string>('');
  const [previousAnalysisLoading, setPreviousAnalysisLoading] = useState<boolean>(false);
  const [accumulatedContent, setAccumulatedContent] = useState<string>('');
  const lastUserMessageIdRef = useRef<string | null>(null);
  
  // Track the last loaded symbol to prevent duplicate loads
  const lastLoadedSymbolRef = useRef<string | null>(null);

  // Function to load previous analysis for the current symbol
  const loadPreviousAnalysis = useCallback(async (userId: string, symbol: string): Promise<void> => {
    if (!userId || !symbol) return;
    
    try {
      setPreviousAnalysisLoading(true);
      console.log(`Loading previous analysis for symbol: ${symbol}`);
      
      // Use the chat-message API instead of message-history
      // Look for the most recent SYSTEM message containing analysis
      const response = await fetch('/api/chat-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          symbol,
          limit: 20,
          includeSystemMessages: true
        }),
      });
      
      if (!response.ok) {
        console.log(`Error fetching messages: ${response.status}`);
        setPreviousAnalysis('');
        setAccumulatedContent('');
        return;
      }
      
      const data = await response.json();
      
      // Find the most recent SYSTEM message which should contain the analysis
      let lastAnalysis = null;
      
      if (data.messages && Array.isArray(data.messages)) {
        lastAnalysis = data.messages.find((msg: { role: string; content: string }) => msg.role === 'SYSTEM');
      }
      
      if (lastAnalysis && lastAnalysis.content) {
        console.log(`Found previous analysis in system message`);
        setPreviousAnalysis(lastAnalysis.content);
        setAccumulatedContent(lastAnalysis.content);
      } else {
        console.log(`No system message with analysis found for ${symbol}`);
        setPreviousAnalysis('');
        setAccumulatedContent('');
      }
    } catch (error) {
      console.error(`Error loading previous analysis for ${symbol}:`, error);
      setPreviousAnalysis('');
      setAccumulatedContent('');
    } finally {
      setPreviousAnalysisLoading(false);
    }
  }, []);

  // Add helper function for generating a single chart with improved error handling
  const generateChart = async (symbol: string, interval: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, interval })
      });

      if (!response.ok) {
        console.error(`Failed to generate ${interval} chart: ${response.status}`);
        return null; // Return null instead of throwing
      }

      const data = await response.json();
      return data.chartUrl;
    } catch (error) {
      console.error(`Error in chart generation for ${symbol} ${interval}:`, error);
      return null; // Return null for any error
    }
  };

  // Update handleAnalyze function
  const handleAnalyze = async (
    symbolToAnalyze: string, 
    userId: string,
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    messageEndRef: React.RefObject<HTMLDivElement>,
    setAgentLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setStatusMessage: React.Dispatch<React.SetStateAction<string>>
  ): Promise<void> => {
    // Generate ID outside of try block so it's accessible in catch block
    const tempAssistantId = Math.random().toString(36).substring(2, 15);
    
    try {
      setAgentLoading(true);
      
      // Add the user analysis request to the database via API instead of direct DB call
      try {
        const message = `Analyze ${symbolToAnalyze}`;
        // Use the existing API endpoint
        const response = await saveMessageToDatabase(message, userId, 'USER');
        
        if (response) {
          lastUserMessageIdRef.current = response.id;
          console.log('User analysis request saved to database:', response.id);
        } else {
          console.error('Error saving user analysis request:');
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
        role: 'ASSISTANT',
        symbol: symbolToAnalyze
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // Scroll to bottom to show typing indicator
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // // Generate charts sequentially with error handling
      // const chartUrls: string[] = [];
      // const intervalMap = {
      //   'Hourly': '60',
      //   '4 Hourly': '240',
      //   'Daily': 'D'
      // };
      
      // for (const interval of Object.keys(intervalMap)) {
      //   setStatusMessage(`Generating ${interval} chart for ${symbolToAnalyze}...`);
      //   try {
      //     const chartUrl = await generateChart(symbolToAnalyze, intervalMap[interval as keyof typeof intervalMap]);
      //     if (chartUrl) {
      //       chartUrls.push(chartUrl);
      //       console.log(`Generated ${interval} chart:`, chartUrl);
      //     } else {
      //       console.warn(`Could not generate ${interval} chart, continuing analysis...`);
      //     }
      //   } catch (error) {
      //     console.error(`Error generating ${interval} chart:`, error);
      //     // Continue with analysis even if chart generation fails
      //   }
      // }
      
      // // Continue with analysis even if no charts were generated
      // if (chartUrls.length === 0) {
      //   console.warn('No charts could be generated, continuing with analysis without charts...');
      // }
      
      // // Step 2: Now analyze the charts with the chartUrls (or without them if none were generated)
      // setStatusMessage(`Analyzing ${symbolToAnalyze} across multiple timeframes...`);
      
      // // Prepare the request with the chartUrls
      // const requestData = {
      //   chartUrls,
      //   symbol: symbolToAnalyze,
      //   userId
      // };
      
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
      
      // Call analyze-charts
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
      
      // Reset accumulated content
      setAccumulatedContent('');
      let myAccumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
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
                  myAccumulatedContent += data.data;
                  // Update the state
                  setAccumulatedContent(myAccumulatedContent);
                  // Update the AI message in real-time
                  setMessages(prevMessages => 
                    prevMessages.map(msg => 
                      msg.id === tempAssistantId 
                        ? { 
                            ...msg, 
                            content:  myAccumulatedContent,
                            rawContent: myAccumulatedContent,
                            role: 'ASSISTANT'
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

      // After streaming is complete, ensure the message has the chart URL and update accumulated content
      if (myAccumulatedContent) {
        // Update the state variable one final time
        setAccumulatedContent(myAccumulatedContent);
        setPreviousAnalysis(myAccumulatedContent);
        // Update the lastLoadedSymbol to cache this result
        lastLoadedSymbolRef.current = symbolToAnalyze;
        
        // Save the analysis results to database
        try {
          if (myAccumulatedContent && myAccumulatedContent.trim()) {
            // Then save the same content as a SYSTEM message for future reference via API
            const savedSystemMessage = await saveMessageToDatabase(myAccumulatedContent, userId, 'SYSTEM');

            // Update the message with the real ID if we got one back
            if (savedSystemMessage) {
              setMessages(prev => prev.map(msg => 
                msg.id === tempAssistantId ? { 
                  ...msg,
                  id: savedSystemMessage.id,
                  content: myAccumulatedContent,
                  rawContent: myAccumulatedContent,
                  // chartUrl: chartUrls[0],
                  role: 'SYSTEM'
                } : msg
              ));
            } else {
              // Update the message without changing the ID
              setMessages(prev => prev.map(msg => 
                msg.id === tempAssistantId ? { 
                  ...msg,
                    content: myAccumulatedContent,
                  rawContent: myAccumulatedContent,
                  // chartUrl: chartUrls[0],
                  role: 'SYSTEM'
                } : msg
              ));
            } 
          } else {
            console.warn('No content to save to database');
            if (lastUserMessageIdRef.current) {
              console.log('Removing last user message from database:', lastUserMessageIdRef.current);
              removeLastUserMessage(lastUserMessageIdRef.current);
            }
          }
        } catch (saveError) {
          console.error('Failed to save analysis result to database:', saveError);
          // Continue anyway - user can still see the result in UI
          
          // Update the message without changing the ID
          setMessages(prev => prev.map(msg => 
            msg.id === tempAssistantId ? { 
              ...msg,
              content: myAccumulatedContent,
              rawContent: myAccumulatedContent,
              // chartUrl: chartUrls[0],
              role: 'SYSTEM'
            } : msg
          ));
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
        content: `Sorry, I encountered an error analyzing ${symbolToAnalyze}. ${error instanceof Error ? error.message : ''}`,
        timestamp: new Date().toISOString(),
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      // Remove the user message from the database if analysis fails
      if (lastUserMessageIdRef.current) {
        try {
          await removeLastUserMessage(lastUserMessageIdRef.current);
          console.log('Removed error-causing user message:', lastUserMessageIdRef.current);
        } catch (removeError) {
          console.error('Failed to remove error-causing message:', removeError);
        }
      }
      
    } finally {
      setAgentLoading(false);
      setStatusMessage('');
      lastUserMessageIdRef.current = null;
      
      // Scroll to bottom to show the full conversation
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return {
    previousAnalysis,
    previousAnalysisLoading,
    accumulatedContent,
    loadPreviousAnalysis,
    handleAnalyze
  };
};