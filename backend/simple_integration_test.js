// Simple test without axios
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPI() {
  console.log('=== TESTING UPDATED API INTEGRATION ===\n');
  
  try {
    // Test login
    console.log('1. Testing login...');
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'admin@waveriders.com',
      password: 'password'
    });
    
    if (loginResult.status === 200) {
      console.log('✅ Login successful');
      const token = loginResult.data.token;
      
      // Test shop settings
      console.log('\n2. Testing shop settings...');
      const settingsResult = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/shop/settings',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (settingsResult.status === 200) {
        console.log('✅ Shop settings retrieved');
        console.log('   Shop:', settingsResult.data.name);
      } else {
        console.log('❌ Shop settings failed:', settingsResult.status);
      }
      
      // Test products
      console.log('\n3. Testing products API...');
      const productsResult = await makeRequest({
        hostname: 'localhost',
        port: 3001,
        path: '/api/products',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (productsResult.status === 200) {
        console.log('✅ Products retrieved');
        console.log('   Count:', productsResult.data.length);
      } else {
        console.log('❌ Products failed:', productsResult.status);
      }
      
    } else {
      console.log('❌ Login failed:', loginResult.status, loginResult.data);
    }
    
    console.log('\n🎉 API Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
