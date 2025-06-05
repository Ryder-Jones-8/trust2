// Test script to verify API endpoints and authentication
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing trust. API endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@waveriders.com',
        password: 'password'
      })
    });
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('Shop:', loginData.shop.name);
      
      const token = loginData.token;

      // Test 3: Get products
      console.log('\n3. Testing get products...');
      const productsResponse = await fetch(`${BASE_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        console.log(`✅ Products retrieved: ${products.length} products`);
      } else {
        console.log('❌ Failed to get products:', productsResponse.status);
      }

      // Test 4: Add a test product
      console.log('\n4. Testing add product with imperial specs...');
      const testProduct = {
        name: 'Test Imperial Wetsuit',
        brand: 'TestBrand',
        category: 'wetsuits',
        sport: 'surf',
        price: 299.99,
        quantity: 5,
        description: 'Test wetsuit with imperial specifications',
        features: ['3/2mm thickness', 'Imperial measurements', 'Test product'],
        specifications: {
          heightRange: { min: 5.5, max: 6.2, unit: 'ft' },
          weightRange: { min: 150, max: 200, unit: 'lbs' },
          chestSizeRange: { min: 38, max: 44, unit: 'in' },
          waterTempRange: { min: 60, max: 75, unit: '°F' }
        }
      };

      const addProductResponse = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testProduct)
      });

      const addProductData = await addProductResponse.json();

      if (addProductResponse.ok) {
        console.log('✅ Product added successfully!');
        console.log('Product ID:', addProductData.id);
        console.log('Specifications:', addProductData.specifications);
      } else {
        console.log('❌ Failed to add product:', addProductResponse.status);
        console.log('Error:', addProductData);
      }

    } else {
      console.log('❌ Login failed:', loginData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAPI();
