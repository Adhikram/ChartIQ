import { Theme } from '@mui/material/styles';

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

export interface StyledProps {
  theme: Theme;
}

export interface MessageProps extends StyledProps {
  isUser: boolean;
}

export interface ChartGenerationResponse {
  chartUrls: string[];
  error?: string;
}

export interface ChartAnalysisResponse {
  analysis: string;
  error?: string;
}

export interface TradingViewWidget {
  setSymbol: (symbol: string, interval: string) => void;
}

declare global {
  interface Window {
    TradingView: {
      widget: new (config: any) => TradingViewWidget;
    };
  }
} 