/**
 * Custom formatter for technical analysis content
 */
export const formatTechnicalAnalysis = (content: string): string => {
  // Don't attempt to format if content is empty
  if (!content) return content;
  
  // Parse any timeframe headers and add special class
  let formattedContent = content
    // Format ## X-Hour Timeframe or ## Daily Timeframe headers
    .replace(/## ([\w-]+) Timeframe/g, '## <span class="timeframe-header">$1 Timeframe</span>')
    // Format ### Summary sections
    .replace(/### Summary/g, '### <span class="summary-header">Summary</span>')
    // Format Overall Outlook section
    .replace(/### Overall Outlook/g, '### <span class="outlook-header">Overall Outlook</span>')
    // Add classes to technical indicators
    .replace(/\*\*([\w\s-]+):\*\*/g, '**<span class="technical-indicator">$1:</span>**')
    // Enhance lists for better readability
    .replace(/- \*\*([\w\s-]+):\*\*/g, '- **<span class="list-indicator">$1:</span>**');
    
  return formattedContent;
}; 