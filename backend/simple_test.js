// Simple test to check server connection and products
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

const testServer = async () => {
  try {
    console.log('Testing server connection...');
    
    // First, test basic server health
    const healthResponse = await makeRequest('/api/products');
    console.log('Health check status:', healthResponse.status);
      
    if (healthResponse.status === 200) {
      const allProducts = healthResponse.data;
      console.log('\n=== ALL PRODUCTS FROM SERVER ===');
      console.log('Total products:', allProducts.length);
      
      // Filter for snowboards
      const snowboards = allProducts.filter(p => 
        p.sport === 'ski' && p.category === 'snowboards'
      );
      
      console.log('\n=== SNOWBOARD PRODUCTS ===');
      console.log('Found', snowboards.length, 'snowboard(s):');
      snowboards.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log('   - ID:', product.id);
        console.log('   - Sport:', product.sport);
        console.log('   - Category:', product.category);
        console.log('   - Price: $' + product.price);
        console.log('   - In Stock:', product.inStock);
        console.log('   - Quantity:', product.quantity);
        console.log('   - Features:', product.features.join(', '));
      });
      
      // Now test recommendations API
      if (snowboards.length > 0) {
        console.log('\n=== TESTING RECOMMENDATIONS API ===');
        
        const recResponse = await makeRequest('/api/recommendations', 'POST', {
          sport: 'ski',
          category: 'snowboards',
          formData: {
            height: "5'10\"",
            weight: '170 lbs',
            experience: 'Intermediate',
            ridingStyle: 'All-mountain'
          }
        });
        
        console.log('Recommendations API status:', recResponse.status);
        
        if (recResponse.status === 200) {
          const recommendations = recResponse.data;
          console.log('Recommendations returned:', recommendations.length);
          
          recommendations.forEach((rec, index) => {
            console.log(`\n${index + 1}. ${rec.name} (Score: ${rec.score}%)`);
            console.log('   Match reasons:', rec.matchReasons?.join(', ') || 'None');
          });
        } else {
          console.log('Recommendations API error:', recResponse.data);
        }
      }
    } else {
      console.log('Server health check failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testServer();
