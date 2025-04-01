import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId || Array.isArray(userId)) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get the user's analysis history with associated messages and chart images
    const analysisHistory = await prisma.analysis.findMany({
      where: {
        userId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        chartImages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Limit to last 10 analyses
    });

    // Format the response
    const formattedHistory = analysisHistory.map(analysis => ({
      id: analysis.id,
      symbol: analysis.symbol,
      status: analysis.status,
      createdAt: analysis.createdAt,
      messages: analysis.messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.createdAt,
      })),
      chartUrls: analysis.chartImages.map(img => img.imagePath),
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analysis history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 