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
    }    // Get ALL products for recommendations (we'll score them instead of filtering strictly)
    let recommendationQuery = 'SELECT * FROM products WHERE sport = $1';
    const params = [sport];

    if (category) {
      recommendationQuery += ` AND category = $${params.length + 1}`;
      params.push(category);
    }

    if (shopId) {
      recommendationQuery += ` AND shop_id = $${params.length + 1}`;
      params.push(shopId);
    }

    // Only filter out items with no inventory
    recommendationQuery += ' AND inventory_count > 0 ORDER BY RANDOM() LIMIT 50'; // Get more products to score

    // Parse price range for scoring (not filtering)
    const priceRange = formData.priceRange;
    const { min: minPrice, max: maxPrice } = parsePriceRange(priceRange);    console.log('Executing query:', recommendationQuery, 'with params:', params);
    const recommendationsResult = await query(recommendationQuery, params);    
    console.log('Query returned', recommendationsResult.rows.length, 'products');
    
    // Score and categorize all products
    const scoredProducts = recommendationsResult.rows.map(product => {
      const productPrice = parseFloat(product.price);
      const matchReasons = [];
      let baseScore = 60; // Start lower for more realistic scoring
        // Experience level matching
      if (formData.experience || formData.experienceLevel) {
        const experience = formData.experience || formData.experienceLevel;
        const expLower = experience.toLowerCase();
        const productDesc = (product.description || '').toLowerCase();
        
        // Check specifications structure for experience level
        const specExpLevels = product.specifications?.experienceLevel || [];
        const hasSpecificExpLevel = specExpLevels.some(level => 
          level.toLowerCase() === expLower
        );
        
        if (hasSpecificExpLevel) {
          matchReasons.push(`Perfect match for ${experience} level`);
          baseScore += 25;
        } else {
          // Check for near matches in specifications
          const expMatchScore = {
            beginner: { intermediate: 15, advanced: 5 },
            intermediate: { beginner: 12, advanced: 18 },
            advanced: { intermediate: 12, beginner: 8, expert: 5 },
            expert: { advanced: 15, intermediate: 8 }
          };
          
          let foundNearMatch = false;
          for (const specLevel of specExpLevels) {
            const specLower = specLevel.toLowerCase();
            if (expMatchScore[expLower] && expMatchScore[expLower][specLower]) {
              const scoreBoost = expMatchScore[expLower][specLower];
              baseScore += scoreBoost;
              foundNearMatch = true;
              
              if (expLower === 'beginner' && specLower === 'intermediate') {
                matchReasons.push('Designed for intermediate but beginner-friendly');
              } else if (expLower === 'intermediate' && specLower === 'beginner') {
                matchReasons.push('Beginner-focused but you\'re ready for this');
              } else if (expLower === 'intermediate' && specLower === 'advanced') {
                matchReasons.push('Advanced features to grow into');
              } else if (expLower === 'advanced' && specLower === 'intermediate') {
                matchReasons.push('Reliable choice, less aggressive than some advanced options');
              }
              break;
            }
          }
          
          if (!foundNearMatch) {
            // Fallback to description check
            if (productDesc.includes(expLower)) {
              matchReasons.push(`Good match for ${experience} level`);
              baseScore += 15;
            } else {
              matchReasons.push('Experience level match to be verified');
              baseScore += 5;
            }
          }
        }
      }
      
      // Price range matching with detailed explanations
      if (priceRange && priceRange !== 'No preference') {
        const isInRange = productPrice >= minPrice && (maxPrice === Infinity || productPrice <= maxPrice);
        
        if (isInRange) {
          matchReasons.push('Fits perfectly in your price range');
          baseScore += 15;
        } else {
          // Explain how far outside the range and why it might still be worth considering
          const priceDiff = productPrice < minPrice ? minPrice - productPrice : productPrice - maxPrice;
          const percentDiff = Math.round((priceDiff / (maxPrice === Infinity ? minPrice : (minPrice + maxPrice) / 2)) * 100);
          
          if (productPrice < minPrice) {
            if (percentDiff <= 30) {
              matchReasons.push(`Slightly under your budget ($${priceDiff.toFixed(0)} less) - great value`);
              baseScore += 8;
            } else {
              matchReasons.push(`Well under budget - may lack some premium features`);
              baseScore += 5;
            }
          } else if (maxPrice !== Infinity) {
            if (percentDiff <= 20) {
              matchReasons.push(`Slightly over budget ($${priceDiff.toFixed(0)} more) but has premium features`);
              baseScore += 5;
            } else if (percentDiff <= 40) {
              matchReasons.push(`${percentDiff}% over budget but offers significant upgrades`);
              baseScore += 2;
            } else {
              matchReasons.push(`Significantly over budget but top-tier quality`);
              baseScore -= 5;
            }
          }
        }
      }
        // Style/type matching using specifications
      const userStyles = [formData.ridingStyle, formData.surfStyle, formData.skateStyle, formData.boardType, formData.terrainPreference]
        .filter(Boolean);
      
      if (userStyles.length > 0) {
        const productDesc = (product.description || '').toLowerCase();
        const specRidingStyles = product.specifications?.ridingStyleOptions || [];
        
        let perfectStyleMatch = false;
        let nearStyleMatch = false;
        
        for (const userStyle of userStyles) {
          const userStyleLower = userStyle.toLowerCase();
          
          // Check for exact match in specifications
          const hasExactMatch = specRidingStyles.some(style => 
            style.toLowerCase() === userStyleLower || 
            style.toLowerCase().includes(userStyleLower) ||
            userStyleLower.includes(style.toLowerCase())
          );
          
          if (hasExactMatch) {
            matchReasons.push(`Perfect match for ${userStyle} style`);
            baseScore += 20;
            perfectStyleMatch = true;
            break;
          }
          
          // Check for description match
          if (productDesc.includes(userStyleLower)) {
            matchReasons.push(`Great for ${userStyle} riding`);
            baseScore += 15;
            perfectStyleMatch = true;
            break;
          }
        }
        
        if (!perfectStyleMatch) {
          // Check for versatile/all-mountain options as good alternatives
          const isVersatile = specRidingStyles.some(style => 
            style.toLowerCase().includes('all') || 
            style.toLowerCase().includes('versatile') || 
            style.toLowerCase().includes('general')
          ) || productDesc.includes('all-mountain') || productDesc.includes('versatile');
          
          if (isVersatile) {
            matchReasons.push('Versatile design works for multiple riding styles');
            baseScore += 12;
            nearStyleMatch = true;
          } else if (specRidingStyles.length > 0) {
            matchReasons.push(`Different style (${specRidingStyles[0]}) but could expand your versatility`);
            baseScore += 5;
          }
        }
        
        if (!perfectStyleMatch && !nearStyleMatch && specRidingStyles.length === 0) {
          matchReasons.push('Style preferences to be verified');
          baseScore += 3;
        }
      }        // Enhanced size and physical compatibility matching
      if (formData.height || formData.weight || formData.footLength) {
        let sizeMatches = 0;
        let totalSizeChecks = 0;
        
        const heightInches = parseHeight(formData.height);
        const weightLbs = parseWeight(formData.weight);
        
        // Snowboard length matching based on rider characteristics
        if (product.category === 'snowboards' && heightInches && product.specifications?.lengthRange) {
          totalSizeChecks++;
          const recommendedLength = calculateSnowboardLength(
            heightInches,
            weightLbs,
            formData.ridingStyle,
            formData.experience
          );
          
          if (recommendedLength) {
            // Check if any board size in the range is suitable
            const minLength = product.specifications.lengthRange.min;
            const maxLength = product.specifications.lengthRange.max;
            
            // Check if recommended length falls within the product's available range
            if (recommendedLength >= minLength - 3 && recommendedLength <= maxLength + 3) {
              sizeMatches++;
              const reason = generateSizeMatchReason(
                (minLength + maxLength) / 2, // Average of available range
                recommendedLength,
                'snowboard'
              );
              if (reason) {
                matchReasons.push(reason);
                // Give higher scores for perfect matches
                if (Math.abs(((minLength + maxLength) / 2) - recommendedLength) <= 2) {
                  baseScore += 25;
                } else if (Math.abs(((minLength + maxLength) / 2) - recommendedLength) <= 5) {
                  baseScore += 18;
                } else {
                  baseScore += 12;
                }
              }
            } else {
              const avgBoardLength = (minLength + maxLength) / 2;
              const diff = Math.abs(avgBoardLength - recommendedLength);
              if (diff <= 8) {
                matchReasons.push(`Snowboard length workable but not optimal for your height`);
                baseScore += 5;
              } else {
                matchReasons.push(`Snowboard length may not be ideal for your measurements`);
                baseScore += 2;
              }
            }
          }
        }
          // Surfboard length matching based on rider characteristics
        else if (product.category === 'boards' && product.sport === 'surf' && heightInches && weightLbs && product.specifications?.lengthRange) {
          totalSizeChecks++;
          const recommendedLength = calculateSurfboardLength(
            heightInches,
            weightLbs,
            formData.experience,
            formData.surfStyle
          );
          
          if (recommendedLength) {
            // Convert inches to cm for comparison (assuming lengthRange is in cm)
            const recommendedLengthCm = recommendedLength * 2.54;
            const minLength = product.specifications.lengthRange.min;
            const maxLength = product.specifications.lengthRange.max;
            
            if (recommendedLengthCm >= minLength - 8 && recommendedLengthCm <= maxLength + 8) {
              sizeMatches++;
              const reason = generateSizeMatchReason(
                (minLength + maxLength) / 2,
                recommendedLengthCm,
                'surfboard'
              );
              if (reason) {
                matchReasons.push(reason);
                // Give higher scores for perfect matches
                if (Math.abs(((minLength + maxLength) / 2) - recommendedLengthCm) <= 5) {
                  baseScore += 25;
                } else if (Math.abs(((minLength + maxLength) / 2) - recommendedLengthCm) <= 10) {
                  baseScore += 18;
                } else {
                  baseScore += 12;
                }
              }
            } else {
              matchReasons.push(`Surfboard length may not be optimal for your height and style`);
              baseScore += 5;
            }
          }
        }
        
        // Skateboard deck width matching based on rider characteristics
        else if (product.category === 'decks' && product.sport === 'skate' && product.specifications?.deckWidthRange) {
          totalSizeChecks++;
          const recommendedWidth = calculateSkateboardDeckWidth(
            formData.shoeSize,
            formData.ridingStyle || formData.skateStyle,
            formData.height
          );
          
          if (recommendedWidth) {
            const minWidth = product.specifications.deckWidthRange.min;
            const maxWidth = product.specifications.deckWidthRange.max;
            
            if (recommendedWidth >= minWidth - 0.25 && recommendedWidth <= maxWidth + 0.25) {
              sizeMatches++;
              const reason = generateSizeMatchReason(
                (minWidth + maxWidth) / 2,
                recommendedWidth,
                'skateboard'
              );
              if (reason) {
                matchReasons.push(reason);
                // Give higher scores for perfect matches
                if (Math.abs(((minWidth + maxWidth) / 2) - recommendedWidth) <= 0.125) {
                  baseScore += 25;
                } else if (Math.abs(((minWidth + maxWidth) / 2) - recommendedWidth) <= 0.25) {
                  baseScore += 18;
                } else {
                  baseScore += 12;
                }
              }
            } else {
              const avgWidth = (minWidth + maxWidth) / 2;
              const diff = Math.abs(avgWidth - recommendedWidth);
              if (diff <= 0.5) {
                matchReasons.push(`Deck width workable but not optimal for your shoe size`);
                baseScore += 5;
              } else {
                matchReasons.push(`Deck width may not be ideal for your measurements`);
                baseScore += 2;
              }
            }
          }
        }
        
        // Helmet sizing based on head circumference
        else if ((product.category === 'helmets') && formData.headCircumference && product.specifications?.headCircumferenceRange) {
          totalSizeChecks++;
          const recommendedSize = calculateHelmetSize(formData.headCircumference);
          
          // Parse head circumference to inches for range comparison
          let headInches;
          const str = formData.headCircumference.toString().toLowerCase();
          if (str.includes('cm')) {
            headInches = parseFloat(str.replace(/[^\d.]/g, '')) / 2.54;
          } else {
            headInches = parseFloat(str.replace(/[^\d.]/g, ''));
          }
          
          if (headInches && product.specifications.headCircumferenceRange) {
            const minCirc = product.specifications.headCircumferenceRange.min;
            const maxCirc = product.specifications.headCircumferenceRange.max;
            
            if (headInches >= minCirc && headInches <= maxCirc) {
              sizeMatches++;
              matchReasons.push(`Perfect helmet fit for ${recommendedSize} head circumference`);
              baseScore += 25;
            } else {
              const diff = headInches < minCirc ? minCirc - headInches : headInches - maxCirc;
              if (diff <= 0.5) {
                matchReasons.push(`Close helmet fit, may work with padding adjustment`);
                baseScore += 12;
              } else {
                matchReasons.push(`Helmet size may not be optimal for your head circumference`);
                baseScore += 5;
              }
            }
          }
        }
        
        // Wetsuit sizing based on height, weight, and chest measurements
        else if (product.category === 'wetsuits' && heightInches && weightLbs && product.specifications?.sizeOptions) {
          totalSizeChecks++;
          const recommendedSize = calculateWetsuitSize(
            formData.height,
            formData.weight,
            formData.chestSize
          );
          
          if (recommendedSize && product.specifications.sizeOptions.includes(recommendedSize)) {
            sizeMatches++;
            matchReasons.push(`Perfect wetsuit size (${recommendedSize}) for your measurements`);
            baseScore += 25;
          } else if (recommendedSize) {
            // Check for adjacent sizes
            const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            const recIndex = sizes.indexOf(recommendedSize);
            const hasAdjacentSize = product.specifications.sizeOptions.some(size => {
              const sizeIndex = sizes.indexOf(size);
              return Math.abs(sizeIndex - recIndex) <= 1;
            });
            
            if (hasAdjacentSize) {
              matchReasons.push(`Close wetsuit size available, may fit with slight adjustment`);
              baseScore += 15;
            } else {
              matchReasons.push(`Wetsuit size may not be optimal for your measurements`);
              baseScore += 5;
            }
          }
        }
        
        // Generic height matching for other board types
        else if (formData.height && product.specifications?.lengthRange) {
          totalSizeChecks++;
          const heightInInches = heightInches || parseFloat(formData.height.replace(/[^\d.]/g, ''));
          const lengthRange = product.specifications.lengthRange;
          if (heightInInches >= lengthRange.min && heightInInches <= lengthRange.max) {
            sizeMatches++;
            matchReasons.push('Perfect length for your height');
            baseScore += 15;
          } else {
            const diff = heightInInches < lengthRange.min ? 
              lengthRange.min - heightInInches : heightInInches - lengthRange.max;
            if (diff <= 2) {
              matchReasons.push('Length slightly off but still workable');
              baseScore += 8;
            } else {
              matchReasons.push('Length not optimal for your height');
              baseScore += 2;
            }
          }
        }
        
        // Weight matching
        if (formData.weight && product.specifications?.weightCapacityRange) {
          totalSizeChecks++;
          const weightInLbs = weightLbs || parseFloat(formData.weight.replace(/[^\d.]/g, ''));
          const weightRange = product.specifications.weightCapacityRange;
          if (weightInLbs >= weightRange.min && weightInLbs <= weightRange.max) {
            sizeMatches++;
            matchReasons.push('Perfect weight capacity match');
            baseScore += 15;
          } else {
            if (weightInLbs < weightRange.min) {
              matchReasons.push('Designed for heavier riders but will work');
              baseScore += 8;
            } else {
              matchReasons.push('May be on the edge of weight capacity');
              baseScore += 5;
            }
          }
        }
          // If no specific size data available
        if (totalSizeChecks === 0) {
          matchReasons.push('Size compatibility to be verified in store');
          baseScore += 3;
        }
      }
      
      // Sport-specific feature matching
      const productDesc = (product.description || '').toLowerCase();
      const productFeatures = product.specifications?.features || [];
      
      if (product.sport === 'ski') {
        // Terrain preference matching for ski equipment
        if (formData.terrainPreference) {
          const terrain = formData.terrainPreference.toLowerCase();
          const terrainMatches = {
            'groomed': ['groomed', 'carving', 'piste', 'on-piste'],
            'powder': ['powder', 'off-piste', 'backcountry', 'deep snow'],
            'park': ['park', 'freestyle', 'terrain park', 'pipe'],
            'all-mountain': ['all-mountain', 'versatile', 'all-terrain']
          };
          
          const relevantTerms = terrainMatches[terrain] || [];
          const hasTerrainMatch = relevantTerms.some(term => 
            productDesc.includes(term) || 
            productFeatures.some(feature => feature.toLowerCase().includes(term))
          );
          
          if (hasTerrainMatch) {
            matchReasons.push(`Designed for ${formData.terrainPreference} terrain`);
            baseScore += 15;
          }
        }
        
        // Temperature/conditions matching
        if (formData.conditions) {
          const conditions = formData.conditions.toLowerCase();
          if (conditions.includes('cold') && (productDesc.includes('warm') || productDesc.includes('insulated'))) {
            matchReasons.push('Good warmth for cold conditions');
            baseScore += 10;
          } else if (conditions.includes('wet') && (productDesc.includes('waterproof') || productDesc.includes('gore-tex'))) {
            matchReasons.push('Waterproof protection for wet conditions');
            baseScore += 10;
          }
        }
      } else if (product.sport === 'surf') {
        // Wave conditions matching
        if (formData.waveConditions) {
          const waves = formData.waveConditions.toLowerCase();
          const waveMatches = {
            'small': ['small wave', 'groveler', 'summer', 'longboard'],
            'medium': ['all-around', 'versatile', 'daily driver'],
            'large': ['big wave', 'gun', 'step-up', 'charger'],
            'powerful': ['performance', 'high performance', 'responsive']
          };
          
          const relevantTerms = waveMatches[waves] || [];
          const hasWaveMatch = relevantTerms.some(term => 
            productDesc.includes(term) || 
            productFeatures.some(feature => feature.toLowerCase().includes(term))
          );
          
          if (hasWaveMatch) {
            matchReasons.push(`Perfect for ${formData.waveConditions} wave conditions`);
            baseScore += 15;
          }
        }
        
        // Water temperature matching for wetsuits
        if (product.category === 'wetsuits' && formData.waterTemp) {
          const temp = formData.waterTemp.toLowerCase();
          const tempMatches = {
            'cold': ['5/4', '6/5', '5mm', '6mm', 'winter', 'cold water'],
            'cool': ['4/3', '3/2', '4mm', '3mm', 'spring', 'fall'],
            'warm': ['2mm', '1mm', 'spring suit', 'summer', 'warm water'],
            'tropical': ['rash guard', 'sun protection', 'thermal protection']
          };
          
          const relevantTerms = tempMatches[temp] || [];
          const hasTempMatch = relevantTerms.some(term => 
            productDesc.includes(term) || 
            productFeatures.some(feature => feature.toLowerCase().includes(term))
          );
          
          if (hasTempMatch) {
            matchReasons.push(`Ideal thickness for ${formData.waterTemp} water`);
            baseScore += 20;
          }
        }
      } else if (product.sport === 'skate') {
        // Surface type matching
        if (formData.surface) {
          const surface = formData.surface.toLowerCase();
          const surfaceMatches = {
            'street': ['street', 'technical', 'hard wheels', '99a', '101a'],
            'park': ['park', 'bowl', 'vert', 'transition'],
            'cruising': ['cruising', 'soft wheels', '78a', '85a', 'transportation'],
            'rough': ['all-terrain', 'soft wheels', '78a', '85a', 'rough surface']
          };
          
          const relevantTerms = surfaceMatches[surface] || [];
          const hasSurfaceMatch = relevantTerms.some(term => 
            productDesc.includes(term) || 
            productFeatures.some(feature => feature.toLowerCase().includes(term))
          );
          
          if (hasSurfaceMatch) {
            matchReasons.push(`Designed for ${formData.surface} skating`);
            baseScore += 15;
          }
        }
        
        // Trick difficulty matching
        if (formData.trickLevel) {
          const tricks = formData.trickLevel.toLowerCase();
          if (tricks.includes('beginner') && (productDesc.includes('forgiving') || productDesc.includes('stable'))) {
            matchReasons.push('Beginner-friendly and forgiving');
            baseScore += 10;
          } else if (tricks.includes('advanced') && (productDesc.includes('responsive') || productDesc.includes('precision'))) {
            matchReasons.push('Responsive setup for advanced tricks');
            baseScore += 10;
          }
        }
      }
        // Brand reputation / quality indicators
      const premiumBrands = {
        ski: ['burton', 'rossignol', 'k2', 'salomon', 'atomic', 'völkl', 'nordica', 'dynastar', 'blizzard'],
        surf: ['lost', 'chanel islands', 'firewire', 'stewart', 'rusty', 'maurice cole', 'album', 'sharp eye', 'pyzel', 'mayhem'],
        skate: ['element', 'enjoi', 'plan b', 'girl', 'chocolate', 'baker', 'zero', 'real', 'krooked', 'anti hero', 'independent', 'thunder', 'venture', 'bones', 'spitfire', 'ricta']
      };
      
      const brandCategories = premiumBrands[product.sport] || [];
      const brand = (product.brand || '').toLowerCase();
      const isPremiumBrand = brandCategories.some(premiumBrand => 
        brand.includes(premiumBrand.toLowerCase()) || premiumBrand.toLowerCase().includes(brand)
      );
      
      if (isPremiumBrand) {
        matchReasons.push('Trusted premium brand');
        baseScore += 5;
      }
      
      // Add popular choice as fallback
      if (matchReasons.length === 0) {
        matchReasons.push('Popular choice in this category');
        baseScore += 5;
      } else if (baseScore >= 80) {
        matchReasons.push('Highly recommended');
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
        score: Math.min(Math.max(baseScore, 45), 100), // Keep scores between 45-100%
        matchReasons,
        features: Array.isArray(product.specifications?.features) ? product.specifications.features : [],
        brand: product.brand
      };
    });

    // Sort by score and return top matches (including imperfect ones)
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 15); // Return more results to include near-matches

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

// ======= SIZING CALCULATION FUNCTIONS =======

// Parse height from various formats to inches
function parseHeight(heightStr) {
  if (!heightStr) return null;
  
  const str = heightStr.toString().toLowerCase();
  
  // Handle cm format first (before general number matching)
  const cmMatch = str.match(/(\d+)\s*cm/);
  if (cmMatch) {
    return parseInt(cmMatch[1]) / 2.54; // Convert cm to inches
  }
  
  // Handle feet and inches format (5'10", 5 feet 10 inches, etc.)
  const feetInchesMatch = str.match(/(\d+)['']?\s*(?:feet?\s*)?(\d+)['"]?\s*(?:inches?)?/);
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1]);
    const inches = parseInt(feetInchesMatch[2]);
    return (feet * 12) + inches;
  }
    // Handle feet only format (5', 6 feet, etc.) - but not large numbers
  const feetOnlyMatch = str.match(/(\d+)['']?\s*(?:feet?|ft)\s*$/);
  if (feetOnlyMatch) {
    const value = parseInt(feetOnlyMatch[1]);
    // Don't treat large numbers as feet
    if (value <= 8) {
      return value * 12;
    }
  }
  
  // Handle explicit inches
  const explicitInchesMatch = str.match(/(\d+)\s*(?:inches?|in)\s*$/);
  if (explicitInchesMatch) {
    return parseInt(explicitInchesMatch[1]);
  }
  
  // Handle just numbers - assume cm if large, inches if small
  const numberMatch = str.match(/^(\d+)\s*$/);
  if (numberMatch) {
    const value = parseInt(numberMatch[1]);
    // If it's a large number without explicit units, assume it's cm
    if (value > 100) {
      return value / 2.54;
    }
    return value; // Small numbers assumed to be inches
  }
  
  return null;
}

// Parse weight from various formats to pounds
function parseWeight(weightStr) {
  if (!weightStr) return null;
  
  const str = weightStr.toString().toLowerCase();
  
  // Handle kg format first
  const kgMatch = str.match(/(\d+)\s*kg/);
  if (kgMatch) {
    return parseInt(kgMatch[1]) * 2.205; // Convert kg to lbs
  }
  
  // Handle pounds format
  const lbsMatch = str.match(/(\d+)\s*(?:lbs?|pounds?)/);
  if (lbsMatch) {
    return parseInt(lbsMatch[1]);
  }
  
  // Handle just numbers - assume lbs for US context unless very low (likely kg)
  const numberMatch = str.match(/(\d+)\s*$/);
  if (numberMatch) {
    const value = parseInt(numberMatch[1]);
    // If it's under 200 and no explicit unit, could be either
    // Use context: if under 50, probably kg; if over 250, probably lbs
    if (value < 50) {
      return value * 2.205; // Treat as kg
    } else {
      return value; // Treat as lbs
    }
  }
  
  return null;
}

// Calculate ideal snowboard length based on rider characteristics
function calculateSnowboardLength(heightInches, weightLbs, ridingStyle, experience) {
  if (!heightInches) return null;
  
  // Base calculation: height in cm minus adjustment
  const heightCm = heightInches * 2.54;
  let baseLength = heightCm;
  
  // Adjust based on riding style
  const styleAdjustments = {
    'freestyle': -8,     // Shorter for tricks and maneuverability
    'park': -8,
    'freeride': +5,      // Longer for stability and float
    'all-mountain': 0,   // Standard length
    'powder': +8,        // Longer for deep snow
    'racing': +3,        // Slightly longer for stability
    'carving': +3
  };
  
  const style = ridingStyle ? ridingStyle.toLowerCase() : 'all-mountain';
  const styleAdj = styleAdjustments[style] || 0;
  baseLength += styleAdj;
  
  // Adjust based on experience level
  const experienceAdjustments = {
    'beginner': -5,      // Shorter for easier control
    'intermediate': 0,   // Standard
    'advanced': +3,      // Can handle longer boards
    'expert': +5
  };
  
  const exp = experience ? experience.toLowerCase() : 'intermediate';
  const expAdj = experienceAdjustments[exp] || 0;
  baseLength += expAdj;
  
  // Weight adjustment (if available)
  if (weightLbs) {
    if (weightLbs < 120) baseLength -= 3;
    else if (weightLbs > 180) baseLength += 3;
    else if (weightLbs > 220) baseLength += 6;
  }
  
  return Math.round(baseLength);
}

// Calculate ideal surfboard length based on rider characteristics
function calculateSurfboardLength(heightInches, weightLbs, experience, surfStyle) {
  if (!heightInches || !weightLbs) return null;
  
  // Base calculation for surfboard length in inches
  let baseLength = heightInches;
  
  // Adjust based on experience level
  const experienceAdjustments = {
    'beginner': +8,      // Longer boards for stability
    'intermediate': +2,  // Slightly longer
    'advanced': -2,      // Shorter for performance
    'expert': -4
  };
  
  const exp = experience ? experience.toLowerCase() : 'intermediate';
  const expAdj = experienceAdjustments[exp] || 0;
  baseLength += expAdj;
  
  // Adjust based on surf style
  const styleAdjustments = {
    'longboard': +18,    // Much longer
    'funboard': +8,      // Moderately longer
    'shortboard': -6,    // Shorter for performance
    'fish': -3,          // Slightly shorter but wider
    'gun': +12           // Longer for big waves
  };
  
  const style = surfStyle ? surfStyle.toLowerCase() : 'funboard';
  const styleAdj = styleAdjustments[style] || 0;
  baseLength += styleAdj;
  
  // Weight adjustments
  if (weightLbs < 130) baseLength -= 2;
  else if (weightLbs > 180) baseLength += 2;
  else if (weightLbs > 220) baseLength += 4;
  
  return Math.round(baseLength);
}

// Calculate ideal skateboard deck width based on rider characteristics
function calculateSkateboardDeckWidth(shoeSize, ridingStyle, height) {
  // Base deck width calculation
  let baseWidth = 8.0; // Standard width in inches
  
  // Adjust based on shoe size
  if (shoeSize) {
    const size = parseFloat(shoeSize);
    if (size < 7) baseWidth = 7.5;
    else if (size < 9) baseWidth = 7.75;
    else if (size < 10.5) baseWidth = 8.0;
    else if (size < 12) baseWidth = 8.25;
    else baseWidth = 8.5;
  }
  
  // Adjust based on riding style
  const styleAdjustments = {
    'street': -0.25,     // Narrower for technical tricks
    'park': -0.125,      // Slightly narrower
    'vert': +0.25,       // Wider for stability
    'cruising': +0.5,    // Much wider for comfort
    'downhill': +0.75    // Widest for stability at speed
  };
  
  const style = ridingStyle ? ridingStyle.toLowerCase() : 'street';
  const styleAdj = styleAdjustments[style] || 0;
  baseWidth += styleAdj;
  
  // Height adjustment for very tall or short riders
  if (height) {
    const heightInches = parseHeight(height);
    if (heightInches) {
      if (heightInches < 60) baseWidth -= 0.25; // Under 5 feet
      else if (heightInches > 72) baseWidth += 0.25; // Over 6 feet
    }
  }
  
  return Math.round(baseWidth * 4) / 4; // Round to nearest quarter inch
}

// Generate detailed size match explanations
function generateSizeMatchReason(productSize, recommendedSize, productType) {
  const diff = Math.abs(productSize - recommendedSize);
  
  if (productType === 'snowboard') {
    if (diff <= 2) {
      return `Perfect snowboard length (${Math.round(productSize)}cm) for your height and style`;
    } else if (diff <= 5) {
      return `Good snowboard length (${Math.round(productSize)}cm), within optimal range for your measurements`;
    } else if (diff <= 8) {
      return `Workable snowboard length (${Math.round(productSize)}cm), slight adjustment needed for optimal fit`;
    }
  } else if (productType === 'surfboard') {
    if (diff <= 3) {
      return `Ideal surfboard length (${Math.round(productSize/2.54)}'${Math.round((productSize/2.54 % 1) * 12)}") for your experience and style`;
    } else if (diff <= 6) {
      return `Good surfboard length (${Math.round(productSize/2.54)}'${Math.round((productSize/2.54 % 1) * 12)}"), suitable for your level`;
    } else if (diff <= 10) {
      return `Alternative surfboard length (${Math.round(productSize/2.54)}'${Math.round((productSize/2.54 % 1) * 12)}"), may require style adjustment`;
    }
  } else if (productType === 'skateboard') {
    if (diff <= 0.125) {
      return `Perfect deck width (${productSize}") for your shoe size and style`;
    } else if (diff <= 0.25) {
      return `Good deck width (${productSize}"), very close to your ideal size`;
    } else if (diff <= 0.5) {
      return `Workable deck width (${productSize}"), slight difference from optimal`;
    }
  }
  
  return null;
}

// Calculate ideal helmet size based on head circumference
function calculateHelmetSize(headCircumference) {
  if (!headCircumference) return null;
  
  // Parse circumference - could be in inches or cm
  let circumferenceInches;
  const str = headCircumference.toString().toLowerCase();
  
  if (str.includes('cm')) {
    const cm = parseFloat(str.replace(/[^\d.]/g, ''));
    circumferenceInches = cm / 2.54;
  } else {
    circumferenceInches = parseFloat(str.replace(/[^\d.]/g, ''));
  }
  
  if (!circumferenceInches) return null;
  
  // Standard helmet sizing
  if (circumferenceInches < 20.5) return 'XS';
  else if (circumferenceInches < 21.75) return 'S';
  else if (circumferenceInches < 23) return 'M';
  else if (circumferenceInches < 24.5) return 'L';
  else return 'XL';
}

// Calculate wetsuit size based on height, weight, and chest measurements
function calculateWetsuitSize(height, weight, chestSize) {
  const heightInches = parseHeight(height);
  const weightLbs = parseWeight(weight);
  let chestInches = null;
  
  if (chestSize) {
    const str = chestSize.toString().toLowerCase();
    if (str.includes('cm')) {
      chestInches = parseFloat(str.replace(/[^\d.]/g, '')) / 2.54;
    } else {
      chestInches = parseFloat(str.replace(/[^\d.]/g, ''));
    }
  }
  
  // Basic wetsuit sizing matrix (simplified)
  if (!heightInches || !weightLbs) return null;
  
  // This is a simplified calculation - real wetsuit sizing is more complex
  if (heightInches < 64 && weightLbs < 130) return 'XS';
  else if (heightInches < 67 && weightLbs < 150) return 'S';
  else if (heightInches < 70 && weightLbs < 170) return 'M';
  else if (heightInches < 73 && weightLbs < 190) return 'L';
  else if (heightInches < 76 && weightLbs < 210) return 'XL';
  else return 'XXL';
}

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