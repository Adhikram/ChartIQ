export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  asset?: string;
  chartUrl?: string;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatResponse {
  messages: ChatMessage[];
  error?: string;
}

export interface AnalysisHistoryResponse {
  id: string;
  symbol: string;
  status: string;
  createdAt: string;
  messages: {
    id: string;
    content: string;
    role: string;
    timestamp: string;
  }[];
  chartUrls: string[];
}

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