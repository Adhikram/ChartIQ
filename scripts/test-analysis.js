const axios = require('axios');

async function testAnalysis() {
  try {
    console.log('Testing chart analysis...');
    
    const response = await axios.get('http://localhost:3000/api/generate', {
      params: {
        symbol: 'BTCUSD',
        userId: 'test-user'
      }
    });

    console.log('Analysis completed successfully:');
    console.log('Analysis ID:', response.data.id);
    console.log('Status:', response.data.status);
    console.log('Chart URLs:', response.data.chartUrls);
    console.log('\nAnalysis Result:');
    console.log(response.data.analysis);
  } catch (error) {
    console.error('Error testing analysis:', error.response?.data || error.message);
  }
}

testAnalysis(); 