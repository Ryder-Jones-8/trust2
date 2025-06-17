const { Client } = require('pg');

// Your Neon database connection
const connectionString = 'postgresql://neondb_owner:npg_90UbFJWeZPdy@ep-cold-cell-a8pfj6k2-pooler.eastus2.azure.neon.tech/neondb?sslmode=require';

async function setupCloudDatabase() {
    console.log('🚀 Setting up trust. platform cloud database...');
    
    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Neon database');

        // Read and execute the schema
        const fs = require('fs');
        const schema = fs.readFileSync('../cloud_database_setup.sql', 'utf8');
        
        console.log('📊 Creating database schema...');
        await client.query(schema);
        
        console.log('✅ Database setup complete!');
        console.log('');
        console.log('📋 Created:');
        console.log('  • shops table');
        console.log('  • products table'); 
        console.log('  • customer_sessions table');
        console.log('  • analytics_events table');
        console.log('  • All indexes');
        console.log('');
        console.log('🏪 Demo shops added:');
        console.log('  • Pacific Coast Surf Co. (info@pacificcoastsurf.com)');
        console.log('  • Alpine Adventure Outfitters (hello@alpineadventure.com)');
        console.log('  • Urban Wheels Skate Shop (crew@urbanwheels.com)');
        console.log('');
        console.log('🔑 Demo login password: demo123');
        console.log('');
        console.log('✅ Your cloud database is ready!');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        console.error('Details:', error);
    } finally {
        await client.end();
    }
}

setupCloudDatabase();
