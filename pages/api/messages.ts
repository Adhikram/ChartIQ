import { NextApiRequest, NextApiResponse } from 'next';
import db, { Message } from '../../src/db/service';
import { createId } from '@paralleldrive/cuid2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handlePostMessage(req, res);
    case 'DELETE':
      return handleDeleteMessage(req, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Handle POST request to create a new message
async function handlePostMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { content, userId, role } = req.body;
    
    // Validate required fields with more detailed errors
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Missing required field: content must be a non-empty string' });
    }
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing required field: userId must be a string' });
    }
    
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: 'Missing required field: role must be a string' });
    }

    // Generate a new CUID for the message
    const newId = createId();

    // Create message
    const result = await db.query(
      'INSERT INTO "Message" (id, content, "userId", role) VALUES ($1, $2, $3, $4) RETURNING *',
      [newId, content, userId, role]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create message:', error);
    return res.status(500).json({ error: 'Failed to create message' });
  }
}

// Handle DELETE request to remove a message
async function handleDeleteMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { messageId, role } = req.query;
    
    // Validate required fields
    if (!messageId || typeof messageId !== 'string') {
      return res.status(400).json({ error: 'Missing required field: messageId must be a string' });
    }

    // Delete message
    const result = await db.query(
      'DELETE FROM "Message" WHERE id = $1 AND role = $2',
      [messageId, role]
    );

    if (result.rowCount > 0) {
      return res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } else {
      return res.status(404).json({ success: false, error: 'Message not found or not removed' });
    }
  } catch (error) {
    console.error('Failed to delete message:', error);
    return res.status(500).json({ error: 'Failed to delete message' });
  }
} 