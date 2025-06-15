const { query } = require('./database');

async function checkProducts() {
  try {
    console.log('Checking products in database...\n');
    
    // Get all products
    const result = await query('SELECT * FROM products ORDER BY sport, category, price');
    
    if (result.rows.length === 0) {
      console.log('No products found in the database.');
      return;
    }
    
    console.log(`Found ${result.rows.length} products:\n`);
    
    const productsBySport = {};
    result.rows.forEach(product => {
      if (!productsBySport[product.sport]) {
        productsBySport[product.sport] = [];
      }
      productsBySport[product.sport].push(product);
    });
    
    Object.keys(productsBySport).forEach(sport => {
      console.log(`${sport.toUpperCase()}:`);
      productsBySport[sport].forEach(product => {
        console.log(`  - ${product.name} (${product.category}) - $${product.price} - Stock: ${product.inventory_count}`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking products:', error);
  }
}

checkProducts();
