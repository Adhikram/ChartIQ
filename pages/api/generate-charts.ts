import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ensure the screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper function to generate a screenshot from a specific URL
async function generateScreenshot(url: string, symbol: string, interval: string) {
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    // Set the viewport size
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

    return `/screenshots/${filename}`;
  } catch (error) {
    console.error(`Error generating screenshot for ${symbol} ${interval}:`, error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { symbol } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    const urls = [
      { url: 'https://btc.cfd/1hrchart.html', interval: '1hr' },
      { url: 'https://btc.cfd/4hrchart.html', interval: '4hr' },
      { url: 'https://btc.cfd/1dchart.html', interval: '1d' }
    ];

    const screenshotPromises = urls.map(({ url, interval }) =>
      generateScreenshot(url, symbol, interval)
    );

    const chartUrls = await Promise.all(screenshotPromises);

    res.json({ chartUrls });
  } catch (error) {
    console.error('Error generating charts:', error);
    res.status(500).json({ 
      error: 'Failed to generate charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 