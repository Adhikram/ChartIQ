import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Helper function to remove HTML tags from strings
const stripHtmlTags = (str: string): string => {
  return str.replace(/<\/?[^>]+(>|$)/g, '');
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { text, filter } = req.query;

  if (!text || Array.isArray(text)) {
    return res.status(400).json({ error: 'Text parameter is required and must be a string' });
  }

  // Handle exchange prefix if provided (format: EXCHANGE:SYMBOL)
  const splittedSearch = text.toUpperCase().replace(/ /g, '+').split(':');
  const exchange = splittedSearch.length === 2 ? splittedSearch[0] : undefined;
  const searchText = splittedSearch.pop() as string;

  try {
    const response = await axios.get(
      'https://symbol-search.tradingview.com/symbol_search/v3/',
      {
        params: {
          text: searchText,
          exchange: exchange,
          hl: 1,
          lang: 'en',
          search_type: filter || undefined,
          domain: 'production',
          sort_by_country: 'US',
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://www.tradingview.com',
          'Referer': 'https://www.tradingview.com/'
        }
      }
    );

    // Transform data to more usable format
    const symbols = response.data.symbols?.map((s: any) => {
      // Clean up symbol and exchange before generating id
      const cleanSymbol = stripHtmlTags(s.symbol);
      const cleanExchange = stripHtmlTags(s.exchange);
      const exchangeCode = cleanExchange.split(' ')[0];
      
      // Generate a clean ID without any HTML tags
      let id;
      if (s.prefix) {
        const cleanPrefix = stripHtmlTags(s.prefix);
        id = `${cleanPrefix}:${cleanSymbol}`;
      } else {
        id = `${exchangeCode.toUpperCase()}:${cleanSymbol}`;
      }
      
      // Store original description for highlighting
      const originalDescription = s.description;
      
      return {
        id,
        symbol: cleanSymbol,
        exchange: exchangeCode,
        fullExchange: cleanExchange,
        // Keep description with <em> tags for highlighting
        description: originalDescription,
        type: s.type,
        currency_code: s.currency_code,
        // Additional fields
        country: s.country,
        pro: s.pro,
        typespecs: s.typespecs
      };
    }) || [];

    res.status(200).json({
      symbols,
      symbols_remaining: response.data.symbols_remaining || 0
    });
  } catch (error) {
    console.error('Error fetching symbols from TradingView:', error);
    res.status(500).json({ 
      error: 'Failed to fetch symbols',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 