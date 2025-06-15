const fetch = require('node-fetch');

async function testInventoryAPI() {
  console.log('🧪 === TESTING INVENTORY API ===');
  
  try {
    // First login to get a token
    console.log('🔐 Logging in to get auth token...');
    const loginResponse = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@waveriders.com',
        password: 'password'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful, token received');
    
    // Now test the products API with the token
    console.log('📦 Testing products API with auth token...');
    const productsResponse = await fetch('http://localhost:3001/api/products', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('📊 Products API Response Status:', productsResponse.status);
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ Products API Success!');
      console.log(`📦 Found ${products.length} products`);
      
      if (products.length > 0) {
        console.log('🔍 Sample product:', {
          id: products[0].id,
          name: products[0].name,
          category: products[0].category,
          sport: products[0].sport,
          price: products[0].price,
          quantity: products[0].quantity
        });
      }
    } else {
      const errorData = await productsResponse.text();
      console.error('❌ Products API failed:', productsResponse.status, errorData);
    }

    // Test without auth token (public endpoint)
    console.log('🌐 Testing products API without auth token...');
    const publicResponse = await fetch('http://localhost:3001/api/products');
    
    console.log('📊 Public Products API Response Status:', publicResponse.status);
    
    if (publicResponse.ok) {
      const publicProducts = await publicResponse.json();
      console.log('✅ Public Products API Success!');
      console.log(`📦 Found ${publicProducts.length} public products`);
    } else {
      const errorData = await publicResponse.text();
      console.error('❌ Public Products API failed:', publicResponse.status, errorData);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testInventoryAPI();
