import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default pagination settings
const DEFAULT_PAGE_SIZE = 5;
const MAX_PAGE_SIZE = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, messageId, symbol, page, pageSize: rawPageSize, cursor } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Process pagination parameters
  const pageNum = page && !isNaN(Number(page)) ? Number(page) : 1;
  const pageSize = rawPageSize && !isNaN(Number(rawPageSize)) 
    ? Math.min(Number(rawPageSize), MAX_PAGE_SIZE) 
    : DEFAULT_PAGE_SIZE;
  
  // Calculate skip value for pagination
  // If cursor is provided, we'll use cursor-based pagination instead
  const skip = cursor ? 0 : (pageNum - 1) * pageSize;

  try {
    console.log(`Fetching messages for userId: ${userId}, page: ${pageNum}, pageSize: ${pageSize}`);
    
    // Count total messages for pagination info
    const totalCount = await prisma.message.count({
      where: { userId }
    });
    
    // Fetch conversation history for the user with pagination
    const userMessages = await prisma.message.findMany({
      where: { 
        userId,
        ...(cursor ? { id: { lt: cursor } } : {})
      },
      orderBy: {
        createdAt: 'desc' // Newer messages first
      },
      take: pageSize,
      skip: skip
    });
    
    // Get the last message ID for cursor-based pagination
    const lastMessage = userMessages[userMessages.length - 1];
    const nextCursor = userMessages.length === pageSize ? lastMessage?.id : null;
    
    console.log(`Found ${userMessages.length} messages for user ${userId} (total: ${totalCount})`);
    
    // Sort messages in ascending order for display (oldest first)
    const sortedMessages = [...userMessages].reverse();
    
    return res.status(200).json({ 
      messages: sortedMessages,
      count: sortedMessages.length,
      totalCount,
      pagination: {
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: userMessages.length === pageSize,
        nextCursor
      },
      symbol
    });
  } catch (error) {
    console.error('Error fetching message history:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
} 