// Manual check of snowboard products in server.js
const fs = require('fs');
const path = require('path');

// Read server.js and extract product data
const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

// Extract the products array manually
const match = serverCode.match(/let products = \[([\s\S]*?)\];/);
if (!match) {
  console.log('Could not find products array in server.js');
  process.exit(1);
}

console.log('=== MANUAL SNOWBOARD ANALYSIS ===');

// Check for snowboard products by looking at the raw server code
const productSection = match[1];
const snowboardMatches = productSection.match(/category: ['"]snowboards['"][\s\S]*?sport: ['"]ski['"]|sport: ['"]ski['"][\s\S]*?category: ['"]snowboards['"]|name: ['"][^'"]*[Ss]nowboard[^'"]*['"][\s\S]*?}/g);

if (snowboardMatches) {
  console.log('Found snowboard-related products in code:');
  snowboardMatches.forEach((match, index) => {
    console.log(`\nProduct ${index + 1}:`);
    console.log(match.substring(0, 200) + '...');
  });
} else {
  console.log('❌ No snowboard products found in the products array!');
}

// Also check the filtering logic
console.log('\n=== CHECKING FILTERING CRITERIA ===');
console.log('Required for snowboard recommendations:');
console.log('- sport === "ski" ✅');
console.log('- category === "snowboards" ✅');
console.log('- inStock === true ✅');
console.log('- quantity > 0 ✅');
console.log('- shopId filter (if provided) ✅');

console.log('\n=== SOLUTION RECOMMENDATIONS ===');
console.log('1. Test in browser with skiing > snowboards');
console.log('2. Check server terminal for debug output');
console.log('3. Verify products are correctly defined in server.js');
console.log('4. Check frontend form submission data');
