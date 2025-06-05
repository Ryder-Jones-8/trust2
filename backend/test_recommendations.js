// Test recommendations API directly
const http = require('http');

const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

const testRecommendations = async () => {
  console.log('=== TESTING SNOWBOARD RECOMMENDATIONS ===\n');
  
  try {
    // Test 1: Basic snowboard recommendation request
    console.log('1. Testing basic snowboard recommendations...');
    const basicRequest = {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        height: "5'10\"",
        weight: '170 lbs',
        experience: 'Intermediate',
        ridingStyle: 'All-mountain'
      }
    };
    
    console.log('Request data:', JSON.stringify(basicRequest, null, 2));
    
    const response1 = await makeRequest('/api/recommendations', 'POST', basicRequest);
    console.log('Response status:', response1.status);
    console.log('Response data:', JSON.stringify(response1.data, null, 2));
    
    if (response1.status === 200) {
      console.log(`✅ Found ${response1.data.length} snowboard recommendations`);
      response1.data.forEach((rec, index) => {
        console.log(`\n${index + 1}. ${rec.name}`);
        console.log(`   - Sport: ${rec.sport}, Category: ${rec.category}`);
        console.log(`   - Price: $${rec.price}`);
        console.log(`   - Score: ${rec.score}%`);
        console.log(`   - Stock: ${rec.quantity}`);
        console.log(`   - Match Reasons: ${rec.matchReasons?.join(', ') || 'None'}`);
      });
    } else {
      console.log('❌ Error:', response1.data);
    }
    
    // Test 2: Try different category variations
    console.log('\n\n2. Testing different category variations...');
    const variations = [
      { sport: 'ski', category: 'snowboard' },
      { sport: 'skiing', category: 'snowboards' },
      { sport: 'ski', category: 'Snowboards' },
    ];
    
    for (const variation of variations) {
      console.log(`\nTesting: sport="${variation.sport}", category="${variation.category}"`);
      const response = await makeRequest('/api/recommendations', 'POST', {
        ...variation,
        formData: { experience: 'Intermediate' }
      });
      console.log(`   Status: ${response.status}, Results: ${response.data.length || 0}`);
    }
    
    // Test 3: Check what products exist in the system
    console.log('\n\n3. Let me check what products are available...');
    
    // Since the products endpoint requires auth, let's check through the recommendations
    // by trying all possible sport/category combinations
    const testCombos = [
      { sport: 'surf', category: 'boards' },
      { sport: 'surf', category: 'wetsuits' },
      { sport: 'surf', category: 'fins' },
      { sport: 'ski', category: 'snowboards' },
      { sport: 'ski', category: 'skis' },
      { sport: 'ski', category: 'snowboard boots' },
      { sport: 'ski', category: 'ski boots' },
      { sport: 'ski', category: 'helmets' },
      { sport: 'ski', category: 'goggles' },
      { sport: 'skate', category: 'decks' },
      { sport: 'skate', category: 'trucks' },
      { sport: 'skate', category: 'wheels' }
    ];
    
    for (const combo of testCombos) {
      const response = await makeRequest('/api/recommendations', 'POST', {
        ...combo,
        formData: { experience: 'Intermediate' }
      });
      if (response.status === 200 && response.data.length > 0) {
        console.log(`✅ ${combo.sport}/${combo.category}: ${response.data.length} products`);
        response.data.forEach(p => {
          console.log(`   - ${p.name} (ID: ${p.id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testRecommendations();
