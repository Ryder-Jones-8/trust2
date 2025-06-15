const axios = require('axios');

async function debugProductData() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Debugging Product Data Structure...\n');
  
  try {
    const response = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experience: 'Beginner',
        ridingStyle: 'All-mountain',
        priceRange: '$200 - $400'
      }
    });
    
    console.log(`Found ${response.data.length} products`);
    
    if (response.data.length > 0) {
      const product = response.data[0];
      console.log('\nFirst Product Structure:');
      console.log('Name:', product.name);
      console.log('Price:', product.price);
      console.log('Description:', product.description);
      console.log('Specifications:', JSON.stringify(product.specifications, null, 2));
      console.log('Features:', product.features);
      console.log('Brand:', product.brand);
      console.log('Match Reasons:', product.matchReasons);
      console.log('Score:', product.score);
      
      console.log('\nFull Product Object:');
      console.log(JSON.stringify(product, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

debugProductData();
