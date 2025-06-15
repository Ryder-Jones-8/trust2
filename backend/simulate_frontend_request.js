const fetch = require('node-fetch');

async function simulateFrontendRequest() {
  console.log('🧪 === SIMULATING FRONTEND INVENTORY REQUEST ===');
  
  try {
    // Step 1: Login (like frontend does)
    console.log('🔐 Step 1: Login to get auth token...');
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
    console.log('✅ Login successful');
    console.log('🔑 Token received:', loginData.token.substring(0, 20) + '...');
    
    // Step 2: Wait a moment (like a user navigating)
    console.log('⏳ Waiting 1 second (simulating user navigation)...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Request products with auth token (like ProductList.tsx does)
    console.log('📦 Step 2: Requesting products with auth token...');
    const productsResponse = await fetch('http://localhost:3001/api/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Response Status:', productsResponse.status);
    console.log('📊 Response Headers:', Object.fromEntries(productsResponse.headers.entries()));
    
    if (productsResponse.ok) {
      const products = await productsResponse.json();
      console.log('✅ SUCCESS! Products received:', products.length);
      
      // Show first few products
      products.slice(0, 3).forEach((product, index) => {
        console.log(`📦 Product ${index + 1}:`, {
          id: product.id.substring(0, 8) + '...',
          name: product.name,
          category: product.category,
          sport: product.sport,
          price: product.price,
          quantity: product.quantity
        });
      });
    } else {
      const errorText = await productsResponse.text();
      console.error('❌ FAILED! Response:', errorText);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('🔍 This is the same error frontend would show');
  }
}

simulateFrontendRequest();
