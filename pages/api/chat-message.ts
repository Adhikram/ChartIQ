import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../src/db/service';

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

  const pageNum = page && !isNaN(Number(page)) ? Number(page) : 1;
  const pageSize = rawPageSize && !isNaN(Number(rawPageSize)) 
    ? Math.min(Number(rawPageSize), MAX_PAGE_SIZE) 
    : DEFAULT_PAGE_SIZE;
  
  try {
    // Count total messages
    const countResult = await db.query(
      'SELECT COUNT(*) FROM "Message" WHERE "userId" = $1',
      [userId]
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Fetch messages with pagination
    const messagesResult = await db.query(
      `SELECT * FROM "Message" 
       WHERE "userId" = $1 
       ${cursor ? 'AND id < $3' : ''} 
       ORDER BY "createdAt" DESC 
       LIMIT $2`,
      cursor ? [userId, pageSize, cursor] : [userId, pageSize]
    );

    const messages = messagesResult.rows;
    const lastMessage = messages[messages.length - 1];
    const nextCursor = messages.length === pageSize ? lastMessage?.id : null;

    return res.status(200).json({
      messages: [...messages].reverse(),
      count: messages.length,
      totalCount,
      pagination: {
        page: pageNum,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        hasMore: messages.length === pageSize,
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