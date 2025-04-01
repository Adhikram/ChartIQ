import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export interface ChartGenerationResponse {
  chartUrls: string[];
  error?: string;
}

export interface ChartAnalysisResponse {
  analysis: string;
  error?: string;
}

export const generateCharts = async (symbol: string): Promise<ChartGenerationResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/generate-charts`, { symbol });
    return response.data;
  } catch (error) {
    console.error('Error generating charts:', error);
    return {
      chartUrls: [],
      error: 'Failed to generate charts. Please try again later.'
    };
  }
};

export const analyzeCharts = async (chartUrls: string[]): Promise<ChartAnalysisResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze-charts`, { chartUrls });
    return response.data;
  } catch (error) {
    console.error('Error analyzing charts:', error);
    return {
      analysis: '',
      error: 'Failed to analyze charts. Please try again later.'
    };
  }
};

export const saveAnalysis = async (data: {
  symbol: string;
  analysis: string;
  chartUrls: string[];
  userId: string;
}): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/api/save-analysis`, data);
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }
};

export const getAnalysisHistory = async (userId: string): Promise<{
  id: string;
  symbol: string;
  analysis: string;
  chartUrls: string[];
  timestamp: string;
}[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/analysis-history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    return [];
  }
}; 