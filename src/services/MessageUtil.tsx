import { Role } from '@prisma/client';
import { Message } from '@prisma/client';

export const formatTechnicalAnalysis = (content: string): string => {
  // Don't attempt to format if content is empty or null
  if (!content) return content;

  console.log('Formatting content:', content.substring(0, 50) + '...');
  
  // Parse any timeframe headers and add special class
  let formattedContent = content
    // Format ## X-Hour Timeframe or ## Daily Timeframe headers
    .replace(/## ([\w-]+) Timeframe/g, '<h2><span class="timeframe-header">$1 Timeframe</span></h2>')
    // Format ### Summary sections
    .replace(/### Summary/g, '<h3><span class="summary-header">Summary</span></h3>')
    // Format Overall Outlook section
    .replace(/### Overall Outlook/g, '<h3><span class="outlook-header">Overall Outlook</span></h3>')
    // Add classes to technical indicators
    .replace(/\*\*([\w\s-]+):\*\*/g, '<strong><span class="technical-indicator">$1:</span></strong>')
    // Enhance lists for better readability
    .replace(/- \*\*([\w\s-]+):\*\*/g, '- <strong><span class="list-indicator">$1:</span></strong>')
    // Convert markdown line breaks to HTML
    .replace(/\n/g, '<br />');
    
  console.log('Formatted content:', formattedContent.substring(0, 50) + '...');
  
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
  try {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to remove message:', error);
  }
};
