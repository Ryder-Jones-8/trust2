const { query } = require('./database.js');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    console.log('=== TESTING LOGIN CREDENTIALS ===');
    
    // Get shop info
    const result = await query('SELECT * FROM shops WHERE email = $1', ['admin@waveriders.com']);
    if (result.rows.length === 0) {
      console.log('Shop not found');
      return;
    }
    
    const shop = result.rows[0];
    console.log('Shop found:', shop.name, shop.email);
    console.log('Password hash:', shop.password_hash);
    
    // Try different passwords
    const passwords = ['password123', 'admin', '123456', 'waveriders'];
    
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, shop.password_hash);
      console.log(`Password "${pwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      if (isValid) break;
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
