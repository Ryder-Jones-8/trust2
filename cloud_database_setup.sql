-- trust. platform database schema for cloud deployment
-- Run this script on your Neon database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Shops table (for multi-shop support)
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL CHECK (sport IN ('surf', 'ski', 'skate')),
    price DECIMAL(10,2) NOT NULL,
    inventory_count INTEGER DEFAULT 0,
    description TEXT,
    specifications JSONB DEFAULT '{}',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer sessions for recommendations
CREATE TABLE customer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL,
    customer_data JSONB NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_sport ON products(sport);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_customer_sessions_shop_id ON customer_sessions(shop_id);
CREATE INDEX idx_customer_sessions_token ON customer_sessions(session_token);
CREATE INDEX idx_analytics_shop_id ON analytics_events(shop_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);

-- Insert demo shops with hashed passwords (password: demo123)
INSERT INTO shops (id, name, email, password_hash, location) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Pacific Coast Surf Co.', 'info@pacificcoastsurf.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Santa Monica, CA'),
('550e8400-e29b-41d4-a716-446655440001', 'Alpine Adventure Outfitters', 'hello@alpineadventure.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aspen, CO'),
('550e8400-e29b-41d4-a716-446655440002', 'Urban Wheels Skate Shop', 'crew@urbanwheels.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Venice Beach, CA');

-- Insert demo products for each shop
INSERT INTO products (shop_id, name, category, sport, price, inventory_count, description, specifications) VALUES
-- Surf products for Pacific Coast Surf Co.
('550e8400-e29b-41d4-a716-446655440000', 'Pro Shortboard 6''2"', 'boards', 'surf', 599.99, 5, 'High-performance shortboard for advanced surfers', '{"length": "6''2\"", "width": "19.5\"", "thickness": "2.5\"", "volume": "28.5L", "fin_setup": "thruster", "brand": "Lost"}'),
('550e8400-e29b-41d4-a716-446655440000', 'Premium Wetsuit 3/2mm', 'wetsuits', 'surf', 299.99, 8, 'High-quality neoprene wetsuit', '{"thickness": "3/2mm", "material": "neoprene", "sizes": ["XS", "S", "M", "L", "XL"], "brand": "O''Neill"}'),
('550e8400-e29b-41d4-a716-446655440000', 'Performance Fins Set', 'fins', 'surf', 89.99, 12, 'Carbon fiber fin set for maximum performance', '{"material": "carbon_fiber", "size": "medium", "template": "performance", "brand": "FCS"}'),
('550e8400-e29b-41d4-a716-446655440000', 'Longboard 9''6"', 'boards', 'surf', 749.99, 3, 'Classic longboard for cruising', '{"length": "9''6\"", "width": "22.5\"", "thickness": "3\"", "volume": "65L", "fin_setup": "single", "brand": "Stewart"}'),
('550e8400-e29b-41d4-a716-446655440000', 'Surf Leash 6ft', 'accessories', 'surf', 29.99, 15, 'Strong urethane surf leash', '{"length": "6ft", "thickness": "7mm", "brand": "FCS"}'),

-- Ski products for Alpine Adventure Outfitters
('550e8400-e29b-41d4-a716-446655440001', 'All-Mountain Snowboard 158cm', 'snowboards', 'ski', 449.99, 6, 'Versatile all-mountain snowboard', '{"length": "158cm", "width": "25.2cm", "flex": "medium", "shape": "directional_twin", "brand": "Burton"}'),
('550e8400-e29b-41d4-a716-446655440001', 'Snowboard Boots Size 10', 'boots', 'ski', 279.99, 4, 'Comfortable and responsive snowboard boots', '{"size": "10", "flex": "medium", "lacing": "boa", "brand": "Burton"}'),
('550e8400-e29b-41d4-a716-446655440001', 'Ski Helmet Large', 'helmets', 'ski', 159.99, 10, 'Safety-certified ski helmet', '{"size": "large", "ventilation": "adjustable", "weight": "450g", "brand": "Smith"}'),
('550e8400-e29b-41d4-a716-446655440001', 'Ski Goggles', 'goggles', 'ski', 119.99, 8, 'Anti-fog ski goggles with UV protection', '{"lens_type": "photochromic", "fit": "medium", "brand": "Oakley"}'),
('550e8400-e29b-41d4-a716-446655440001', 'Freestyle Skis 170cm', 'skis', 'ski', 399.99, 5, 'Twin-tip freestyle skis', '{"length": "170cm", "width": "85mm", "flex": "soft", "brand": "K2"}'),

-- Skate products for Urban Wheels Skate Shop
('550e8400-e29b-41d4-a716-446655440002', 'Street Complete 8.0"', 'complete', 'skate', 129.99, 15, 'Complete street skateboard setup', '{"deck_size": "8.0\"", "truck_size": "149mm", "wheel_size": "52mm", "bearing": "ABEC-7", "brand": "Element"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Pro Deck 8.25"', 'decks', 'skate', 59.99, 20, 'Professional grade skateboard deck', '{"size": "8.25\"", "material": "7-ply_maple", "concave": "medium", "length": "32\"", "brand": "Girl"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Skate Helmet Medium', 'helmets', 'skate', 49.99, 8, 'Street skating protection helmet', '{"size": "medium", "certification": "CPSC", "style": "classic_skate", "brand": "Triple 8"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Skateboard Trucks 149mm', 'trucks', 'skate', 39.99, 12, 'Durable skateboard trucks', '{"size": "149mm", "height": "medium", "brand": "Independent"}'),
('550e8400-e29b-41d4-a716-446655440002', 'Wheel Set 52mm', 'wheels', 'skate', 24.99, 25, 'Street skating wheels 99A durometer', '{"size": "52mm", "durometer": "99A", "brand": "Spitfire"}')
