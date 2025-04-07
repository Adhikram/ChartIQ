/**
 * Represents a Telegram user returned in the WebApp data
 */
export interface TelegramUser {
  id: number | string;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  [key: string]: any;
}

/**
 * Extract and parse Telegram user data from URL
 * @param url - URL that may contain tgWebAppData parameter
 * @returns Telegram user data or null if not found
 */
export function extractTelegramUserFromUrl(url: string): TelegramUser | null {
  try {
    // Handle both query parameters and hash fragments
    const urlObj = new URL(url);
    
    // Check hash fragment first (#tgWebAppData=...)
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    let tgData = hashParams.get('tgWebAppData');
    
    // If not in hash, check query parameters (?tgWebAppData=...)
    if (!tgData) {
      tgData = urlObj.searchParams.get('tgWebAppData');
    }
    
    if (!tgData) return null;
    
    // Decode the data (may be encoded multiple times)
    let decoded = tgData;
    let prevDecoded = '';
    
    // Decode until no more decoding is possible
    while (decoded !== prevDecoded) {
      prevDecoded = decoded;
      try {
        decoded = decodeURIComponent(prevDecoded);
      } catch (e) {
        // If decoding fails, use the last successful decode
        decoded = prevDecoded;
        break;
      }
    }
    
    // Parse the data into parameters
    const params = new URLSearchParams(decoded);
    
    // Extract and parse user data
    const userStr = params.get('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as TelegramUser;
      } catch (e) {
        console.error('Error parsing Telegram user data:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting Telegram data from URL:', error);
    return null;
  }
}

/**
 * Format a Telegram user ID with the telegram- prefix
 * @param userId - Telegram user ID
 * @returns Formatted user ID
 */
export function formatTelegramUserId(userId: string | number): string {
  return `telegram-${userId}`;
} 