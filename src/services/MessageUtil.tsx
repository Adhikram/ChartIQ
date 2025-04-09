// Define types locally instead of importing from Prisma
export type Role = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface Message {
  id: string;
  userId: string | null;
  content: string;
  role: Role;
  createdAt: Date;
}

import db from '../db/service';

export const formatTechnicalAnalysis = (content: string): string => {
  // Don't attempt to format if content is empty or null
  if (!content) return content;

  // console.log('Formatting content:', content.substring(0, 50) + '...');
  
  // Parse any timeframe headers and add special class
  let formattedContent = content
    // First replace raw markdown headers with corresponding HTML tags
    // Format # Symbol/Ticker header
    .replace(/^# ([\w:.]+)/gm, '<h1><span class="symbol-header">$1</span></h1>')
    // Format ## X-Hour Timeframe or ## Daily Timeframe headers
    .replace(/^## ([\w-]+)/gm, '<h2><span class="timeframe-header">$1</span></h2>')
    // Format ### Section headers like Price, On-Balance, etc.
    .replace(/^### ([\w-]+)/gm, '<h3><span class="section-header">$1</span></h3>')
    // Format "Action" as bold
    .replace(/\bAction\b/g, '<span class="action-header">Action</span>')
    // Add special classes to properly format timeframe sections
    .replace(/<h2><span class="timeframe-header">([\w-]+)<\/span><\/h2>/g, 
      '<div class="timeframe-container"><h2><span class="timeframe-header">$1</span></h2></div>')
    // Format section headers with containers
    .replace(/<h3><span class="section-header">([\w-]+)<\/span><\/h3>/g, 
      '<div class="section-container $1-container"><h3><span class="section-header">$1</span></h3>')
    // Add classes to technical indicators
    .replace(/\*\*([\w\s-]+):\*\*/g, '<strong><span class="technical-indicator">$1:</span></strong>')
    // Enhance lists for better readability
    .replace(/- \*\*([\w\s-]+):\*\*/g, '<div class="indicator-item">- <strong><span class="list-indicator">$1:</span></strong>')
    .replace(/^- ([^<])/gm, '<div class="list-item">- $1')
    // Format any remaining bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Format any remaining italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Add closing divs for list items
    .replace(/\n/g, '</div>\n')
    // Convert line breaks to HTML
    .replace(/\n/g, '<br />')
    // Clean up any double closing divs
    .replace(/<\/div><br \/><\/div>/g, '</div></div>')
    .replace(/<\/div><br \/><div/g, '</div><div')
    // Ensure pairs of section containers are closed properly
    .replace(/<div class="section-container/g, '</div><div class="section-container')
    // Fix the first section container (remove extra closing div)
    .replace(/^<\/div><div class="section-container/, '<div class="section-container');

  // Wrap the entire content in a mobile-friendly container
  formattedContent = '<div class="mobile-analysis-content">' + formattedContent + '</div>';
  
  // Ensure all containers are closed
  if (formattedContent.indexOf('section-container') !== -1 && !formattedContent.endsWith('</div></div>')) {
    formattedContent += '</div>';
  }
  
  // console.log('Formatted content:', formattedContent.substring(0, 50) + '...');
  
  return formattedContent;
};

export const saveMessageToDatabase = async (message: string, userId: string, role: string): Promise<Message | undefined> => {
  try {
    // Client-side validation
    if (!message || !message.trim()) {
      console.error('Cannot save empty message');
      return undefined;
    }
    
    if (!userId || !role) {
      console.error('Missing required parameters: userId or role');
      return undefined;
    }
    
    console.log(`Saving message to database: userId=${userId}, role=${role}, content length=${message.length}`);
    
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message,
        userId,
        role,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to save message: ${response.status}`);
      // Log the response for debugging
      const errorText = await response.text();
      console.error('Error response:', errorText);
      // Don't throw, just return undefined
      return undefined;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to save message:', error);
    return undefined;
  }
};

export const removeLastUserMessage = async (messageId: string) => {
  if (!messageId) {
    console.error('Cannot remove message with null ID');
    return false;
  }
  
  try {
    const response = await fetch(`/api/messages?messageId=${messageId}&role=USER`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      console.log('Message removed successfully');
      return true;
    } else {
      console.error('Message not found or not removed');
      return false;
    }
  } catch (error) {
    console.error('Failed to remove message:', error);
    return false;
  }
};


export const getMessageHistory = async (userId: string): Promise<Message[]> => {
  try {
    const response = await fetch(`/api/message-history?userId=${userId}`);
    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error('Failed to get message history:', error);
    return [];
  }
};

export const getChatHistory = async (userId: string): Promise<Message[]> => {
  try {
    const response = await fetch(`/api/chat-message?userId=${userId}`);
    const data = await response.json();
    return data.messages;
  } catch (error) {
    console.error('Failed to get chat history:', error);
    return [];
  }
};

export const getLastAnalysisMessage = async (userId: string): Promise<Message | null> => {
  try {
    const response = await fetch(`/api/message-history?userId=${userId}`);
    const data = await response.json();
    return data.lastAnalysis[0];
  } catch (error) {
    console.error('Failed to get message history:', error);
    return null;
  }
};

export const getConversationHistory = async (userId: string): Promise<Message[]> => {
  try {
    const response = await fetch(`/api/message-history?userId=${userId}`);
    const data = await response.json();
    return data.conversationHistory;
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    return [];
  }
};


