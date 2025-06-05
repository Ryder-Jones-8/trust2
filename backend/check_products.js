const fs = require('fs');
const path = require('path');

// Check if products.json exists and what products are stored
const productsPath = path.join(__dirname, 'products.json');
if (fs.existsSync(productsPath)) {
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  console.log('=== ALL PRODUCTS IN DATABASE ===');
  console.log('Total products:', products.length);
  
  // Filter for snowboards specifically
  const snowboards = products.filter(p => 
    p.sport?.toLowerCase() === 'skiing' || 
    p.category?.toLowerCase().includes('snowboard') ||
    p.name?.toLowerCase().includes('snowboard')
  );
  
  console.log('\n=== SNOWBOARD PRODUCTS ===');
  console.log('Found', snowboards.length, 'snowboard(s):');
  snowboards.forEach((product, index) => {
    console.log(`\nSnowboard #${index + 1}:`);
    console.log('- ID:', product.id);
    console.log('- Name:', product.name);
    console.log('- Sport:', product.sport);
    console.log('- Category:', product.category);
    console.log('- Length:', product.length);
    console.log('- Width:', product.width);
    console.log('- Skill Level:', product.skillLevel);
    console.log('- Price:', product.price);
    console.log('- Stock:', product.stock || product.quantity);
  });
  
  if (snowboards.length === 0) {
    console.log('No snowboards found. Let me check all products:');
    products.forEach((product, index) => {
      console.log(`Product #${index + 1}: ${product.name} (Sport: ${product.sport}, Category: ${product.category})`);
    });
  }
} else {
  console.log('products.json file not found');
}
