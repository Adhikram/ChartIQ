import axios from 'axios';
import { ChatMessage, ChatHistory, ChatResponse as ChatResponseType, AnalysisHistoryResponse } from '../types';

class ChatService {
  private static instance: ChatService;
  private messages: ChatMessage[] = [];
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '/api';
  }

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
        createdAt: new Date(analysis.createdAt).toISOString(),
        updatedAt: new Date(analysis.createdAt).toISOString()
      }));
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  public async sendMessage(content: string, symbol: string): Promise<ChatResponseType> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, symbol }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
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