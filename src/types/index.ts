/**
 * ChatMessage interface representing a message in the chat
 */
export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string | Date;
  isUser: boolean;
  symbol?: string;
  chartUrl?: string;
  asset?: string;
  rawContent?: string; // Optional field to store unformatted content
} 