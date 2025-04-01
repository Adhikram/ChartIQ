import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chartUrls, symbol } = req.body;

  if (!chartUrls || !Array.isArray(chartUrls)) {
    return res.status(400).json({ error: 'Chart URLs are required and must be an array' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze these charts for ${symbol || 'the asset'} and provide technical analysis. The charts are in 1h, 4h, and 1d timeframes.`
            },
            ...chartUrls.map(url => ({
              type: "image_url",
              image_url: {
                url: `${process.env.NEXT_PUBLIC_BASE_URL}${url}`
              }
            }))
          ]
        }
      ],
      max_tokens: 1000
    });

    res.json({ 
      analysis: response.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error analyzing charts:', error);
    res.status(500).json({ 
      error: 'Failed to analyze charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 