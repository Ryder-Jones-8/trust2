const { query } = require('./database.js');

async function checkShops() {
  try {
    console.log('=== CHECKING AVAILABLE SHOPS ===');
    const result = await query('SELECT id, name, email FROM shops');
    
    if (result.rows.length === 0) {
      console.log('No shops found in database');
      
      // Let's create a test shop
      console.log('\n=== CREATING TEST SHOP ===');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const insertResult = await query(
        'INSERT INTO shops (name, email, password_hash, location) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Test Surf Shop', 'test@surfshop.com', hashedPassword, 'Test Location']
      );
      
      console.log('✅ Test shop created:', insertResult.rows[0]);
      
    } else {
      console.log(`Found ${result.rows.length} shops:`);
      result.rows.forEach((shop, index) => {
        console.log(`${index + 1}. ${shop.name} (${shop.email}) - ID: ${shop.id}`);
      });
    }
    
  } catch (error) {
    console.error('Database error:', error);
  }
}

checkShops();
