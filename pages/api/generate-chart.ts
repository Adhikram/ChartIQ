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
    
    // Reduce resource usage
    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //   const resourceType = req.resourceType();
    //   // Block unnecessary resources
    //   if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });

    // Set a longer timeout for navigation (60 seconds)
    page.setDefaultNavigationTimeout(60000);

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

    console.log(`Waiting for TradingView widget to load for ${symbol} ${interval}...`);
    
    // Wait for TradingView widget container to be visible
    try {
      await page.waitForSelector('.tradingview-widget-container', { 
        visible: true,
        timeout: 30000 
      });
      
      // Add a script to detect when the TradingView chart is fully loaded
      await page.evaluate(() => {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            // Look for elements that indicate chart is loaded
            const chartElements = document.querySelectorAll('.chart-markup-table');
            const loadingIndicator = document.querySelector('.loading-indicator');
            
            if (chartElements.length > 0 && !loadingIndicator) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 500);
          
          // Fallback timeout after 20 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
          }, 20000);
        });
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

  const { symbol, interval } = req.body;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    // Only process one chart at a time to reduce server load
    const url = `https://adhi1.btc.cfd/chart?symbol=${symbol}&interval=${interval}`;

    const screenshotUrl = await generateScreenshot(url, symbol, interval);
    

    
    res.json({ chartUrl: screenshotUrl });
  } catch (error) {
    console.error('Error generating charts:', error);
    res.status(500).json({ 
      error: 'Failed to generate charts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 