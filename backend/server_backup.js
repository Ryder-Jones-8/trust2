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
  if (req.headers.authorization) {
    console.log('Authorization header present:', req.headers.authorization.substring(0, 20) + '...');
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
    inStock: true,
    quantity: 6,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    shopId: '1',
    name: 'Freestyle Park Board',
    brand: 'ParkRiders',
    category: 'snowboards',
    sport: 'ski',
    price: 389,
    description: 'Snowboard designed for freestyle and park riding',
    features: ['True twin shape', 'Soft flex', 'Perfect for freestyle', 'Park optimized'],
    inStock: true,
    quantity: 4,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    shopId: '1',
    name: 'Comfort Snowboard Boots',
    brand: 'BootMaster',
    category: 'snowboard boots',
    sport: 'ski',
    price: 279,
    description: 'Comfortable snowboard boots for all-day riding',
    features: ['BOA lacing system', 'Heat moldable liner', 'Medium flex', 'All-day comfort'],
    inStock: true,
    quantity: 10,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    shopId: '1',
    name: 'Street Skateboard Deck',
    brand: 'StreetPro',
    category: 'decks',
    sport: 'skate',
    price: 59,
    description: 'High-quality maple skateboard deck for street skating',
    features: ['7-ply maple construction', '8.0" width', 'Perfect for street skating', 'Durable construction'],
    inStock: true,
    quantity: 15,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    shopId: '1',
    name: 'Beginner Complete Skateboard',
    brand: 'EasySkate',
    category: 'decks',
    sport: 'skate',
    price: 89,
    description: 'Complete skateboard setup perfect for beginners',    features: ['Complete setup', 'Beginner friendly', 'Quality components', 'Ready to ride'],
    inStock: true,
    quantity: 8,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Products for Mountain Peak Ski Shop (shopId: '2')
  {
    id: '11',
    shopId: '2',
    name: 'Advanced Carving Skis',
    brand: 'AlpinePro',
    category: 'skis',
    sport: 'ski',
    price: 699,
    description: 'High-performance carving skis for advanced skiers who love groomed runs',
    features: ['172cm length', 'Carbon fiber core', 'Racing edge', 'Advanced performance', 'Precision carving'],
    inStock: true,
    quantity: 6,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '12',
    shopId: '2',
    name: 'Beginner All-Mountain Skis',
    brand: 'EasySlope',
    category: 'skis',
    sport: 'ski',
    price: 349,
    description: 'Perfect skis for beginners learning on all types of terrain',
    features: ['160cm length', 'Forgiving flex', 'All-mountain design', 'Beginner friendly', 'Easy to turn'],
    inStock: true,
    quantity: 12,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '13',
    shopId: '2',
    name: 'Freestyle Park Snowboard',
    brand: 'ParkMaster',
    category: 'snowboards',
    sport: 'ski',
    price: 429,
    description: 'Dedicated freestyle snowboard designed for park and pipe riding',
    features: ['True twin shape', 'Soft flex', 'Park optimized', 'Freestyle focused', 'Jib friendly'],
    inStock: true,
    quantity: 8,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  console.log('🔐 Auth check for:', req.method, req.path);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('📝 Auth header present:', !!authHeader);
  console.log('🎫 Token extracted:', !!token);

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, shop) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token verified for shop:', shop.shopId);
    req.shop = shop;
    next();
  });
};

// Routes

// Shop Authentication
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const shop = shops.find(s => s.email === email);
    if (!shop) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, shop.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { shopId: shop.id, email: shop.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    res.status(500).json({ error: 'Server error' });
  }
});

// Register new shop
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    
    const existingShop = shops.find(s => s.email === email);
    if (existingShop) {
      return res.status(400).json({ error: 'Shop already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newShop = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      location,
      createdAt: new Date().toISOString()
    };

    shops.push(newShop);

    const token = jwt.sign(
      { shopId: newShop.id, email: newShop.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shop profile
app.get('/api/shop/profile', authenticateToken, (req, res) => {
  const shop = shops.find(s => s.id === req.shop.shopId);
  if (!shop) {
    return res.status(404).json({ error: 'Shop not found' });
  }

  res.json({
    id: shop.id,
    name: shop.name,
    email: shop.email,
    location: shop.location,
    createdAt: shop.createdAt
  });
});

// Product Management

// Get all products for a shop
app.get('/api/products', authenticateToken, (req, res) => {
  const shopProducts = products.filter(p => p.shopId === req.shop.shopId);
  res.json(shopProducts);
});

// Get products by sport and category (public endpoint for customers)
app.get('/api/products/public/:sport/:category', (req, res) => {
  const { sport, category } = req.params;
  const filteredProducts = products.filter(p => 
    p.sport === sport && 
    p.category === category && 
    p.inStock
  );
  res.json(filteredProducts);
});

// Add new product
app.post('/api/products', authenticateToken, upload.single('image'), (req, res) => {
  console.log('📝 Add Product Request:', {
    body: req.body,
    files: req.file,
    shop: req.shop,
    headers: req.headers
  });
  
  try {
    const {
      name,
      brand,
      category,
      sport,
      price,
      description,
      features,
      quantity,
      specifications
    } = req.body;

    console.log('🔍 Extracted fields:', { name, brand, category, sport, price, description, features, quantity, specifications });

    // Validation
    if (!name || !category || !sport || !price || !quantity) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, sport, price, and quantity are required',
        received: { name, category, sport, price, quantity }
      });
    }

    const newProduct = {
      id: uuidv4(),
      shopId: req.shop.shopId,
      name,
      brand: brand || '',
      category,
      sport,
      price: parseFloat(price),
      description: description || '',
      features: Array.isArray(features) ? features : (features ? JSON.parse(features) : []),
      inStock: parseInt(quantity) > 0,
      quantity: parseInt(quantity),
      image: req.file ? req.file.filename : null,
      specifications: specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()    };

    console.log('✅ Creating product:', newProduct);
    products.push(newProduct);
    console.log(`📊 Total products now: ${products.length}`);
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Error adding product:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Update product
app.put('/api/products/:id', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const productId = req.params.id;
    const productIndex = products.findIndex(p => 
      p.id === productId && p.shopId === req.shop.shopId
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }    const {
      name,
      brand,
      category,
      sport,
      price,
      description,
      features,
      quantity,
      specifications
    } = req.body;

    products[productIndex] = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      brand: brand || products[productIndex].brand,
      category: category || products[productIndex].category,
      sport: sport || products[productIndex].sport,
      price: price ? parseFloat(price) : products[productIndex].price,
      description: description || products[productIndex].description,
      features: features ? (Array.isArray(features) ? features : JSON.parse(features)) : products[productIndex].features,
      quantity: quantity ? parseInt(quantity) : products[productIndex].quantity,
      inStock: quantity ? parseInt(quantity) > 0 : products[productIndex].inStock,
      image: req.file ? req.file.filename : products[productIndex].image,
      specifications: specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : products[productIndex].specifications,
      updatedAt: new Date().toISOString()
    };

    res.json(products[productIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
app.delete('/api/products/:id', authenticateToken, (req, res) => {
  const productId = req.params.id;
  const productIndex = products.findIndex(p => 
    p.id === productId && p.shopId === req.shop.shopId
  );

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

// Analytics endpoints
app.get('/api/analytics/overview', authenticateToken, (req, res) => {
  const shopProducts = products.filter(p => p.shopId === req.shop.shopId);
  
  const analytics = {
    totalProducts: shopProducts.length,
    inStockProducts: shopProducts.filter(p => p.inStock).length,
    outOfStockProducts: shopProducts.filter(p => !p.inStock).length,
    totalValue: shopProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    categoryBreakdown: {}
  };

  // Category breakdown
  shopProducts.forEach(product => {
    const key = `${product.sport}-${product.category}`;
    if (!analytics.categoryBreakdown[key]) {
      analytics.categoryBreakdown[key] = { count: 0, value: 0 };
    }
    analytics.categoryBreakdown[key].count++;
    analytics.categoryBreakdown[key].value += product.price * product.quantity;
  });
  res.json(analytics);
});

// Get product recommendations based on user preferences
app.post('/api/recommendations', (req, res) => {
  try {
    const { sport, category, formData, shopId } = req.body;
    
    console.log('\n=== RECOMMENDATIONS API DEBUG ===');
    console.log('Request parameters:');
    console.log('- Sport:', sport);
    console.log('- Category:', category);
    console.log('- ShopId:', shopId);
    console.log('- FormData:', JSON.stringify(formData, null, 2));
    
    if (!sport || !category) {
      return res.status(400).json({ error: 'Sport and category are required' });
    }

    // Debug: Show all available products
    console.log('\n=== ALL AVAILABLE PRODUCTS ===');
    console.log('Total products in system:', products.length);
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - Sport: "${p.sport}", Category: "${p.category}", InStock: ${p.inStock}, Qty: ${p.quantity}`);
    });

    // Find products matching the sport and category from the specified shop (or all shops if no shopId)
    let matchingProducts = products.filter(p => 
      p.sport === sport && 
      p.category === category && 
      p.inStock && 
      p.quantity > 0 &&
      (shopId ? p.shopId === shopId : true) // Filter by shopId if provided
    );

    console.log('\n=== FILTERING RESULTS ===');
    console.log('Matching products found:', matchingProducts.length);
    matchingProducts.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} - Sport: "${p.sport}", Category: "${p.category}"`);
    });

    // Apply enhanced filtering/scoring logic based on form data
    const scoredProducts = matchingProducts.map(product => {
      let score = 75; // Base score
      
      // Enhanced scoring logic using product description and features
      if (formData) {
        // Experience level matching
        if (formData.experience === 'Beginner' && (
          product.features.some(f => 
            f.toLowerCase().includes('beginner') || 
            f.toLowerCase().includes('easy') || 
            f.toLowerCase().includes('stable') ||
            f.toLowerCase().includes('forgiving')
          ) ||
          product.description.toLowerCase().includes('beginner') ||
          product.description.toLowerCase().includes('learning') ||
          product.description.toLowerCase().includes('easy')
        )) {
          score += 20;
        }
        
        if (formData.experience === 'Intermediate' && (
          product.features.some(f => 
            f.toLowerCase().includes('intermediate') || 
            f.toLowerCase().includes('versatile') ||
            f.toLowerCase().includes('all-mountain') ||
            f.toLowerCase().includes('progressive')
          ) ||
          product.description.toLowerCase().includes('intermediate') ||
          product.description.toLowerCase().includes('versatile')
        )) {
          score += 20;
        }
        
        if (formData.experience === 'Advanced' && (
          product.features.some(f => 
            f.toLowerCase().includes('advanced') || 
            f.toLowerCase().includes('pro') || 
            f.toLowerCase().includes('performance') ||
            f.toLowerCase().includes('precision') ||
            f.toLowerCase().includes('aggressive')
          ) ||
          product.description.toLowerCase().includes('advanced') ||
          product.description.toLowerCase().includes('professional') ||
          product.description.toLowerCase().includes('performance')
        )) {
          score += 20;
        }
        
        // Style/type matching
        if (formData.ridingStyle && (
          product.features.some(f => 
            f.toLowerCase().includes(formData.ridingStyle.toLowerCase())
          ) ||
          product.description.toLowerCase().includes(formData.ridingStyle.toLowerCase())
        )) {
          score += 15;
        }
        
        if (formData.surfStyle && (
          product.features.some(f => 
            f.toLowerCase().includes(formData.surfStyle.toLowerCase())
          ) ||
          product.description.toLowerCase().includes(formData.surfStyle.toLowerCase())
        )) {
          score += 15;
        }

        // Size matching (if provided)
        if (formData.height && product.features.some(f => 
          f.toLowerCase().includes('length') || f.toLowerCase().includes('size')
        )) {
          score += 5;
        }

        // Weather/condition matching
        if (formData.waveType && (
          product.features.some(f => 
            f.toLowerCase().includes(formData.waveType.toLowerCase())
          ) ||
          product.description.toLowerCase().includes(formData.waveType.toLowerCase())
        )) {
          score += 10;
        }        // Additional form field matching
        Object.keys(formData).forEach(key => {
          const value = formData[key];
          if (typeof value === 'string' && value.length > 0) {
            if (product.description.toLowerCase().includes(value.toLowerCase()) ||
                product.features.some(f => f.toLowerCase().includes(value.toLowerCase()))) {
              score += 5;
            }
          }
        });        // Specifications-based matching
        if (product.specifications) {
          const specs = product.specifications;
          
          // Height matching for wetsuits (using helper function for imperial)
          if (formData.height && specs.heightRange) {
            const height = parseHeight(formData.height);
            if (height && height >= specs.heightRange.min && height <= specs.heightRange.max) {
              score += 25; // High score for exact fit
            }
          }
          
          // Weight matching for wetsuits and ski equipment (using helper function)
          if (formData.weight && (specs.weightRange || specs.weightCapacityRange)) {
            const weight = parseWeight(formData.weight);
            const weightRange = specs.weightRange || specs.weightCapacityRange;
            if (weight && weight >= weightRange.min && weight <= weightRange.max) {
              score += 25; // High score for exact fit
            }
          }
          
          // Chest size matching for wetsuits (using helper function)
          if (formData.chestSize && specs.chestSizeRange) {
            const chestSize = parseChestSize(formData.chestSize);
            if (chestSize && chestSize >= specs.chestSizeRange.min && chestSize <= specs.chestSizeRange.max) {
              score += 20;
            }
          }
          
          // Water temperature matching for wetsuits
          if (formData.waterTemp && specs.waterTempRange) {
            const waterTemp = parseTemperature(formData.waterTemp);
            if (waterTemp && waterTemp >= specs.waterTempRange.min && waterTemp <= specs.waterTempRange.max) {
              score += 20;
            }
          }
          
          // Thickness matching for wetsuits
          if (formData.thickness && specs.thicknessOptions) {
            if (specs.thicknessOptions.includes(formData.thickness)) {
              score += 15;
            }
          }
          
          // Board length matching for ski/snowboard
          if (formData.boardLength && specs.lengthRange) {
            const boardLength = parseFloat(formData.boardLength);
            if (boardLength >= specs.lengthRange.min && boardLength <= specs.lengthRange.max) {
              score += 20;
            }
          }
          
          // Experience level matching from specifications
          if (formData.experience && specs.experienceLevel) {
            if (specs.experienceLevel.includes(formData.experience)) {
              score += 20;
            }
          }
          
          // Riding style matching from specifications
          if (formData.ridingStyle && specs.ridingStyleOptions) {
            if (specs.ridingStyleOptions.includes(formData.ridingStyle)) {
              score += 15;
            }
          }
          
          // Deck width matching for skateboards
          if (formData.deckWidth && specs.deckWidthRange) {
            const deckWidth = parseFloat(formData.deckWidth);
            if (deckWidth >= specs.deckWidthRange.min && deckWidth <= specs.deckWidthRange.max) {
              score += 15;
            }
          }
          
          // Head circumference matching for helmets
          if (formData.headCircumference && specs.headCircumferenceRange) {
            const headSize = parseFloat(formData.headCircumference);
            if (headSize >= specs.headCircumferenceRange.min && headSize <= specs.headCircumferenceRange.max) {
              score += 25;
            }
          }
          
          // Shoe size matching for boots
          if (formData.shoeSize && specs.sizeOptions) {
            if (specs.sizeOptions.includes(formData.shoeSize.toString())) {
              score += 20;
            }
          }
        }
      }
      
      // Ensure score doesn't exceed 100
      score = Math.min(score, 100);
      
      return {
        ...product,
        score,
        matchReasons: generateMatchReasons(product, formData)
      };
    });    // Sort by score (highest first) and limit results
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    console.log('\n=== FINAL RECOMMENDATIONS ===');
    console.log('Final recommendations count:', recommendations.length);
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.name} - Score: ${rec.score}%, Reasons: ${rec.matchReasons?.join(', ') || 'None'}`);
    });
    console.log('=== END RECOMMENDATIONS DEBUG ===\n');

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to parse height in feet/inches format (e.g., "5'10\"" or "5.83")
function parseHeight(heightStr) {
  if (!heightStr) return null;
  
  // Handle feet'inches" format (e.g., "5'10\"")
  const feetInchesMatch = heightStr.match(/(\d+)'(\d+)"/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1]);
    const inches = parseInt(feetInchesMatch[2]);
    return feet + (inches / 12); // Convert to decimal feet
  }
  
  // Handle decimal feet format (e.g., "5.83")
  const decimalMatch = heightStr.match(/(\d+\.?\d*)/);
  if (decimalMatch) {
    return parseFloat(decimalMatch[1]);
  }
  
  return null;
}

// Helper function to parse weight in lbs format
function parseWeight(weightStr) {
  if (!weightStr) return null;
  
  const weightMatch = weightStr.match(/(\d+\.?\d*)/);
  if (weightMatch) {
    return parseFloat(weightMatch[1]);
  }
  
  return null;
}

// Helper function to parse chest size in inches
function parseChestSize(chestStr) {
  if (!chestStr) return null;
  
  const chestMatch = chestStr.match(/(\d+\.?\d*)/);
  if (chestMatch) {
    return parseFloat(chestMatch[1]);
  }
  
  return null;
}

// Helper function to parse temperature ranges
function parseTemperature(tempStr) {
  if (!tempStr) return null;
  
  const tempMatch = tempStr.match(/(\d+\.?\d*)/);
  if (tempMatch) {
    return parseFloat(tempMatch[1]);
  }
  
  return null;
}

// Helper function to generate match reasons
function generateMatchReasons(product, formData) {
  const reasons = [];
  
  if (!formData) return ['Great product for your needs'];
  
  // Experience level matching
  if (formData.experience === 'Beginner' && (
    product.features.some(f => 
      f.toLowerCase().includes('beginner') || 
      f.toLowerCase().includes('easy') ||
      f.toLowerCase().includes('stable') ||
      f.toLowerCase().includes('forgiving')
    ) ||
    product.description.toLowerCase().includes('beginner') ||
    product.description.toLowerCase().includes('learning') ||
    product.description.toLowerCase().includes('easy')
  )) {
    reasons.push('Perfect for beginners');
  }
  
  if (formData.experience === 'Intermediate' && (
    product.features.some(f => 
      f.toLowerCase().includes('intermediate') || 
      f.toLowerCase().includes('versatile') ||
      f.toLowerCase().includes('all-mountain')
    ) ||
    product.description.toLowerCase().includes('intermediate') ||
    product.description.toLowerCase().includes('versatile')
  )) {
    reasons.push('Great for intermediate level');
  }
  
  if (formData.experience === 'Advanced' && (
    product.features.some(f => 
      f.toLowerCase().includes('advanced') || 
      f.toLowerCase().includes('pro') ||
      f.toLowerCase().includes('performance')
    ) ||
    product.description.toLowerCase().includes('advanced') ||
    product.description.toLowerCase().includes('professional') ||
    product.description.toLowerCase().includes('performance')
  )) {
    reasons.push('Designed for advanced users');
  }

  // Style matching
  if (formData.ridingStyle && (
    product.features.some(f => f.toLowerCase().includes(formData.ridingStyle.toLowerCase())) ||
    product.description.toLowerCase().includes(formData.ridingStyle.toLowerCase())
  )) {
    reasons.push(`Perfect for ${formData.ridingStyle.toLowerCase()} style`);
  }

  if (formData.surfStyle && (
    product.features.some(f => f.toLowerCase().includes(formData.surfStyle.toLowerCase())) ||
    product.description.toLowerCase().includes(formData.surfStyle.toLowerCase())
  )) {
    reasons.push(`Ideal for ${formData.surfStyle.toLowerCase()} surfing`);
  }

  // Wave conditions matching
  if (formData.waveType && (
    product.features.some(f => f.toLowerCase().includes(formData.waveType.toLowerCase())) ||
    product.description.toLowerCase().includes(formData.waveType.toLowerCase())
  )) {
    reasons.push(`Great for ${formData.waveType.toLowerCase()} waves`);
  }

  // Quality indicators
  if (product.features.some(f => 
    f.toLowerCase().includes('durable') || 
    f.toLowerCase().includes('quality') ||
    f.toLowerCase().includes('premium')
  )) {
    reasons.push('High-quality construction');
  }
  // Description-based insights
  if (product.description) {
    const desc = product.description.toLowerCase();
    if (desc.includes('comfort') && !reasons.some(r => r.includes('comfort'))) {
      reasons.push('Comfortable design');
    }
    if (desc.includes('lightweight') && !reasons.some(r => r.includes('lightweight'))) {
      reasons.push('Lightweight construction');
    }
    if (desc.includes('durable') && !reasons.some(r => r.includes('quality'))) {
      reasons.push('Built to last');
    }
  }
  // Specifications-based reasons
  if (product.specifications && formData) {
    const specs = product.specifications;
    
    // Size-based matching reasons (using imperial units)
    if (formData.height && specs.heightRange) {
      const height = parseHeight(formData.height);
      if (height && height >= specs.heightRange.min && height <= specs.heightRange.max) {
        reasons.push('Perfect size fit for your height');
      }
    }
    
    if (formData.weight && (specs.weightRange || specs.weightCapacityRange)) {
      const weight = parseWeight(formData.weight);
      const weightRange = specs.weightRange || specs.weightCapacityRange;
      if (weight && weight >= weightRange.min && weight <= weightRange.max) {
        reasons.push('Ideal weight compatibility');
      }
    }
    
    if (formData.waterTemp && specs.waterTempRange) {
      const waterTemp = parseTemperature(formData.waterTemp);
      if (waterTemp && waterTemp >= specs.waterTempRange.min && waterTemp <= specs.waterTempRange.max) {
        reasons.push('Perfect for your water conditions');
      }
    }
    
    if (formData.thickness && specs.thicknessOptions && specs.thicknessOptions.includes(formData.thickness)) {
      reasons.push(`Available in ${formData.thickness} thickness`);
    }
    
    if (formData.experience && specs.experienceLevel && specs.experienceLevel.includes(formData.experience)) {
      reasons.push(`Designed for ${formData.experience.toLowerCase()} riders`);
    }
    
    if (formData.shoeSize && specs.sizeOptions && specs.sizeOptions.includes(formData.shoeSize.toString())) {
      reasons.push('Available in your size');
    }
    
    if (formData.headCircumference && specs.headCircumferenceRange) {
      const headSize = parseFloat(formData.headCircumference);
      if (headSize >= specs.headCircumferenceRange.min && headSize <= specs.headCircumferenceRange.max) {
        reasons.push('Perfect head size fit');
      }
    }
  }
  
  if (reasons.length === 0) {
    reasons.push('Matches your selected category');
  }
  
  return reasons.slice(0, 3); // Limit to top 3 reasons
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Trust backend server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
