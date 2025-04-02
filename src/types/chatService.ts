import {ChatHistory, ChatResponse, ChatMessage} from "../types"


declare class ChatService {
  private static instance: ChatService;
  private messages: ChatMessage[];
  private constructor();
  
  public static getInstance(): ChatService;
  public loadChatHistory(userId: string): Promise<ChatHistory[]>;
  public sendMessage(symbol: string): Promise<ChatResponse>;
  public getMessages(): ChatMessage[];
  public clearMessages(): void;
  
  private saveAnalysis(symbol: string, analysis: string, chartUrls: string[]): Promise<void>;
  private generateCharts(symbol: string): Promise<{ chartUrls: string[]; error?: string }>;
  private analyzeCharts(chartUrls: string[]): Promise<{ analysis: string; error?: string }>;
}

export default ChatService; 