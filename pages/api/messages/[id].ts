import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../prisma/getPrismaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid message ID' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'DELETE':
      return handleDeleteMessage(id, res);
    default:
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Handle DELETE request to delete a message
async function handleDeleteMessage(id: string, res: NextApiResponse) {
  try {
    // Delete the message from the database
    await prisma.message.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    
    // Check if the error is because the message was not found
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    return res.status(500).json({ error: 'Failed to delete message' });
  }
} 