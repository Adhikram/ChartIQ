# ChartIQ Technical Analysis Service

This service provides automated technical analysis of cryptocurrency charts using GPT-4 Vision with an interactive TradingView integration.

<div align="center">
  <h2>🎬 Interactive ChartIQ Demo</h2>

  <a href="https://drive.google.com/file/d/1GyEUt4m1pCgMxJFa3uC6vN2TOc5LcpcH/view?usp=sharing" target="_blank">
    <img width="800" src="https://img.shields.io/badge/▶️_Click_to_Watch_Demo_Video-4285F4?style=for-the-badge&logo=google-drive&logoColor=white&labelColor=101010" alt="Watch ChartIQ Demo Video">
  </a>
</div>

## Features

- Screenshot generation for multiple timeframes (1h, 4h, 1d)
- GPT-4 Vision powered technical analysis
- Database tracking of analysis history
- Support for both web and Telegram interfaces
- Real-time status updates
- Error handling and recovery
- Interactive TradingView chart integration
- Symbol search with auto-complete
- Real-time symbol synchronization across UI
- Tabbed interface with Dashboard and Analysis Chat
- Responsive design with persistent chat history

## Demo

The demo video above showcases the key features of ChartIQ:
- Real-time chart interaction and analysis
- Symbol search functionality
- AI-powered technical analysis generation
- History tracking and review capabilities

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables by copying `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Update the following variables in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXT_PUBLIC_BASE_URL`: Your application's base URL
- `OPENAI_API_KEY`: Your OpenAI API key

4. Initialize the database:
```bash
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

## UI Components

### ChartIQ Dashboard

The main dashboard provides an interactive TradingView chart with:
- Symbol search with auto-complete suggestions
- Chart analysis with multiple technical indicators
- One-click analysis generation
- Synchronized symbol display across the application

### Analysis Chat

The Analysis Chat tab provides:
- Conversation interface for technical analysis
- Markdown rendering of analysis results
- Display of technical chart images
- History of previous analyses
- Real-time streaming updates during analysis generation

## API Usage

### Generate Analysis

```bash
curl "http://localhost:3000/api/generate?symbol=BTCUSD&userId=user123"
```

Response format:
```json
{
  "id": "analysis_id",
  "status": "COMPLETED",
  "chartUrls": [
    "http://localhost:3000/screenshots/screenshot_BTCUSD_1hr_timestamp.png",
    "http://localhost:3000/screenshots/screenshot_BTCUSD_4hr_timestamp.png",
    "http://localhost:3000/screenshots/screenshot_BTCUSD_1d_timestamp.png"
  ],
  "analysis": "Technical analysis text from GPT-4..."
}
```

### Analyze Charts

```bash
curl -X POST "http://localhost:3000/api/analyze-charts" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BINANCE:BTCUSDT","chartUrls":["url1","url2"],"userId":"user123"}'
```

Response is streamed in Server-Sent Events format with real-time updates.

## Error Handling

The service includes comprehensive error handling for:
- Failed screenshot generation
- API failures
- Database errors
- Invalid requests
- TradingView integration issues

All errors are logged and stored in the database for tracking.

## Database Schema

The service uses PostgreSQL with the following main tables:
- `Analysis`: Tracks analysis requests and their status
- `ChartImage`: Stores generated chart images and their metadata
- `Message`: Stores the conversation history and analysis results

## Symbol Support

The application supports various symbol formats:
- Cryptocurrency pairs (e.g., BINANCE:BTCUSDT)
- Stock tickers (e.g., NASDAQ:AAPL)
- Forex pairs
- Commodity futures

## Technologies Used

- React with TypeScript
- Material UI for component styling
- TradingView Charting Library
- Server-Side Events (SSE) for real-time updates
- OpenAI GPT-4 Vision API
- PostgreSQL database
- Next.js API routes

## Next Steps

1. Add Telegram bot integration
2. Add user authentication and profile management
3. Implement trade recommendation generation
4. Add portfolio tracking and performance analysis
5. Create mobile-responsive design
6. Implement social sharing features
7. Add custom indicator support
8. Enable saving and sharing of chart configurations
9. Implement alert systems for price movements 