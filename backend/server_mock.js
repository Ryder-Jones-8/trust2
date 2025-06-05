const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
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

// In-memory data storage (replaces database)
let shops = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Wave Riders Surf Shop',
    email: 'admin@waveriders.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
    location: 'Venice Beach, CA',
    settings: {},
    createdAt: new Date().toISOString()
  }
];

let products = [
  {
    id: '1',
    shopId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Pro Shortboard 6\'2"',
    brand: 'SurfPro',
    category: 'boards',
    sport: 'surf',
    price: 599.99,
    description: 'High-performance shortboard for advanced surfers',
    specifications: {
      length: '6\'2"',
      width: '19.5"',
      thickness: '2.5"',
      volume: '28.5L',
      fin_setup: 'thruster'
    },
    inventory_count: 5,
    image_url: null,
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const shop = shops.find(s => s.id === decoded.shopId);
    if (!shop) {
      return res.status(401).json({ error: 'Shop not found' });
    }
    req.shop = { id: shop.id, name: shop.name, email: shop.email };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Database health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: 'mock_connected' });
});

// Shop Authentication Routes
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const shop = shops.find(s => s.email === email);
    if (!shop) {
      console.log('Shop not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, shop.password);
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

// Shop Registration Route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    console.log('Registration attempt for:', email);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if shop already exists
    const existingShop = shops.find(s => s.email === email);
    if (existingShop) {
      return res.status(409).json({ error: 'Shop with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new shop
    const newShop = {
      id: uuidv4(),
      name,
      email,
      password: passwordHash,
      location: location || '',
      settings: {},
      createdAt: new Date().toISOString()
    };

    shops.push(newShop);

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
app.get('/api/products', (req, res) => {
  try {
    const { sport, category, shopId } = req.query;
    const authHeader = req.headers['authorization'];
    
    let filteredProducts = products;
    
    // If authenticated, show shop's products; otherwise show all public products
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        filteredProducts = products.filter(p => p.shopId === decoded.shopId);
      } catch (error) {
        // Token invalid, show all products
      }
    }

    // Apply filters
    if (sport) {
      filteredProducts = filteredProducts.filter(p => p.sport === sport);
    }
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    if (shopId) {
      filteredProducts = filteredProducts.filter(p => p.shopId === shopId);
    }

  res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { name, category, sport, price, description, specifications, inventory_count, features } = req.body;
    
    if (!name || !category || !sport || !price) {
      return res.status(400).json({ error: 'Name, category, sport, and price are required' });
    }

    // Handle uploaded image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse JSON fields if they're strings
    let parsedSpecifications = {};
    if (specifications) {
      try {
        parsedSpecifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        parsedSpecifications = {};
      }
    }

    let parsedFeatures = [];
    if (features) {
      try {
        parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        parsedFeatures = [];
      }
    }

    const newProduct = {
      id: uuidv4(),
      shopId: req.shop.id,
      name,
      category,
      sport,
      price: parseFloat(price),
      description: description || '',
      specifications: parsedSpecifications,
      inventory_count: parseInt(inventory_count) || 0,
      image_url: imageUrl,
      features: parsedFeatures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.push(newProduct);

    console.log('Product created:', newProduct.name);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id && p.shopId === req.shop.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...req.body,
      id,
      shopId: req.shop.id,
      updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;

    console.log('Product updated:', updatedProduct.name);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id && p.shopId === req.shop.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products[productIndex];
    products.splice(productIndex, 1);

    console.log('Product deleted:', deletedProduct.name);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Recommendations API
app.post('/api/recommendations', (req, res) => {
  try {
    const { sport, category, formData } = req.body;
    
    // Simple mock recommendation logic
    const relevantProducts = products.filter(p => 
      p.sport === sport && p.category === category && p.inventory_count > 0
    );

    // Sort by price (simple recommendation logic)
    const recommendations = relevantProducts
      .sort((a, b) => a.price - b.price)
      .slice(0, 3)
      .map(product => ({
        ...product,
        matchScore: Math.floor(Math.random() * 30) + 70, // Mock match score 70-100
        reason: `Great choice for ${formData.experience || 'your'} level`
      }));

    console.log(`Generated ${recommendations.length} recommendations for ${sport} ${category}`);
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics API
app.get('/api/analytics/overview', authenticateToken, (req, res) => {
  try {
    const shopProducts = products.filter(p => p.shopId === req.shop.id);
    const totalProducts = shopProducts.length;
    const totalInventory = shopProducts.reduce((sum, p) => sum + (p.inventory_count || 0), 0);
    const averagePrice = shopProducts.length > 0 
      ? shopProducts.reduce((sum, p) => sum + p.price, 0) / shopProducts.length 
      : 0;

    const analytics = {
      totalProducts,
      totalInventory,
      customerSessions: Math.floor(Math.random() * 100) + 50,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      categoryBreakdown: {
        boards: shopProducts.filter(p => p.category === 'boards').length,
        wetsuits: shopProducts.filter(p => p.category === 'wetsuits').length,
        fins: shopProducts.filter(p => p.category === 'fins').length,
        snowboards: shopProducts.filter(p => p.category === 'snowboards').length,
        skis: shopProducts.filter(p => p.category === 'skis').length,
        boots: shopProducts.filter(p => p.category === 'boots').length,
        decks: shopProducts.filter(p => p.category === 'decks').length,
        trucks: shopProducts.filter(p => p.category === 'trucks').length,
        wheels: shopProducts.filter(p => p.category === 'wheels').length
      },
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
app.get('/api/shop/settings', authenticateToken, (req, res) => {
  try {
    const shop = shops.find(s => s.id === req.shop.id);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

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

app.put('/api/shop/settings', authenticateToken, (req, res) => {
  try {
    const { name, location, settings } = req.body;
    const shopIndex = shops.findIndex(s => s.id === req.shop.id);
    
    if (shopIndex === -1) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    shops[shopIndex] = {
      ...shops[shopIndex],
      name: name || shops[shopIndex].name,
      location: location || shops[shopIndex].location,
      settings: settings || shops[shopIndex].settings,
      updatedAt: new Date().toISOString()
    };

    const shop = shops[shopIndex];
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 trust. mock server running on port ${PORT}`);
  console.log(`💾 Using in-memory data storage (no PostgreSQL required)`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}`);
  console.log(`🔐 Default login: admin@waveriders.com / password`);
  console.log(`✅ Ready to accept shop registrations!`);
});
