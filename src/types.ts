export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  chartUrl?: string;
  asset?: string;
  role?: string;
  symbol?: string;
}
export interface ChatResponse {
  content: string;
  chartUrl?: string;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
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
}

export interface StyledProps {
  theme: any;
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
  chart?: any;
  setSymbol?: (symbol: string) => void;
  resize?: () => void;
  activeChart?: any;
} 
export interface AnalysisHistoryProps {
  history: AnalysisItem[];
  selectedAnalysisId: string | null;
  onSelect: (analysis: AnalysisItem) => void;
  sx?: any;
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