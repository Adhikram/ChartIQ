import axios from 'axios';

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  asset?: string;
  chartUrl?: string;
}

export interface ChatResponse {
  messages: ChatMessage[];
  error?: string;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

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
      this.messages.push(userMessage);

      // Generate charts using internal API
      const chartsResponse = await axios.post('/api/generate-charts', { symbol });
      if (!chartsResponse.data.chartUrls) {
        throw new Error('Failed to generate charts');
      }

      // Analyze charts using internal API
      const analysisResponse = await axios.post('/api/analyze-charts', { 
        chartUrls: chartsResponse.data.chartUrls,
        symbol 
      });
      
      if (!analysisResponse.data.analysis) {
        throw new Error('Failed to analyze charts');
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: analysisResponse.data.analysis,
        timestamp: new Date(),
        isUser: false,
        chartUrl: chartsResponse.data.chartUrls[0],
      };
      this.messages.push(aiMessage);

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

  private async saveChatHistory(): Promise<void> {
    try {
      await axios.post('/api/save-analysis', {
        messages: this.messages,
        userId: 'user123', // Replace with actual user ID
      });
    } catch (error) {
      console.error('Error saving chat history:', error);
      throw new Error('Failed to save chat history');
    }
  }

  public async loadChatHistory(userId: string): Promise<ChatHistory[]> {
    try {
      const response = await axios.get('/api/analysis-history/' + userId);
      return response.data;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }
}

export default ChatService; 