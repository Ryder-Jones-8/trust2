const FormData = require('form-data');
const fetch = require('node-fetch');

async function testFormData() {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@waveriders.com',
        password: 'password'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Create FormData
    const formData = new FormData();
    formData.append('name', 'Test Snowboard FormData');
    formData.append('category', 'snowboards');
    formData.append('sport', 'ski');
    formData.append('price', '399.99');
    formData.append('inventory_count', '5');
    formData.append('description', 'Test product using FormData');
    formData.append('features', JSON.stringify(['All-Mountain', 'Medium Flex']));
    formData.append('specifications', JSON.stringify({}));
    
    console.log('📤 Sending FormData request...');
    
    const response = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Product created successfully!');
      console.log('Product ID:', data.id);
      console.log('Product Name:', data.name);
    } else {
      console.log('❌ Error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFormData();
