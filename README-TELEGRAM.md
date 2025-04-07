# Telegram Mini App Integration

This document explains how to integrate your assistant with Telegram using the Telegram Mini Apps platform.

## Setup Steps

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a chat with BotFather and send the command `/newbot`
3. Follow the instructions to create a new bot
4. After creation, BotFather will give you a token for your bot - save this token securely

### 2. Configure your Mini App

1. Talk to BotFather again and send the command `/mybots`
2. Select your bot from the list
3. Click on "Bot Settings" > "Menu Button" > "Configure Menu Button"
4. Set a menu button text (e.g., "Open Assistant")
5. For the URL, use your web app's URL (must be HTTPS)

### 3. Set up your environment

1. Copy `.env.example` to `.env.local`
2. Add your Telegram bot token to the `.env.local` file:
   ```
   REACT_APP_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   ```

### 4. Deploy your application

Deploy your web application to a secure (HTTPS) server. You can use services like:
- Vercel
- Netlify
- GitHub Pages
- Your own server with SSL certificate

### 5. Test your Mini App

1. Open your Telegram bot in the Telegram app
2. Tap the menu button to launch your Mini App

## Implementation Details

This project includes several components for Telegram integration:

- `src/types/WebAppInitData.ts` - TypeScript types for Telegram WebApp data
- `src/utils/telegramParser.ts` - Utility to validate and parse Telegram initialization data
- `src/hooks/useTelegramAuth.ts` - React hook for Telegram authentication
- `src/components/TelegramAuthWrapper.tsx` - Component to handle authentication flow

## Security

The integration includes validation of Telegram data to ensure requests come from Telegram:

1. The `telegramParser.ts` utility verifies the hash signature from Telegram
2. Always validate the data on your backend when handling sensitive operations

## Getting User Identity

When a user launches your Mini App, their Telegram ID is accessible through:

```typescript
// From the useTelegramAuth hook
const { user } = useTelegramAuth({ botToken });
const telegramId = user?.id;

// Or directly in component with TelegramAuthWrapper
<TelegramAuthWrapper botToken={TELEGRAM_BOT_TOKEN}>
  {(userId, firstName) => {
    // Use userId as the unique identifier
    console.log('User ID:', userId);
    // Your component here
  }}
</TelegramAuthWrapper>
```

## Troubleshooting

- If authentication fails, make sure your bot token is correct
- For local development, you may need to use a service like ngrok to provide HTTPS
- Check browser console for detailed error messages
- Ensure the user has started a chat with your bot before using the Mini App

## Additional Resources

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api) 