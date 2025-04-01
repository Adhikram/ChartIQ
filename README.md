# ChartIQ Technical Analysis Service

This service provides automated technical analysis of cryptocurrency charts using GPT-4 Vision.

## Features

- Screenshot generation for multiple timeframes (1h, 4h, 1d)
- GPT-4 Vision powered technical analysis
- Database tracking of analysis history
- Support for both web and Telegram interfaces
- Real-time status updates
- Error handling and recovery

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

## Error Handling

The service includes comprehensive error handling for:
- Failed screenshot generation
- API failures
- Database errors
- Invalid requests

All errors are logged and stored in the database for tracking.

## Database Schema

The service uses PostgreSQL with the following main tables:
- `Analysis`: Tracks analysis requests and their status
- `ChartImage`: Stores generated chart images and their metadata
- `Message`: Stores the conversation history and analysis results

## Next Steps

1. Integrate TradingView widget for chart display
2. Add Telegram bot integration
3. Implement real-time progress updates
4. Add user authentication
5. Optimize image storage and delivery 