const axios = require('axios');

async function demonstratePartialMatches() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('=== DEMONSTRATION: Showing Partial Matches ===\n');
  
  console.log('Scenario: Customer wants snowboards, $800+ budget, all-mountain style, advanced level\n');
  
  try {
    const response = await axios.post(`${baseUrl}/api/recommendations`, {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        experience: 'Advanced',
        ridingStyle: 'All-mountain',
        priceRange: '$800+'
      }
    });
    
    console.log(`✅ Found ${response.data.length} recommendations (including partial matches):\n`);
    
    response.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   💰 Price: $${product.price} ${product.price >= 800 ? '(✓ in budget)' : '(⚠️ under budget)'}`);
      console.log(`   🎯 Match Score: ${product.score}%`);
      console.log(`   📝 Why this item is recommended:`);
      
      product.matchReasons.forEach(reason => {
        console.log(`     ✓ ${reason}`);
      });
      console.log('');
    });
    
    console.log('🎉 Key Improvements:');
    console.log('• Shows products even when not perfect matches');
    console.log('• Explains why cheaper options might still be good choices');
    console.log('• Provides context for experience level mismatches');
    console.log('• Gives detailed reasoning for each recommendation');
    console.log('• Helps customers understand tradeoffs\n');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

demonstratePartialMatches();
