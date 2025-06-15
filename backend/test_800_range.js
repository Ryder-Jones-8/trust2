const axios = require('axios');

async function testSpecificPriceRange() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing $800+ Price Range...\n');
  
  try {
    const response = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experienceLevel: 'advanced',
        skillLevel: 'expert',
        priceRange: '$800+'
      }
    });
    
    console.log(`Found ${response.data.length} products`);
    console.log('Products returned:', response.data.map(p => `${p.name} - $${p.price}`));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSpecificPriceRange();
