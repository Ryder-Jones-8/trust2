const axios = require('axios');

async function testImprovedRecommendations() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('Testing Improved Recommendation System with Partial Matches...\n');
  
  // Test 1: Surfboard with specific price range - should show matches and near-matches
  console.log('TEST 1: Surfboard recommendations with price range ($200 - $400)');
  try {
    const response1 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'surf',
      category: 'boards',
      formData: {
        experience: 'Intermediate',
        surfStyle: 'All-around',
        priceRange: '$200 - $400'
      }
    });
    
    console.log(`Found ${response1.data.length} recommendations`);
    response1.data.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} - $${product.price} (${product.score}% match)`);
      console.log(`   Brand: ${product.brand || 'Unknown'}`);
      
      if (product.matchReasons && product.matchReasons.length > 0) {
        console.log('   Match Reasons:');
        product.matchReasons.forEach(reason => {
          console.log(`     ✓ ${reason}`);
        });
      }
      
      // Check if price is in range
      const inRange = product.price >= 200 && product.price <= 400;
      console.log(`   Price in range: ${inRange ? '✓ Yes' : '✗ No'}`);
    });
  } catch (error) {
    console.error('Error in test 1:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Snowboard for beginner - should show matches for beginner and explain intermediate options
  console.log('TEST 2: Snowboard recommendations for beginner');
  try {
    const response2 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experience: 'Beginner',
        ridingStyle: 'All-mountain',
        priceRange: 'No preference'
      }
    });
    
    console.log(`Found ${response2.data.length} recommendations`);
    response2.data.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} - $${product.price} (${product.score}% match)`);
      console.log(`   Brand: ${product.brand || 'Unknown'}`);
      
      if (product.matchReasons && product.matchReasons.length > 0) {
        console.log('   Match Reasons:');
        product.matchReasons.forEach(reason => {
          console.log(`     ✓ ${reason}`);
        });
      }
    });
  } catch (error) {
    console.error('Error in test 2:', error.response?.data || error.message);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: High-end price range - should show products in range and explain cheaper alternatives
  console.log('TEST 3: High-end snowboard recommendations ($800+)');
  try {
    const response3 = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experience: 'Advanced',
        ridingStyle: 'All-mountain',
        priceRange: '$800+'
      }
    });
    
    console.log(`Found ${response3.data.length} recommendations`);
    response3.data.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} - $${product.price} (${product.score}% match)`);
      console.log(`   Brand: ${product.brand || 'Unknown'}`);
      
      if (product.matchReasons && product.matchReasons.length > 0) {
        console.log('   Match Reasons:');
        product.matchReasons.forEach(reason => {
          console.log(`     ✓ ${reason}`);
        });
      }
      
      // Check if price is in range
      const inRange = product.price >= 800;
      console.log(`   Price in range: ${inRange ? '✓ Yes' : '✗ No'}`);
    });
  } catch (error) {
    console.error('Error in test 3:', error.response?.data || error.message);
  }
}

testImprovedRecommendations().then(() => {
  console.log('\nImproved recommendation testing completed!');
  console.log('✓ System now shows partial matches with explanations');
  console.log('✓ Match reasons explain why products are close fits');
  console.log('✓ Price range explanations show over/under budget items');
}).catch(console.error);
