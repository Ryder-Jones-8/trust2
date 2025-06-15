const fetch = require('node-fetch');

// Test adding a snowboard product with the correct lowercase category
async function testAddSnowboard() {
  try {
    console.log('=== TESTING SNOWBOARD PRODUCT CREATION ===');
    
    // First login to get token
    const loginResponse = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@waveriders.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Add a snowboard product
    const productData = {
      name: 'Test Snowboard Fixed Categories',
      brand: 'TestBrand',
      category: 'snowboards', // lowercase
      sport: 'ski',
      price: 459.99,
      quantity: 5,
      description: 'Test snowboard with fixed category naming',
      features: ['All-mountain', 'Medium flex', 'Fixed categories'],
      specifications: {
        lengthRange: { min: 148, max: 158, unit: 'cm' },
        experienceLevel: ['Intermediate', 'Advanced'],
        ridingStyleOptions: ['All-Mountain', 'Freestyle']
      }
    };
    
    console.log('📤 Adding snowboard product...');
    const addResponse = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    if (addResponse.ok) {
      const newProduct = await addResponse.json();
      console.log('✅ Snowboard product added successfully!');
      console.log('Product ID:', newProduct.id);
      console.log('Name:', newProduct.name);
      console.log('Category:', newProduct.category);
      console.log('Sport:', newProduct.sport);
      
      // Test getting recommendations for this snowboard
      console.log('\n📊 Testing recommendations...');
      const recResponse = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: 'ski',
          category: 'snowboards',
          formData: {
            height: "5'10\"",
            weight: '170 lbs',
            experience: 'Intermediate',
            ridingStyle: 'All-mountain'
          }
        })
      });
      
      if (recResponse.ok) {
        const recommendations = await recResponse.json();
        const ourProduct = recommendations.find(r => r.id === newProduct.id);
        
        console.log(`✅ Found ${recommendations.length} snowboard recommendations`);
        if (ourProduct) {
          console.log('✅ Our new product appears in recommendations!');
          console.log(`   - Score: ${ourProduct.score}%`);
          console.log(`   - Reasons: ${ourProduct.matchReasons.join(', ')}`);
        } else {
          console.log('⚠️  Our new product not found in recommendations');
        }
      } else {
        console.log('❌ Recommendations failed:', recResponse.status);
      }
      
    } else {
      const errorData = await addResponse.text();
      console.log('❌ Failed to add product:', addResponse.status);
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testAddSnowboard();
