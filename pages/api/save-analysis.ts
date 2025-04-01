import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, analysis, chartUrls, userId } = req.body;

  if (!symbol || !analysis || !chartUrls || !Array.isArray(chartUrls)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create the analysis record with associated messages and chart images
    const savedAnalysis = await prisma.analysis.create({
      data: {
        symbol,
        userId,
        status: 'COMPLETED',
        messages: {
          create: [
            {
              content: `Analyzing ${symbol}`,
              role: 'USER',
            },
            {
              content: analysis,
              role: 'ASSISTANT',
            },
          ],
        },
        chartImages: {
          create: chartUrls.map((url, index) => ({
            interval: index === 0 ? '1hr' : index === 1 ? '4hr' : '1d',
            imagePath: url,
          })),
        },
      },
      include: {
        messages: true,
        chartImages: true,
      },
    });

    res.json(savedAnalysis);
  } catch (error) {
    console.error('Error saving analysis:', error);
    res.status(500).json({ 
      error: 'Failed to save analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 