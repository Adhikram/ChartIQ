export interface ChatMessage {
  id: string;
  content: string;
  rawContent?: string;
  timestamp: string;
  isUser: boolean;
  symbol?: string;
  chartUrl?: string;
  role?: 'USER' | 'ASSISTANT' | 'SYSTEM';
}

export interface ConversationMessage {
  role: string;
  content: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  nextCursor: string | null;
} 