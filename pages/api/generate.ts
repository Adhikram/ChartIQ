import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI();

// Ensure the screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper function to generate a screenshot from a specific URL
async function generateScreenshot(url: string, symbol: string, interval: string, analysisId: string) {
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    // Set the viewport size to 2048x2048
    await page.setViewport({ width: 2048, height: 2048 });

    // Navigate to the chart page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for 2 seconds to ensure the chart is fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a timestamp for unique filenames
    const timestamp = Date.now();

    // Define the screenshot filename
    const filename = `screenshot_${symbol}_${interval}_${timestamp}.png`;
    const screenshotPath = path.join(screenshotsDir, filename);

    // Take a screenshot and save it
    await page.screenshot({ path: screenshotPath, fullPage: false });

    await browser.close();

    // Save chart image record to database
    await prisma.chartImage.create({
      data: {
        analysisId,
        interval,
        imagePath: `/screenshots/${filename}`
      }
    });

    return `/screenshots/${filename}`;
  } catch (error) {
    // Log the error and update the chart image record with error
    console.error(`Error generating screenshot for ${symbol} ${interval}:`, error);
    await prisma.chartImage.create({
      data: {
        analysisId,
        interval,
        imagePath: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    throw error;
  }
}

// Function to generate screenshots for 1h, 4h, and 1d intervals concurrently
async function generateConcurrentScreenshots(symbol: string, analysisId: string) {
  const urls = [
    { url: 'https://btc.cfd/1hrchart.html', interval: '1hr' },
    { url: 'https://btc.cfd/4hrchart.html', interval: '4hr' },
    { url: 'https://btc.cfd/1dchart.html', interval: '1d' }
  ];

  try {
    const screenshotPromises = urls.map(({ url, interval }) =>
      generateScreenshot(url, symbol, interval, analysisId)
    );

    return await Promise.all(screenshotPromises);
  } catch (error) {
    // Update analysis status to failed
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Failed to generate screenshots'
      }
    });
    throw error;
  }
}

// Function to analyze charts using GPT-4 Vision
async function analyzeCharts(paths: string[], symbol: string, analysisId: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze these charts for ${symbol} and provide technical analysis. The charts are in 1h, 4h, and 1d timeframes.`
            } as const,
            ...paths.map(path => ({
              type: "image_url" as const,
              image_url: {
                url: `${process.env.NEXT_PUBLIC_BASE_URL}${path}`
              }
            }))
          ]
        }
      ],
      max_tokens: 1000
    });

    // Save the analysis response
    await prisma.message.create({
      data: {
        analysisId,
        content: response.choices[0].message.content || '',
        role: 'ASSISTANT'
      }
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing charts:', error);
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { 
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Failed to analyze charts'
      }
    });
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol, userId, platform = 'WEB' } = req.query;

  if (!symbol || Array.isArray(symbol)) {
    return res.status(400).json({ error: 'Symbol is required and must be a string' });
  }

  try {
    // Create new analysis record
    const analysis = await prisma.analysis.create({
      data: {
        symbol,
        userId: userId as string,
        status: 'GENERATING_CHARTS',
        platform: platform as 'WEB' | 'TELEGRAM'
      }
    });

    // Generate screenshots concurrently
    const screenshotPaths = await generateConcurrentScreenshots(symbol, analysis.id);

    // Update status to analyzing
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: { status: 'ANALYZING' }
    });

    // Analyze charts using GPT-4 Vision
    const analysisResult = await analyzeCharts(screenshotPaths, symbol, analysis.id);

    // Update status to completed
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: { status: 'COMPLETED' }
    });

    // Return the analysis result
    res.json({
      id: analysis.id,
      status: 'COMPLETED',
      chartUrls: screenshotPaths.map(path => `${process.env.NEXT_PUBLIC_BASE_URL}${path}`),
      analysis: analysisResult
    });
  } catch (error) {
    console.error('Error in analysis process:', error);
    res.status(500).json({ 
      error: 'Failed to complete analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 