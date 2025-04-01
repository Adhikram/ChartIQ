import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

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

  // Set headers for streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // First, send the image URLs to the client
    res.write(`data: ${JSON.stringify({ type: 'images', data: chartUrls })}\n\n`);

    // Convert image URLs to base64
    const imageContents = await Promise.all(
      chartUrls.map(async (url) => {
        const imagePath = path.join(process.cwd(), 'public', url);
        const imageBuffer = await fs.promises.readFile(imagePath);
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
      })
    );

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text" as const,
              text: `Please analyze these charts for ${symbol || 'the asset'} and provide technical analysis. The charts are in 1h, 4h, and 1d timeframes. Format your response in markdown.`
            },
            ...imageContents.map(base64Image => ({
              type: "image_url" as const,
              image_url: {
                url: base64Image
              }
            }))
          ]
        }
      ],
      max_tokens: 1000,
      stream: true,
    });

    // Stream the response
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`);
      }
    }

    // End the stream
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error analyzing charts:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
    res.end();
  }
} 