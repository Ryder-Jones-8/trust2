const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Use the same configuration as the working scripts
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'trust_platform',
    password: 'password',
    port: 5432,
});

async function addDemoShops() {
    console.log('=== ADDING DEMO SHOPS FOR TRUST. PLATFORM ===');
      const demoShops = [
        {
            name: 'Pacific Coast Surf Co.',
            email: 'info@pacificcoastsurf.com',
            location: 'Santa Monica, CA'
        },
        {
            name: 'Alpine Adventure Outfitters',
            email: 'hello@alpineadventure.com',
            location: 'Aspen, CO'
        },
        {
            name: 'Urban Wheels Skate Shop',
            email: 'crew@urbanwheels.com',
            location: 'Venice Beach, CA'
        },
        {
            name: 'North Shore Surf & Snow',
            email: 'aloha@northshoresurf.com',
            location: 'Haleiwa, HI'
        },
        {
            name: 'Powder Mountain Sports',
            email: 'contact@powdermountain.com',
            location: 'Park City, UT'
        },
        {
            name: 'Concrete Jungle Boards',
            email: 'info@concretejungle.com',
            location: 'Brooklyn, NY'
        },
        {
            name: 'Big Sur Surf Shack',
            email: 'waves@bigsursurf.com',
            location: 'Big Sur, CA'
        },
        {
            name: 'Whistler Peak Gear',
            email: 'info@whistlerpeak.com',
            location: 'Whistler, BC'
        }
    ];

    try {
        await pool.connect();
        console.log('✅ Connected to PostgreSQL database');

        // Default password for all demo shops
        const defaultPassword = 'demo123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        for (const shop of demoShops) {
            // Check if shop already exists
            const existingShop = await pool.query(
                'SELECT email FROM shops WHERE email = $1',
                [shop.email]
            );

            if (existingShop.rows.length > 0) {
                console.log(`⚠️  Shop with email ${shop.email} already exists, skipping...`);
                continue;
            }            // Insert new shop
            const result = await pool.query(
                `INSERT INTO shops (name, email, password_hash, location) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, name, email`,
                [shop.name, shop.email, hashedPassword, shop.location]
            );

            console.log(`✅ Created shop: ${result.rows[0].name} (${result.rows[0].email})`);
        }

        console.log('\n=== DEMO SHOP CREATION COMPLETE ===');
        console.log('Default login password for all demo shops: demo123');
        console.log('\nShop Categories:');
        console.log('🏄 Surf Shops: Pacific Coast Surf Co., North Shore Surf & Snow, Big Sur Surf Shack');
        console.log('⛷️  Ski/Snow Shops: Alpine Adventure Outfitters, Powder Mountain Sports, Whistler Peak Gear');
        console.log('🛹 Skate Shops: Urban Wheels Skate Shop, Concrete Jungle Boards');

    } catch (error) {
        console.error('❌ Error adding demo shops:', error.message);
    } finally {
        await pool.end();
    }
}

addDemoShops();
