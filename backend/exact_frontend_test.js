// Direct test exactly like the frontend
const http = require('http');

const testData = {
  sport: "ski",
  category: "snowboards", 
  formData: {
    height: "5'10\"",
    weight: "170 lbs",
    experience: "Intermediate",
    ridingStyle: "All-mountain"
  },
  shopId: null
};

console.log('=== TESTING EXACT FRONTEND REQUEST ===');
console.log('Request payload:', JSON.stringify(testData, null, 2));

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/recommendations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('\n=== RESPONSE ===');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(data);
      console.log('\n=== PARSED RESPONSE ===');
      console.log('Recommendations count:', jsonResponse.length);
      
      if (jsonResponse.length > 0) {
        console.log('\n=== SNOWBOARD PRODUCTS FOUND ===');
        jsonResponse.forEach((product, index) => {
          console.log(`\n${index + 1}. ${product.name}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Sport: ${product.sport}`);
          console.log(`   Category: ${product.category}`);
          console.log(`   Price: $${product.price}`);
          console.log(`   Score: ${product.score}%`);
          console.log(`   In Stock: ${product.inStock} (Qty: ${product.quantity})`);
          console.log(`   Features: ${product.features?.join(', ') || 'None'}`);
          console.log(`   Match Reasons: ${product.matchReasons?.join(', ') || 'None'}`);
        });
      } else {
        console.log('\n❌ NO SNOWBOARD RECOMMENDATIONS FOUND!');
        console.log('This suggests an issue with the filtering logic.');
      }
    } catch (error) {
      console.log('\n❌ PARSE ERROR');
      console.log('Raw response:', data);
      console.log('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ REQUEST ERROR:', error);
});

req.write(postData);
req.end();

// Also test with a simple GET to check server is responding
setTimeout(() => {
  console.log('\n\n=== TESTING SERVER HEALTH ===');
  const healthReq = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  }, (res) => {
    console.log('Server health check status:', res.statusCode);
  });
  
  healthReq.on('error', (error) => {
    console.error('Health check error:', error.message);
  });
  
  healthReq.end();
}, 2000);
