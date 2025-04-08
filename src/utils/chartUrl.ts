/**
 * Generate a URL for the chart page with the given symbol and interval.
 * 
 * @param symbol - Trading symbol in format EXCHANGE:SYMBOL (e.g., NASDAQ:AAPL)
 * @param interval - Chart interval (e.g., D, W, M, 60, 15)
 * @returns The URL for the chart page
 */
export function generateChartUrl(symbol: string, interval: string = 'D'): string {
  // Format the symbol properly (handle case where exchange prefix is missing)
  let formattedSymbol = symbol.trim();
  
  // Make sure the interval is valid
  const validIntervals = ['1', '3', '5', '15', '30', '60', '120', '240', 'D', 'W', 'M'];
  const formattedInterval = validIntervals.includes(interval) ? interval : 'D';
  
  // Create the URL with encoded parameters
  return `/chart?symbol=${encodeURIComponent(formattedSymbol)}&interval=${encodeURIComponent(formattedInterval)}`;
}

/**
 * Open the chart in a new tab/window.
 * 
 * @param symbol - Trading symbol in format EXCHANGE:SYMBOL (e.g., NASDAQ:AAPL)
 * @param interval - Chart interval (e.g., D, W, M, 60, 15)
 */
export function openChartInNewTab(symbol: string, interval: string = 'D'): void {
  if (typeof window !== 'undefined') {
    window.open(generateChartUrl(symbol, interval), '_blank');
  }
}

/**
 * Navigate to the chart in the current tab/window.
 * 
 * @param symbol - Trading symbol in format EXCHANGE:SYMBOL (e.g., NASDAQ:AAPL)
 * @param interval - Chart interval (e.g., D, W, M, 60, 15)
 * @param router - Next.js router instance
 */
export function navigateToChart(symbol: string, interval: string = 'D', router: any): void {
  router.push(generateChartUrl(symbol, interval));
} 