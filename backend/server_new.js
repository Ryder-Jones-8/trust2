const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { query, pool } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'trust_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify shop still exists in database
    const shopResult = await query('SELECT id, name, email FROM shops WHERE id = $1', [decoded.shopId]);
    if (shopResult.rows.length === 0) {
      return res.status(401).json({ error: 'Shop not found' });
    }
    req.shop = shopResult.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Database health check
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Shop Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get shop from database
    const result = await query('SELECT * FROM shops WHERE email = $1', [email]);
    const shop = result.rows[0];

    if (!shop) {
      console.log('Shop not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, shop.password_hash);
    if (!validPassword) {
      console.log('Invalid password for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { shopId: shop.id, email: shop.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({
      token,
      shop: {
        id: shop.id,
        name: shop.name,
        email: shop.email,
        location: shop.location
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Products API Routes
app.get('/api/products', async (req, res) => {
  try {
    const { sport, category, shopId } = req.query;
    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (sport) {
      queryText += ` AND sport = $${params.length + 1}`;
      params.push(sport);
    }

    if (category) {
      queryText += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (shopId) {
      queryText += ` AND shop_id = $${params.length + 1}`;
      params.push(shopId);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    const products = result.rows.map(product => ({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      category: product.category,
      sport: product.sport,
      price: parseFloat(product.price),
      description: product.description,
      specifications: product.specifications,
      inStock: product.inventory_count > 0,
      quantity: product.inventory_count,
      image: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, category, sport, price, description, specifications, inventory_count, image_url } = req.body;
    
    if (!name || !category || !sport || !price) {
      return res.status(400).json({ error: 'Name, category, sport, and price are required' });
    }

    const result = await query(
      `INSERT INTO products (shop_id, name, category, sport, price, description, specifications, inventory_count, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.shop.id, name, category, sport, price, description, specifications || {}, inventory_count || 0, image_url]
    );

    const product = result.rows[0];
    res.status(201).json({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      category: product.category,
      sport: product.sport,
      price: parseFloat(product.price),
      description: product.description,
      specifications: product.specifications,
      inStock: product.inventory_count > 0,
      quantity: product.inventory_count,
      image: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, sport, price, description, specifications, inventory_count, image_url } = req.body;

    const result = await query(
      `UPDATE products 
       SET name = $1, category = $2, sport = $3, price = $4, description = $5, 
           specifications = $6, inventory_count = $7, image_url = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND shop_id = $10 RETURNING *`,
      [name, category, sport, price, description, specifications || {}, inventory_count, image_url, id, req.shop.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    res.json({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      category: product.category,
      sport: product.sport,
      price: parseFloat(product.price),
      description: product.description,
      specifications: product.specifications,
      inStock: product.inventory_count > 0,
      quantity: product.inventory_count,
      image: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM products WHERE id = $1 AND shop_id = $2 RETURNING *',
      [id, req.shop.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommendations API
app.post('/api/recommendations', async (req, res) => {
  try {
    const { sport, customerData, shopId } = req.body;
    
    if (!sport || !customerData) {
      return res.status(400).json({ error: 'Sport and customer data are required' });
    }

    // Generate session token
    const sessionToken = uuidv4();

    // Store customer session
    await query(
      'INSERT INTO customer_sessions (session_token, shop_id, sport, customer_data) VALUES ($1, $2, $3, $4)',
      [sessionToken, shopId, sport, customerData]
    );

    // Get products for recommendations (simple algorithm for now)
    let recommendationQuery = 'SELECT * FROM products WHERE sport = $1';
    const params = [sport];

    if (shopId) {
      recommendationQuery += ' AND shop_id = $2';
      params.push(shopId);
    }

    recommendationQuery += ' AND inventory_count > 0 ORDER BY RANDOM() LIMIT 5';

    const recommendationsResult = await query(recommendationQuery, params);
    
    const recommendations = recommendationsResult.rows.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      sport: product.sport,
      price: parseFloat(product.price),
      description: product.description,
      specifications: product.specifications,
      image: product.image_url,
      matchScore: Math.floor(Math.random() * 30) + 70 // Mock match score 70-100%
    }));

    // Update session with recommendations
    await query(
      'UPDATE customer_sessions SET recommendations = $1 WHERE session_token = $2',
      [JSON.stringify(recommendations), sessionToken]
    );

    res.json({
      sessionToken,
      recommendations,
      customerProfile: customerData
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics API
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    // Get basic statistics for the shop
    const statsQueries = await Promise.all([
      query('SELECT COUNT(*) as total_products FROM products WHERE shop_id = $1', [req.shop.id]),
      query('SELECT SUM(inventory_count) as total_inventory FROM products WHERE shop_id = $1', [req.shop.id]),
      query('SELECT COUNT(*) as total_sessions FROM customer_sessions WHERE shop_id = $1', [req.shop.id]),
      query('SELECT AVG(price) as avg_price FROM products WHERE shop_id = $1 AND inventory_count > 0', [req.shop.id])
    ]);

    const analytics = {
      totalProducts: parseInt(statsQueries[0].rows[0].total_products),
      totalInventory: parseInt(statsQueries[1].rows[0].total_inventory) || 0,
      customerSessions: parseInt(statsQueries[2].rows[0].total_sessions),
      averagePrice: parseFloat(statsQueries[3].rows[0].avg_price) || 0,
      // Mock revenue data (in real app, would come from sales table)
      totalRevenue: 12450.50,
      averageOrderValue: 185.25,
      customerSatisfaction: 4.2
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Shop settings API
app.get('/api/shop/settings', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM shops WHERE id = $1', [req.shop.id]);
    const shop = result.rows[0];

    res.json({
      id: shop.id,
      name: shop.name,
      email: shop.email,
      location: shop.location,
      settings: shop.settings || {}
    });
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/shop/settings', authenticateToken, async (req, res) => {
  try {
    const { name, location, settings } = req.body;

    const result = await query(
      'UPDATE shops SET name = $1, location = $2, settings = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, location, settings || {}, req.shop.id]
    );

    const shop = result.rows[0];
    res.json({
      id: shop.id,
      name: shop.name,
      email: shop.email,
      location: shop.location,
      settings: shop.settings
    });
  } catch (error) {
    console.error('Error updating shop settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 trust. platform backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('⏹️  Shutting down server...');
  await pool.end();
  process.exit(0);
});
