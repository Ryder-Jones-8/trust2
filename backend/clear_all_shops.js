const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'trust_platform',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function clearAllShops() {
    console.log('=== CLEARING ALL SHOPS FROM DATABASE ===');
    console.log('⚠️  WARNING: This will delete ALL shop data!');
    
    try {
        await pool.connect();
        console.log('✅ Connected to PostgreSQL database');

        // First, let's see what we're about to delete
        const countResult = await pool.query('SELECT COUNT(*) FROM shops');
        const shopCount = countResult.rows[0].count;
        console.log(`📊 Found ${shopCount} shops to delete`);

        if (shopCount === '0') {
            console.log('ℹ️  No shops found in database');
            return;
        }

        // Delete all products first (if they reference shops)
        console.log('🗑️  Deleting all products...');
        const deleteProductsResult = await pool.query('DELETE FROM products');
        console.log(`✅ Deleted ${deleteProductsResult.rowCount} products`);

        // Delete all shops
        console.log('🗑️  Deleting all shops...');
        const deleteShopsResult = await pool.query('DELETE FROM shops');
        console.log(`✅ Deleted ${deleteShopsResult.rowCount} shops`);

        // Reset the auto-increment sequences if they exist
        try {
            await pool.query('ALTER SEQUENCE IF EXISTS shops_id_seq RESTART WITH 1');
            await pool.query('ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1');
            console.log('🔄 Reset ID sequences');
        } catch (seqError) {
            console.log('ℹ️  No sequences to reset (using UUIDs)');
        }

        console.log('✅ Database cleanup complete!');
        console.log('📝 Ready for fresh demo shop data');

    } catch (error) {
        console.error('❌ Error clearing shops:', error.message);
    } finally {
        await pool.end();
    }
}

clearAllShops();
