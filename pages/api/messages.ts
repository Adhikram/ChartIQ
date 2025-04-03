import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../prisma/getPrismaClient';
import { Role } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle different HTTP methods
  switch (req.method) {
    case 'POST':
      return handlePostMessage(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Handle POST request to create a new message
async function handlePostMessage(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { content, userId, role } = req.body;
    
    // Validate required fields with more detailed errors
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Missing required field: content must be a non-empty string' });
    }
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing required field: userId must be a string' });
    }
    
    if (!role || typeof role !== 'string') {
      return res.status(400).json({ error: 'Missing required field: role must be a string' });
    }

    // Create the message in the database
    const message = await prisma.message.create({
      data: {
        content,
        userId,
        role: role as Role, 
      },
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return res.status(500).json({ error: 'Failed to create message' });
  }
} 