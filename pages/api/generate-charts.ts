import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

// Ensure the screenshots directory exists
const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper function to generate a screenshot from a specific URL
async function generateScreenshot(url: string, symbol: string, interval: string) {
  console.log('Generating screenshot for', url, symbol, interval);
  let browser = null;
  try {
    // Launch with minimal browser settings
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=800,600'
      ]
    });
    
    const page = await browser.newPage();

    // Set a small viewport size for faster rendering
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`Navigating to ${url} for ${symbol} ${interval}...`);
    
    // Try to navigate with longer timeout
    try {
      await page.goto(url, { 
        waitUntil: 'networkidle2', // Wait until network is idle
        timeout: 60000
      });
    } catch (navError) {
      console.error(`Navigation timeout for ${url}. Continuing anyway.`);
    }
    try {
      await page.waitForSelector('.tradingview-widget-container', { 
        visible: true,
        timeout: 30000 
      });
      // Additional wait to ensure chart data is fully rendered
      console.log(`Additional wait for chart data to render for ${symbol} ${interval}...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (waitError) {
      console.error(`Timeout waiting for chart elements for ${symbol} ${interval}:`, waitError);
      console.log(`Taking screenshot anyway after timeout...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }

    // Define the screenshot filename
    const timestamp = Date.now();
    const filename = `screenshot_${symbol}_${interval}_${timestamp}.png`;
    const screenshotPath = path.join(screenshotsDir, filename);

    // Take a screenshot with reduced quality
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: false,
      quality: 50,
      type: 'jpeg'
    });

    return `/screenshots/${filename}`;
  } catch (error) {
    console.error(`Error generating screenshot for ${symbol} ${interval}:`, error);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
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
    // Only process one chart at a time to reduce server load
    const urls = [
      { url: `${process.env.NEXT_PUBLIC_BASE_URL}/chart?symbol=${symbol}&interval=60`, interval: '1hr' },
      { url: `${process.env.NEXT_PUBLIC_BASE_URL}/chart?symbol=${symbol}&interval=240`, interval: '4hr' },
      { url: `${process.env.NEXT_PUBLIC_BASE_URL}/chart?symbol=${symbol}&interval=D`, interval: '1d' },
    ];

    const screenshotUrls = await Promise.all(urls.map(url => generateScreenshot(url.url, symbol, url.interval)));
    

    
    res.json({ chartUrls: screenshotUrls });
  } catch (error) {
    console.error('Error generating charts:', error);
    res.status(500).json({ 
      error: 'Failed to generate charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 