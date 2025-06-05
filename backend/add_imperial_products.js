const axios = require('axios');

async function testAddProducts() {
  console.log('Adding test products...');
  
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      email: 'admin@waveriders.com',
      password: 'password'
    });
    
    console.log('Login status:', loginResponse.status);
    const token = loginResponse.data.token;
    
    const testProduct = {
      name: 'Test Wetsuit Imperial',
      brand: 'TestBrand',
      category: 'wetsuits',
      sport: 'surf',
      price: 199.99,
      description: 'Test wetsuit with imperial specs',
      quantity: 5,
      specifications: {
        heightRange: '5.4-6.0',
        weightRange: '140-180',
        chestSize: '36-42',
        waterTemperature: '65-75'
      }
    };
    
    const response = await axios.post('http://localhost:3001/api/products', testProduct, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Product creation status:', response.status);
    console.log('Product created successfully!');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAddProducts();
