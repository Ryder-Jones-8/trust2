const http = require('http');

const postData = JSON.stringify({
  sport: "ski",
  category: "snowboards",
  formData: {
    height: "5'10\"",
    weight: "170 lbs",
    experience: "Intermediate",
    ridingStyle: "All-mountain"
  }
});

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

console.log('Testing snowboard recommendations API...');
console.log('Request data:', postData);

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== RESPONSE ===');
    try {
      const jsonResponse = JSON.parse(data);
      console.log('Recommendations found:', jsonResponse.length);
      
      if (jsonResponse.length > 0) {
        console.log('\n=== SNOWBOARD PRODUCTS ===');
        jsonResponse.forEach((product, index) => {
          console.log(`\n${index + 1}. ${product.name}`);
          console.log(`   Sport: ${product.sport}`);
          console.log(`   Category: ${product.category}`);
          console.log(`   Price: $${product.price}`);
          console.log(`   Score: ${product.score}%`);
          console.log(`   In Stock: ${product.inStock} (Qty: ${product.quantity})`);
          console.log(`   Features: ${product.features?.join(', ') || 'None'}`);
          console.log(`   Match Reasons: ${product.matchReasons?.join(', ') || 'None'}`);
        });
      } else {
        console.log('\n❌ No snowboard recommendations found!');
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();
