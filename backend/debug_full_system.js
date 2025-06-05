#!/usr/bin/env node

const { spawn } = require('child_process');
const fetch = require('node-fetch');

// Function to test if server is running
async function testServerHealth() {
  try {
    console.log('🔍 Testing server health...');
    const response = await fetch('http://localhost:3001/api/health');
    const data = await response.json();
    console.log('✅ Server is healthy:', data);
    return true;
  } catch (error) {
    console.log('❌ Server not reachable:', error.message);
    return false;
  }
}

// Function to start the server
function startServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting backend server...');
    
    const serverProcess = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'inherit'
    });

    // Give server time to start
    setTimeout(() => {
      resolve(serverProcess);
    }, 3000);

    serverProcess.on('error', (error) => {
      console.error('❌ Failed to start server:', error);
      reject(error);
    });
  });
}

// Function to test login and get token
async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@waveriders.com',
        password: 'password'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful for shop:', data.shop.name);
      return data.token;
    } else {
      console.log('❌ Login failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

// Function to test snowboard recommendations
async function testSnowboardRecommendations() {
  try {
    console.log('🎿 Testing snowboard recommendations...');
    
    const requestData = {
      sport: 'ski',
      category: 'snowboards',
      formData: {
        height: '5.8',
        weight: '165',
        experienceLevel: 'intermediate',
        ridingStyle: 'all-mountain'
      },
      shopId: '1'
    };

    console.log('📤 Sending recommendation request:', JSON.stringify(requestData, null, 2));

    const response = await fetch('http://localhost:3001/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (response.ok) {
      const recommendations = await response.json();
      console.log('✅ Snowboard recommendations received:');
      console.log('📊 Number of recommendations:', recommendations.length);
      
      recommendations.forEach((rec, index) => {
        console.log(`\n🎿 Recommendation #${index + 1}:`);
        console.log('  - Name:', rec.name);
        console.log('  - Brand:', rec.brand);
        console.log('  - Price: $' + rec.price);
        console.log('  - Score:', rec.score);
        console.log('  - Reasons:', rec.reasons.join(', '));
      });

      if (recommendations.length === 0) {
        console.log('⚠️  No recommendations found - this might be the issue!');
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Recommendations failed:', response.status, errorData);
    }
  } catch (error) {
    console.error('❌ Recommendations error:', error);
  }
}

// Function to test add product
async function testAddProduct(token) {
  try {
    console.log('➕ Testing add product...');
    
    const productData = {
      name: 'Test Snowboard Debug',
      brand: 'TestBrand',
      category: 'snowboards',
      sport: 'ski',
      price: 399.99,
      quantity: 3,
      description: 'Test snowboard for debugging network issues',
      features: ['All-mountain', 'Medium flex', 'Test product']
    };

    console.log('📤 Sending product data:', JSON.stringify(productData, null, 2));

    const response = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (response.ok) {
      const newProduct = await response.json();
      console.log('✅ Product added successfully!');
      console.log('📦 Product ID:', newProduct.id);
      console.log('📦 Product Name:', newProduct.name);
      return newProduct.id;
    } else {
      const errorData = await response.text();
      console.log('❌ Add product failed:', response.status, errorData);
      return null;
    }
  } catch (error) {
    console.error('❌ Add product error:', error);
    return null;
  }
}

// Main test function
async function runFullTest() {
  console.log('🧪 === TRUST BACKEND DEBUG TEST ===\n');
  
  // Step 1: Check if server is already running
  const isServerRunning = await testServerHealth();
  
  let serverProcess = null;
  if (!isServerRunning) {
    console.log('\n📡 Server not running. Starting server...');
    try {
      serverProcess = await startServer();
      console.log('⏳ Waiting for server to be ready...');
      
      // Wait for server to be ready
      let retries = 10;
      while (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (await testServerHealth()) {
          break;
        }
        retries--;
      }
      
      if (retries === 0) {
        console.log('❌ Server failed to start properly');
        return;
      }
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      return;
    }
  }

  console.log('\n🔐 === AUTHENTICATION TEST ===');
  const token = await testLogin();
  
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    if (serverProcess) serverProcess.kill();
    return;
  }

  console.log('\n➕ === ADD PRODUCT TEST ===');
  const productId = await testAddProduct(token);

  console.log('\n🎿 === SNOWBOARD RECOMMENDATIONS TEST ===');
  await testSnowboardRecommendations();

  console.log('\n✅ === TEST COMPLETE ===');
  
  if (serverProcess) {
    console.log('🛑 Stopping test server...');
    serverProcess.kill();
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

// Run the test
runFullTest().catch(console.error);
