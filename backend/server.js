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

// Helper function to parse price range
function parsePriceRange(priceRange) {
  if (!priceRange || priceRange === 'No preference') {
    return { min: 0, max: Infinity };
  }
  
  const ranges = {
    'Under $25': { min: 0, max: 25 },
    'Under $30': { min: 0, max: 30 },
    'Under $50': { min: 0, max: 50 },
    'Under $100': { min: 0, max: 100 },
    'Under $200': { min: 0, max: 200 },
    'Under $300': { min: 0, max: 300 },
    '$25 - $50': { min: 25, max: 50 },
    '$30 - $50': { min: 30, max: 50 },
    '$50 - $80': { min: 50, max: 80 },
    '$50 - $100': { min: 50, max: 100 },
    '$80 - $120': { min: 80, max: 120 },
    '$100 - $150': { min: 100, max: 150 },
    '$100 - $200': { min: 100, max: 200 },
    '$120 - $180': { min: 120, max: 180 },
    '$150 - $250': { min: 150, max: 250 },
    '$200 - $300': { min: 200, max: 300 },
    '$200 - $400': { min: 200, max: 400 },
    '$300 - $500': { min: 300, max: 500 },
    '$400 - $600': { min: 400, max: 600 },
    '$500 - $700': { min: 500, max: 700 },
    '$600 - $800': { min: 600, max: 800 },
    '$700 - $900': { min: 700, max: 900 },
    '$20 - $40': { min: 20, max: 40 },
    '$40 - $60': { min: 40, max: 60 },
    '$60 - $80': { min: 60, max: 80 },
    '$180+': { min: 180, max: Infinity },
    '$250+': { min: 250, max: Infinity },
    '$300+': { min: 300, max: Infinity },
    '$500+': { min: 500, max: Infinity },
    '$800+': { min: 800, max: Infinity },
    '$900+': { min: 900, max: Infinity },
    '$80+': { min: 80, max: Infinity },
    '$120+': { min: 120, max: Infinity },
    '$150+': { min: 150, max: Infinity },
    '$1000+': { min: 1000, max: Infinity }
  };
  
  return ranges[priceRange] || { min: 0, max: Infinity };
}

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

// Shop Authentication Routes - Updated to match frontend
app.post('/api/login', async (req, res) => {
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

// Shop Registration Route - Updated to match frontend
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    console.log('Registration attempt for:', email);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if shop already exists
    const existingShop = await query('SELECT id FROM shops WHERE email = $1', [email]);
    if (existingShop.rows.length > 0) {
      return res.status(409).json({ error: 'Shop with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new shop
    const result = await query(
      'INSERT INTO shops (name, email, password_hash, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, passwordHash, location || '']
    );

    const newShop = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { shopId: newShop.id, email: newShop.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registration successful for:', email);
    res.status(201).json({
      token,
      shop: {
        id: newShop.id,
        name: newShop.name,
        email: newShop.email,
        location: newShop.location
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Products API Routes
app.get('/api/products', async (req, res) => {
  try {
    const { sport, category, shopId } = req.query;
    const authHeader = req.headers['authorization'];
    
    // If authenticated, show shop's products; otherwise show all public products
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const shopResult = await query('SELECT id FROM shops WHERE id = $1', [decoded.shopId]);
        if (shopResult.rows.length > 0) {          // Authenticated - show shop's products
          const result = await query('SELECT * FROM products WHERE shop_id = $1 ORDER BY created_at DESC', [decoded.shopId]);
          const products = result.rows.map(product => ({
            id: product.id,
            shopId: product.shop_id,
            name: product.name,
            brand: product.specifications?.brand || '',
            category: product.category,
            sport: product.sport,
            price: parseFloat(product.price),
            description: product.description,
            specifications: product.specifications,
            inStock: product.inventory_count > 0,
            quantity: product.inventory_count,
            size: product.specifications?.size || '',
            features: product.specifications?.features || [],
            image: product.image_url,
            createdAt: product.created_at,
            updatedAt: product.updated_at
          }));
          return res.json(products);
        }
      } catch (error) {
        // Invalid token, fall through to public products
      }
    }

    // Public product listing with filters
    let queryText = 'SELECT * FROM products WHERE inventory_count > 0';
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

    queryText += ' ORDER BY created_at DESC';    const result = await query(queryText, params);
    const products = result.rows.map(product => ({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      brand: product.specifications?.brand || '',
      category: product.category,
      sport: product.sport,
      price: parseFloat(product.price),
      description: product.description,
      specifications: product.specifications,
      inStock: product.inventory_count > 0,
      quantity: product.inventory_count,
      size: product.specifications?.size || '',
      features: product.specifications?.features || [],
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

app.post('/api/products', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, sport, price, description, features, quantity, specifications } = req.body;
    
    if (!name || !category || !sport || !price) {
      return res.status(400).json({ error: 'Name, category, sport, and price are required' });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse features if it's a string
    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (error) {
        parsedFeatures = features.split(',').map(f => f.trim()).filter(f => f);
      }
    }    // Parse specifications if it's a string
    let parsedSpecs = {};
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (error) {
        parsedSpecs = {};
      }
    }

    // Include brand in specifications
    const finalSpecs = { 
      features: parsedFeatures, 
      brand: brand || '', 
      ...parsedSpecs 
    };

    const result = await query(
      `INSERT INTO products (shop_id, name, category, sport, price, description, specifications, inventory_count, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [req.shop.id, name, category, sport, price, description, finalSpecs, parseInt(quantity, 10) || 0, imageUrl]
    );    const product = result.rows[0];
    res.status(201).json({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      brand: product.specifications?.brand || '',
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

// Get a single product by ID
app.get('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      'SELECT * FROM products WHERE id = $1 AND shop_id = $2',
      [id, req.shop.id]
    );    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = result.rows[0];
    res.json({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      brand: product.specifications?.brand || '',
      category: product.category,
      sport: product.sport,
      price: parseFloat(product.price),
      description: product.description,
      specifications: product.specifications,
      inStock: product.inventory_count > 0,
      quantity: product.inventory_count,
      size: product.specifications?.size || '',
      features: product.specifications?.features || [],
      image: product.image_url,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, sport, price, description, specifications, quantity, image } = req.body;

    // Parse and merge specifications with brand
    let parsedSpecs = {};
    if (specifications) {
      try {
        parsedSpecs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (error) {
        parsedSpecs = {};
      }
    }

    // Include brand in specifications
    const finalSpecs = { 
      ...parsedSpecs,
      brand: brand || ''
    };

    const result = await query(
      `UPDATE products 
       SET name = $1, category = $2, sport = $3, price = $4, description = $5, 
           specifications = $6, inventory_count = $7, image_url = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND shop_id = $10 RETURNING *`,
      [name, category, sport, price, description, finalSpecs, parseInt(quantity, 10), image, id, req.shop.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }    const product = result.rows[0];
    res.json({
      id: product.id,
      shopId: product.shop_id,
      name: product.name,
      brand: product.specifications?.brand || '',
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

// Recommendations API - Updated to match frontend expectations
app.post('/api/recommendations', async (req, res) => {
  try {
    console.log('Received recommendations request:', req.body);
    const { sport, category, formData, shopId } = req.body;
    
    if (!sport || !formData) {
      return res.status(400).json({ error: 'Sport and formData are required' });
    }

    // Generate session token
    const sessionToken = uuidv4();

    // Store customer session (shopId can be null for general recommendations)
    try {
      await query(
        'INSERT INTO customer_sessions (session_token, shop_id, sport, customer_data) VALUES ($1, $2, $3, $4)',
        [sessionToken, shopId || null, sport, formData]
      );
      console.log('Customer session stored successfully');
    } catch (sessionError) {
      console.error('Error storing customer session:', sessionError);
      // Continue without storing session if it fails
    }    // Get products for recommendations
    let recommendationQuery = 'SELECT * FROM products WHERE sport = $1';
    const params = [sport];

    if (category) {
      recommendationQuery += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (shopId) {
      recommendationQuery += ` AND shop_id = $${params.length + 1}`;
      params.push(shopId);
    }    // Parse price range from formData
    const priceRange = formData.priceRange;
    const { min: minPrice, max: maxPrice } = parsePriceRange(priceRange);
    
    // Only apply price filtering if a specific range is selected
    if (priceRange && priceRange !== 'No preference') {
      console.log('Applying price filter:', { priceRange, minPrice, maxPrice });
      if (maxPrice === Infinity) {
        recommendationQuery += ` AND price >= $${params.length + 1}`;
        params.push(minPrice);
      } else {
        recommendationQuery += ` AND price BETWEEN $${params.length + 1} AND $${params.length + 2}`;
        params.push(minPrice, maxPrice);
      }
    }

    recommendationQuery += ' AND inventory_count > 0 ORDER BY RANDOM() LIMIT 10';

    console.log('Executing query:', recommendationQuery, 'with params:', params);
    const recommendationsResult = await query(recommendationQuery, params);    console.log('Query returned', recommendationsResult.rows.length, 'products');
      const recommendations = recommendationsResult.rows.map(product => {
      const productPrice = parseFloat(product.price);
      const matchReasons = [];
      let baseScore = Math.floor(Math.random() * 20) + 70; // Base score 70-90%
      
      // Add generic match reasons based on form data
      if (formData.experienceLevel) {
        matchReasons.push('Good match for experience level');
      }
      
      // Add price range match reason ONLY if price filtering was applied AND product is actually in range
      if (priceRange && priceRange !== 'No preference') {
        const { min: minPrice, max: maxPrice } = parsePriceRange(priceRange);
        if (productPrice >= minPrice && (maxPrice === Infinity || productPrice <= maxPrice)) {
          matchReasons.push('Fits your price range');
          baseScore += 5; // Boost score for price match
        }
      }
      
      // Add other relevant match reasons based on form data
      if (formData.skillLevel || formData.ridingStyle || formData.boardType || formData.terrainPreference) {
        matchReasons.push('Matches your preferences');
      }
      
      // Add popular choice as fallback or supplement
      if (matchReasons.length === 0) {
        matchReasons.push('Popular choice');
      } else if (Math.random() > 0.5) {
        matchReasons.push('Popular choice');
      }
      
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        sport: product.sport,
        price: productPrice,
        description: product.description,
        specifications: product.specifications,
        image: product.image_url,
        inStock: product.inventory_count > 0,
        quantity: product.inventory_count,
        score: Math.min(baseScore, 100), // Cap score at 100%
        matchReasons,
        features: Array.isArray(product.specifications?.features) ? product.specifications.features : []
      };
    });

    // Update session with recommendations if session was stored
    try {
      await query(
        'UPDATE customer_sessions SET recommendations = $1 WHERE session_token = $2',
        [JSON.stringify(recommendations), sessionToken]
      );
    } catch (updateError) {
      console.error('Error updating session with recommendations:', updateError);
      // Continue without updating session
    }

    console.log('Returning', recommendations.length, 'recommendations');
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Helper function to parse price range
function parsePriceRange(priceRange) {
  if (!priceRange || priceRange === 'No preference') {
    return { min: 0, max: Infinity };
  }
  
  const ranges = {
    'Under $25': { min: 0, max: 25 },
    'Under $30': { min: 0, max: 30 },
    'Under $50': { min: 0, max: 50 },
    'Under $100': { min: 0, max: 100 },
    'Under $200': { min: 0, max: 200 },
    'Under $300': { min: 0, max: 300 },
    '$25 - $50': { min: 25, max: 50 },
    '$30 - $50': { min: 30, max: 50 },
    '$50 - $80': { min: 50, max: 80 },
    '$50 - $100': { min: 50, max: 100 },
    '$80 - $120': { min: 80, max: 120 },
    '$100 - $150': { min: 100, max: 150 },
    '$100 - $200': { min: 100, max: 200 },
    '$120 - $180': { min: 120, max: 180 },
    '$150 - $250': { min: 150, max: 250 },
    '$200 - $300': { min: 200, max: 300 },
    '$200 - $400': { min: 200, max: 400 },
    '$300 - $500': { min: 300, max: 500 },
    '$400 - $600': { min: 400, max: 600 },
    '$500 - $700': { min: 500, max: 700 },
    '$600 - $800': { min: 600, max: 800 },
    '$700 - $900': { min: 700, max: 900 },
    '$20 - $40': { min: 20, max: 40 },
    '$40 - $60': { min: 40, max: 60 },
    '$60 - $80': { min: 60, max: 80 },
    '$180+': { min: 180, max: Infinity },
    '$250+': { min: 250, max: Infinity },
    '$300+': { min: 300, max: Infinity },
    '$500+': { min: 500, max: Infinity },
    '$800+': { min: 800, max: Infinity },
    '$900+': { min: 900, max: Infinity },
    '$80+': { min: 80, max: Infinity },
    '$120+': { min: 120, max: Infinity },
    '$150+': { min: 150, max: Infinity },
    '$1000+': { min: 1000, max: Infinity }
  };
  
  return ranges[priceRange] || { min: 0, max: Infinity };
}

// Analytics API - Updated to match frontend expectations
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  try {
    // Get basic statistics for the shop
    const statsQueries = await Promise.all([
      query('SELECT COUNT(*) as total_products FROM products WHERE shop_id = $1', [req.shop.id]),
      query('SELECT SUM(inventory_count) as total_inventory FROM products WHERE shop_id = $1', [req.shop.id]),
      query('SELECT COUNT(*) as total_sessions FROM customer_sessions WHERE shop_id = $1', [req.shop.id]),
      query('SELECT AVG(price) as avg_price FROM products WHERE shop_id = $1 AND inventory_count > 0', [req.shop.id]),
      query(`SELECT category, COUNT(*) as count, SUM(inventory_count * price) as value 
             FROM products WHERE shop_id = $1 GROUP BY category`, [req.shop.id])
    ]);

    const categoryBreakdown = {};
    statsQueries[4].rows.forEach(row => {
      categoryBreakdown[row.category] = {
        count: parseInt(row.count),
        value: parseFloat(row.value) || 0
      };
    });

    const analytics = {
      totalProducts: parseInt(statsQueries[0].rows[0].total_products),
      totalInventory: parseInt(statsQueries[1].rows[0].total_inventory) || 0,
      customerSessions: parseInt(statsQueries[2].rows[0].total_sessions),
      averagePrice: parseFloat(statsQueries[3].rows[0].avg_price) || 0,
      categoryBreakdown,
      // Mock additional data that matches frontend expectations
      totalRevenue: 24750.50,
      totalSales: 142,
      averageOrderValue: 174.30,
      revenueChange: 12.5,
      salesChange: 8.3
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