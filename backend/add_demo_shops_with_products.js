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

async function addDemoShopsWithProducts() {
    console.log('=== ADDING DEMO SHOPS WITH PRODUCTS ===');
    
    try {
        await pool.connect();
        console.log('✅ Connected to PostgreSQL database');

        // Default password for all demo shops
        const defaultPassword = 'demo123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const demoShops = [
            {
                name: 'Pacific Coast Surf Co.',
                email: 'info@pacificcoastsurf.com',
                location: 'Santa Monica, CA',
                sport: 'surf'
            },
            {
                name: 'Alpine Adventure Outfitters',
                email: 'hello@alpineadventure.com',
                location: 'Aspen, CO',
                sport: 'ski'
            },
            {
                name: 'Urban Wheels Skate Shop',
                email: 'crew@urbanwheels.com',
                location: 'Venice Beach, CA',
                sport: 'skate'
            }
        ];

        // Sample products for each sport
        const productTemplates = {
            surf: [
                { name: 'Pro Shortboard 6\'2"', category: 'boards', price: 599.99, inventory: 5, description: 'High-performance shortboard for advanced surfers' },
                { name: 'Premium Wetsuit 3/2mm', category: 'wetsuits', price: 299.99, inventory: 8, description: 'High-quality neoprene wetsuit' },
                { name: 'Performance Fins Set', category: 'fins', price: 89.99, inventory: 12, description: 'Carbon fiber fin set for maximum performance' },
                { name: 'Longboard 9\'6"', category: 'boards', price: 749.99, inventory: 3, description: 'Classic longboard for cruising' },
                { name: 'Surf Leash 6ft', category: 'accessories', price: 29.99, inventory: 15, description: 'Strong urethane surf leash' }
            ],
            ski: [
                { name: 'All-Mountain Snowboard 158cm', category: 'snowboards', price: 449.99, inventory: 6, description: 'Versatile all-mountain snowboard' },
                { name: 'Snowboard Boots Size 10', category: 'boots', price: 279.99, inventory: 4, description: 'Comfortable and responsive snowboard boots' },
                { name: 'Ski Helmet Large', category: 'helmets', price: 159.99, inventory: 10, description: 'Safety-certified ski helmet' },
                { name: 'Ski Goggles', category: 'goggles', price: 119.99, inventory: 8, description: 'Anti-fog ski goggles with UV protection' },
                { name: 'Freestyle Skis 170cm', category: 'skis', price: 399.99, inventory: 5, description: 'Twin-tip freestyle skis' }
            ],
            skate: [
                { name: 'Street Complete 8.0"', category: 'complete', price: 129.99, inventory: 15, description: 'Complete street skateboard setup' },
                { name: 'Pro Deck 8.25"', category: 'decks', price: 59.99, inventory: 20, description: 'Professional grade skateboard deck' },
                { name: 'Skate Helmet Medium', category: 'helmets', price: 49.99, inventory: 8, description: 'Street skating protection helmet' },
                { name: 'Skateboard Trucks 149mm', category: 'trucks', price: 39.99, inventory: 12, description: 'Durable skateboard trucks' },
                { name: 'Wheel Set 52mm', category: 'wheels', price: 24.99, inventory: 25, description: 'Street skating wheels 99A durometer' }
            ]
        };

        for (const shop of demoShops) {
            // Check if shop already exists
            const existingShop = await pool.query(
                'SELECT email FROM shops WHERE email = $1',
                [shop.email]
            );

            let shopId;
            
            if (existingShop.rows.length > 0) {
                console.log(`⚠️  Shop with email ${shop.email} already exists, skipping shop creation...`);
                // Get the existing shop ID
                const shopResult = await pool.query(
                    'SELECT id FROM shops WHERE email = $1',
                    [shop.email]
                );
                shopId = shopResult.rows[0].id;
            } else {
                // Insert new shop
                const result = await pool.query(
                    `INSERT INTO shops (name, email, password_hash, location) 
                     VALUES ($1, $2, $3, $4) 
                     RETURNING id, name, email`,
                    [shop.name, shop.email, hashedPassword, shop.location]
                );
                shopId = result.rows[0].id;
                console.log(`✅ Created shop: ${result.rows[0].name} (${result.rows[0].email})`);
            }

            // Add products for this shop
            const products = productTemplates[shop.sport];
            for (const product of products) {
                await pool.query(
                    `INSERT INTO products (shop_id, name, category, sport, price, inventory_count, description) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [shopId, product.name, product.category, shop.sport, product.price, product.inventory, product.description]
                );
            }
            console.log(`📦 Added ${products.length} products to ${shop.name}`);
        }

        console.log('\n=== DEMO SETUP COMPLETE ===');
        console.log('Default login password for all demo shops: demo123');
        console.log('\nShop Summary:');
        console.log('🏄 Pacific Coast Surf Co. - 5 surf products');
        console.log('⛷️  Alpine Adventure Outfitters - 5 ski/snow products');  
        console.log('🛹 Urban Wheels Skate Shop - 5 skate products');

    } catch (error) {
        console.error('❌ Error adding demo shops with products:', error.message);
    } finally {
        await pool.end();
    }
}

addDemoShopsWithProducts();
