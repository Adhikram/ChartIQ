import axios from 'axios';
import type { ChatMessage, ChatHistory, ChatResponse, AnalysisHistoryResponse } from '../types/chatService';

class ChatService {
  private static instance: ChatService;
  private messages: ChatMessage[] = [];

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async loadChatHistory(userId: string): Promise<ChatHistory[]> {
    try {
      const response = await axios.get<AnalysisHistoryResponse[]>(`/api/analysis-history/${userId}`);
      
      // Convert the API response to ChatHistory format
      return response.data.map(analysis => ({
        id: analysis.id,
        messages: analysis.messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          isUser: msg.role === 'USER',
          asset: analysis.symbol,
          chartUrl: analysis.chartUrls[0]
        })),
        createdAt: new Date(analysis.createdAt),
        updatedAt: new Date(analysis.createdAt)
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  public async sendMessage(symbol: string): Promise<ChatResponse> {
    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Analyzing ${symbol}`,
        timestamp: new Date(),
        isUser: true,
        asset: symbol,
      };
      this.messages = [userMessage]; // Reset messages for new analysis

      // Generate charts using internal API
      const chartsResponse = await axios.post<{ chartUrls: string[] }>('/api/generate-charts', { symbol });
      if (!chartsResponse.data.chartUrls?.length) {
        throw new Error('Failed to generate charts');
      }

      // Analyze charts using internal API with proper streaming configuration
      const analysisResponse = await fetch('/api/analyze-charts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chartUrls: chartsResponse.data.chartUrls,
          symbol 
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze charts');
      }

      const reader = analysisResponse.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      let analysis = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              switch (data.type) {
                case 'content':
                  analysis += data.data;
                  // Update the AI message in real-time
                  const updatedAiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: analysis,
                    timestamp: new Date(),
                    isUser: false,
                    chartUrl: chartsResponse.data.chartUrls[0],
                  };
                  this.messages = [userMessage, updatedAiMessage];
                  break;
                case 'error':
                  throw new Error(data.error);
                case 'done':
                  // Final update
                  break;
              }
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }
      }

      // Save the analysis
      await this.saveAnalysis(symbol, analysis, chartsResponse.data.chartUrls);

      return {
        messages: this.messages,
      };
    } catch (error) {
      console.error('Error in chat service:', error);
      return {
        messages: this.messages,
        error: error instanceof Error ? error.message : 'An error occurred while processing your request',
      };
    }
  }

  private async saveAnalysis(symbol: string, analysis: string, chartUrls: string[]): Promise<void> {
    try {
      await axios.post('/api/save-analysis', {
        symbol,
        analysis,
        chartUrls,
        userId: 'user123', // Replace with actual user ID from auth system
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      // Don't throw error here, just log it
    }
  }

  public getMessages(): ChatMessage[] {
    return this.messages;
  }

  public clearMessages(): void {
    this.messages = [];
  }

  private async generateCharts(symbol: string): Promise<{ chartUrls: string[]; error?: string }> {
    try {
      const response = await axios.post('/api/generate-charts', { symbol });
      return response.data;
    } catch (error) {
      console.error('Error generating charts:', error);
      return {
        chartUrls: [],
        error: 'Failed to generate charts. Please try again later.',
      };
    }
  }

  private async analyzeCharts(chartUrls: string[]): Promise<{ analysis: string; error?: string }> {
    try {
      const response = await axios.post('/api/analyze-charts', { chartUrls });
      return response.data;
    } catch (error) {
      console.error('Error analyzing charts:', error);
      return {
        analysis: '',
        error: 'Failed to analyze charts. Please try again later.',
      };
    }
  }
}

export default ChatService; 