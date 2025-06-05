// Test script to debug product creation
const testLogin = async () => {
  try {
    console.log('Testing login...');
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
      console.error('Login failed:', loginResponse.status, loginResponse.statusText);
      return null;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData);
    return loginData.token;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

const testAddProduct = async (token) => {
  try {
    console.log('Testing product creation...');
    const productData = {
      name: 'Test Imperial Wetsuit',
      brand: 'TestBrand',
      category: 'Wetsuits',
      sport: 'surf',
      price: 299.99,
      quantity: 5,
      description: 'Test wetsuit with imperial specifications',
      features: ['3/2mm thickness', 'Imperial measurements', 'Test product'],
      specifications: {
        heightRange: { min: 5.0, max: 6.5, unit: 'ft' },
        weightRange: { min: 120, max: 220, unit: 'lbs' },
        chestSizeRange: { min: 32, max: 48, unit: 'in' },
        waterTempRange: { min: 55, max: 75, unit: '°F' },
        thicknessOptions: ['3/2mm', '4/3mm'],
        experienceLevel: ['beginner', 'intermediate']
      }
    };

    console.log('Sending product data:', JSON.stringify(productData, null, 2));

    const response = await fetch('http://localhost:3001/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('Product created successfully!');
      try {
        const data = JSON.parse(responseText);
        console.log('Created product:', data);
      } catch (parseError) {
        console.log('Response was not JSON:', responseText);
      }
    } else {
      console.error('Product creation failed:', response.status, responseText);
    }
  } catch (error) {
    console.error('Product creation error:', error);
  }
};

const runTest = async () => {
  console.log('Starting API test...');
  const token = await testLogin();
  if (token) {
    await testAddProduct(token);
  } else {
    console.error('Cannot test product creation without valid token');
  }
};

// Run the test
runTest();
