const fs = require('fs');

// Test the current products in memory
console.log('=== TESTING SNOWBOARD RECOMMENDATIONS ===');

// Simulate a request to get snowboard recommendations
const testSnowboardRecommendations = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport: 'ski',
        category: 'snowboards',
        formData: {
          height: "5'10\"",
          weight: '170 lbs',
          experience: 'Intermediate',
          ridingStyle: 'All-mountain'
        }
      })
    });

    if (response.ok) {
      const recommendations = await response.json();
      console.log('\n✅ Snowboard Recommendations Found:');
      console.log('Total recommendations:', recommendations.length);
      recommendations.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   - Sport: ${product.sport}`);
        console.log(`   - Category: ${product.category}`);
        console.log(`   - Price: $${product.price}`);
        console.log(`   - Score: ${product.score}%`);
        console.log(`   - In Stock: ${product.inStock} (Qty: ${product.quantity})`);
        console.log(`   - Match Reasons: ${product.matchReasons?.join(', ') || 'None provided'}`);
      });
    } else {
      console.log('❌ Error getting recommendations:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

// Test with different category variations
const testCategoryVariations = async () => {
  console.log('\n=== TESTING CATEGORY VARIATIONS ===');
  
  const testCases = [
    { sport: 'ski', category: 'snowboards' },
    { sport: 'skiing', category: 'snowboards' },
    { sport: 'ski', category: 'snowboard' },
    { sport: 'ski', category: 'Snowboards' }
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting: sport="${testCase.sport}", category="${testCase.category}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testCase,
          formData: {
            height: "5'10\"",
            weight: '170 lbs',
            experience: 'Intermediate'
          }
        })
      });

      if (response.ok) {
        const recommendations = await response.json();
        console.log(`   ✅ Found ${recommendations.length} recommendations`);
      } else {
        console.log(`   ❌ Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
  }
};

// Run tests
(async () => {
  await testSnowboardRecommendations();
  await testCategoryVariations();
})();
