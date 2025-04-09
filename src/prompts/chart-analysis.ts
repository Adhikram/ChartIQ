/**
 * Chart analysis prompt for OpenAI image analysis
 */
export const getChartAnalysisPrompt = (symbol?: string): string => {
  return `Please analyze these charts for ${symbol || 'the asset'} and provide technical analysis. The chart is in 1d timeframes.

Your response MUST follow this specific format:
# ${symbol || 'Asset'}

## Daily Timeframe
- **Trend:** [current trend]
- **Key Levels:** [support/resistance levels]
- **Action:** [recommendation]

### Summary
[brief summary and overall recommendation]`;
}; 
export const getChartActualAnalysisPrompt = (symbol?: string): string => {
  return `Please analyze these charts for ${symbol || 'the asset'} and provide technical analysis. The charts are in 1h, 4h, and 1d timeframes.

Format your entire response using Markdown syntax only. Do not use any HTML tags (like <span>).

Your response MUST follow this specific format:
# ${symbol || 'Asset'}

## 1-Hour Timeframe
### Price
- **Trend:** [current trend]
- **Key Levels:** [support/resistance levels]
- **Action:** [recommendation]

### Volume
- **Analysis:** [volume analysis]

## 4-Hour Timeframe
### Price
- **Trend:** [current trend]
- **Key Levels:** [support/resistance levels]
- **Action:** [recommendation]

### Volume
- **Analysis:** [volume analysis]

## Daily Timeframe
### Price
- **Trend:** [current trend]
- **Key Levels:** [support/resistance levels]
- **Action:** [recommendation]

### Volume
- **Analysis:** [volume analysis]

### Summary
[brief summary and overall recommendation]`;
}; 