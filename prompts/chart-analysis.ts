/**
 * Chart analysis prompt for OpenAI image analysis
 */
export const getChartAnalysisPrompt = (symbol?: string): string => {
  return `Please analyze these charts for ${symbol || 'the asset'} and provide technical analysis. The charts are in 1h, 4h, and 1d timeframes. Format your response in markdown.`;
}; 