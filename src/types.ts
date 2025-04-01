export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  chartUrl?: string;
  asset?: string;
}

export interface AnalysisItem {
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

export interface StyledProps {
  theme: any;
}

export interface TradingViewWidget {
  chart?: any;
  setSymbol?: (symbol: string) => void;
  resize?: () => void;
  activeChart?: any;
} 