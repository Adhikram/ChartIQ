import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { stockAssistantAgent } from '../../src/services/agents/stockAssistantAgent';

// Import the ConversationMessage interface from the agent file
import { ConversationMessage } from '../../src/services/agents/stockAssistantAgent';

const prisma = new PrismaClient();

/**
 * API route for the stock assistant agent
 * @param req The request object
 * @param res The response object
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { analysis, question, userId, conversationHistory: clientConversationHistory } = req.body;

    // Validate inputs
    if (!question) {
      return res.status(400).json({ error: 'Missing required field: question' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }

    // Log incoming request
    console.log(`Processing stock assistant query for user ${userId}`);
    
    let analysisContent = analysis;
    
    // If no specific analysis is provided, fetch the last analysis from the database
    if (!analysisContent) {
      console.log("No analysis provided, fetching from database...");
      
      try {
        // Find the last analysis message (sent by ASSISTANT)
        const lastAnalysisMessage = await prisma.message.findFirst({
          where: { 
            userId,
            role: 'ASSISTANT',
            // Ensure it's a full analysis message (typically longer than quick responses)
            content: {
              contains: 'Timeframe' // A keyword likely to be in analysis messages
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        if (lastAnalysisMessage) {
          analysisContent = lastAnalysisMessage.content;
          console.log(`Found last analysis message from ${lastAnalysisMessage.createdAt}`);
        } else {
          return res.status(404).json({ 
            error: 'No previous analysis found. Please run an analysis first.',
            status: 'error'
          });
        }
      } catch (dbError) {
        console.error('Error fetching analysis from database:', dbError);
        return res.status(500).json({ 
          error: 'Failed to retrieve previous analysis',
          status: 'error'
        });
      }
    }
    
    // Use client-provided conversation history if available
    let conversationHistory: ConversationMessage[] = [];
    
    if (clientConversationHistory && Array.isArray(clientConversationHistory)) {
      console.log(`Using ${clientConversationHistory.length} messages from client-provided conversation history`);
      conversationHistory = clientConversationHistory;
    } else {
      console.log("No client conversation history provided, fetching from database...");
      try {
        // Get the most recent messages before the analysis
        const messageHistory = await prisma.message.findMany({
          where: { 
            userId,
            createdAt: {
              lt: new Date() // Current timestamp as a default - will get recent messages
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to 10 messages for context
        });
        
        // Format conversation history
        conversationHistory = messageHistory.map(msg => ({
          role: msg.role.toLowerCase(),
          content: msg.content
        })).reverse(); // Oldest first
        
        console.log(`Retrieved ${conversationHistory.length} messages for context from database`);
      } catch (historyError) {
        console.warn('Error retrieving conversation history:', historyError);
        // Continue without history if there's an error
      }
    }
    
    // Get response from the agent, passing both analysis and history
    const response = await stockAssistantAgent.processQuery(
      analysisContent, 
      question,
      conversationHistory,
      userId
    );

    // Save the assistant's response to the database
    try {
      await prisma.message.create({
        data: {
          role: 'ASSISTANT',
          content: response,
          userId
        }
      });
      console.log('Saved assistant response to database');
    } catch (saveError) {
      console.error('Failed to save assistant response:', saveError);
      // Continue even if save fails
    }
    
    // Add the new message pair to conversation history for the next query
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: question },
      { role: 'assistant', content: response }
    ];

    // Return the response with updated conversation history
    return res.status(200).json({ 
      response,
      conversationHistory: updatedHistory,
      status: 'success' 
    });
  } catch (error) {
    console.error('Error in stock assistant API route:', error);
    return res.status(500).json({ 
      error: 'An error occurred while processing your request',
      status: 'error' 
    });
  }
} 