import { NextApiRequest, NextApiResponse } from 'next';
import { ConversationMessage } from '../../src/services/agents/stockAssistantAgent';
import { getLastAnalysisMessage, getConversationHistory } from '../../src/services/MessageUtil';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, limit, includeConversationHistory } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Set a reasonable limit to avoid too many messages
  const messageLimit = limit && !isNaN(Number(limit)) ? Math.min(Number(limit), 50) : 20;

  try {
    console.log(`Fetching message history for userId: ${userId}`);
    
    // First, find the last analysis message (sent by ASSISTANT)
    const lastAnalysisMessage = await getLastAnalysisMessage(userId);
    
    if (!lastAnalysisMessage) {
      console.log(`No analysis messages found for user ${userId}`);
      return res.status(200).json({ 
        messages: [],
        lastAnalysis: null,
        conversationHistory: []
      });
    }
    
    console.log(`Found last analysis message from ${lastAnalysisMessage.createdAt}`);
    
    // Get conversation history
    const conversationHistory = await getConversationHistory(userId);
    
    // Sort messages in chronological order (oldest first)
    const sortedMessages = [...conversationHistory].reverse();
    
    // If requested, format conversation history for the agent
    let formattedConversationHistory: ConversationMessage[] = [];
    if (includeConversationHistory) {
      formattedConversationHistory = sortedMessages.map(msg => ({
        role: msg.role.toLowerCase(),
        content: msg.content
      }));
    }
    
    return res.status(200).json({ 
      messages: sortedMessages,
      lastAnalysis: lastAnalysisMessage,
      conversationHistory: formattedConversationHistory
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 