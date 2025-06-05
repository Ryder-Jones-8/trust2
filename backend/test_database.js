// Simple database connection test
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'trust_platform',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.DB_HOST || 'localhost');
  console.log('Database:', process.env.DB_NAME || 'trust_platform');
  console.log('User:', process.env.DB_USER || 'postgres');
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Available tables:');
    if (result.rows.length === 0) {
      console.log('   No tables found. Please run database_schema.sql');
    } else {
      result.rows.forEach(row => {
        console.log('  -', row.table_name);
      });
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Solution: Make sure PostgreSQL is running');
    } else if (error.code === '3D000') {
      console.error('   Solution: Create the database with: createdb -U postgres trust_platform');
    } else if (error.code === '28P01') {
      console.error('   Solution: Check username/password in .env file');
    }
  } finally {
    await pool.end();
  }
}

testConnection();
