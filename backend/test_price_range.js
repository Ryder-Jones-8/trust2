const axios = require('axios');

async function testPriceRangeRecommendations() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing Price Range Functionality...\n');
    // Test 1: No price preference
  console.log('TEST 1: No price preference');
  try {
    const response1 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'surf',
      category: 'wetsuits',
      formData: {
        experienceLevel: 'intermediate',
        boardType: 'all-around',
        priceRange: 'No preference'
      }
    });
    
    console.log(`Found ${response1.data.length} products without price filter`);
    if (response1.data.length > 0) {
      const product = response1.data[0];
      console.log(`Sample product: ${product.name} - $${product.price}`);
      console.log(`Match reasons: ${product.matchReasons.join(', ')}`);
      console.log(`Score: ${product.score}%`);
    }
  } catch (error) {
    console.error('Error in test 1:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
    // Test 2: Specific price range
  console.log('TEST 2: Price range $200 - $400');
  try {
    const response2 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experienceLevel: 'intermediate',
        boardType: 'all-around',
        priceRange: '$200 - $400'
      }
    });
    
    console.log(`Found ${response2.data.length} products with $200-$400 filter`);
    response2.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
      console.log(`   Match reasons: ${product.matchReasons.join(', ')}`);
      console.log(`   Score: ${product.score}%`);
      
      // Verify price is in range
      const inRange = product.price >= 200 && product.price <= 400;
      console.log(`   Price in range: ${inRange ? '✓' : '✗'}`);
      
      // Check if price match reason is included
      const hasPriceReason = product.matchReasons.some(reason => 
        reason.toLowerCase().includes('price') || reason.toLowerCase().includes('range')
      );
      console.log(`   Has price match reason: ${hasPriceReason ? '✓' : '✗'}`);
    });
  } catch (error) {
    console.error('Error in test 2:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
    // Test 3: High-end price range
  console.log('TEST 3: Price range $800+');
  try {
    const response3 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experienceLevel: 'advanced',
        skillLevel: 'expert',
        priceRange: '$800+'
      }
    });
    
    console.log(`Found ${response3.data.length} products with $800+ filter`);
    response3.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
      console.log(`   Match reasons: ${product.matchReasons.join(', ')}`);
      console.log(`   Score: ${product.score}%`);
      
      // Verify price is in range
      const inRange = product.price >= 800;
      console.log(`   Price in range: ${inRange ? '✓' : '✗'}`);
      
      // Check if price match reason is included
      const hasPriceReason = product.matchReasons.some(reason => 
        reason.toLowerCase().includes('price') || reason.toLowerCase().includes('range')
      );
      console.log(`   Has price match reason: ${hasPriceReason ? '✓' : '✗'}`);
    });
  } catch (error) {
    console.error('Error in test 3:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
    // Test 4: Low-end price range
  console.log('TEST 4: Price range Under $100');
  try {
    const response4 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'skate',
      category: 'decks',
      formData: {
        experienceLevel: 'beginner',
        priceRange: 'Under $100'
      }
    });
    
    console.log(`Found ${response4.data.length} products with Under $100 filter`);
    response4.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - $${product.price}`);
      console.log(`   Match reasons: ${product.matchReasons.join(', ')}`);
      console.log(`   Score: ${product.score}%`);
      
      // Verify price is in range
      const inRange = product.price <= 100;
      console.log(`   Price in range: ${inRange ? '✓' : '✗'}`);
      
      // Check if price match reason is included
      const hasPriceReason = product.matchReasons.some(reason => 
        reason.toLowerCase().includes('price') || reason.toLowerCase().includes('range')
      );
      console.log(`   Has price match reason: ${hasPriceReason ? '✓' : '✗'}`);
    });
  } catch (error) {
    console.error('Error in test 4:', error.message);
  }
}

testPriceRangeRecommendations().then(() => {
  console.log('\nPrice range testing completed!');
}).catch(console.error);
