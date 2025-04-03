import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getChartAnalysisPrompt } from '../../prompts/chart-analysis';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chartUrls, symbol, userId } = req.body;

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

    // Create a LangChain ChatOpenAI instance with streaming enabled
    const model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL_NAME || "gpt-4o",
      temperature: 0.2,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token) {
            // Stream each token as it's generated
            if (token) {
              res.write(`data: ${JSON.stringify({ type: 'content', data: token })}\n\n`);
            }
          }
        }
      ]
    });

    // Create the message content with text and images
    const messageContent = [
      {
        type: "text",
        text: getChartAnalysisPrompt(symbol)
      },
      ...imageContents.map(base64Image => ({
        type: "image_url",
        image_url: {
          url: base64Image
        }
      }))
    ];

    // Create a human message with the content
    const message = new HumanMessage({
      content: messageContent
    });

    // Set up tracing metadata
    const runOptions = {
      tags: ["chart-analysis", "technical-analysis"],
      metadata: {
        userId: userId || "anonymous",
        symbol,
        chartCount: chartUrls.length
      }
    };

    // Call the model with streaming
    await model.invoke([message], runOptions);

    // End the stream
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error analyzing charts:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`);
    res.end();
  }
} 