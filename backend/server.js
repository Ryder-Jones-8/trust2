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
      
      // Brand reputation / quality indicators
      const premiumBrands = ['burton', 'rossignol', 'k2', 'salomon', 'atomic', 'völkl'];
      const brand = (product.brand || '').toLowerCase();
      if (premiumBrands.includes(brand)) {
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

// Helper functions for parsing height and calculating board sizes
function parseHeight(heightStr) {
  if (!heightStr) return null;
  
  // Handle feet'inches" format like "5'10""
  const feetInchesMatch = heightStr.match(/(\d+)'(\d+)"/);
  if (feetInchesMatch) {
    const feet = parseFloat(feetInchesMatch[1]);
    const inches = parseFloat(feetInchesMatch[2]);
    return (feet * 12) + inches; // Convert to total inches
  }
  
  // Handle decimal feet format like "5.83"
  const decimalMatch = heightStr.match(/[\d.]+/);
  if (decimalMatch) {
    const feet = parseFloat(decimalMatch[0]);
    return feet * 12; // Convert to inches
  }
  
  return null;
}

function parseWeight(weightStr) {
  if (!weightStr) return null;
  const match = weightStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

// Calculate recommended snowboard length based on height and riding style
function calculateSnowboardLength(heightInches, weight, ridingStyle, experience) {
  if (!heightInches) return null;
  
  // Base calculation: height in cm minus offset based on style
  const heightCm = heightInches * 2.54;
  let offset = 20; // Default offset for all-mountain
  
  // Adjust offset based on riding style
  const style = (ridingStyle || '').toLowerCase();
  if (style.includes('freestyle') || style.includes('park')) {
    offset = 25; // Shorter for freestyle/park
  } else if (style.includes('freeride') || style.includes('powder')) {
    offset = 15; // Longer for freeride/powder
  } else if (style.includes('carving') || style.includes('racing')) {
    offset = 10; // Longer for carving/racing
  }
  
  // Adjust for experience level
  const exp = (experience || '').toLowerCase();
  if (exp === 'beginner') {
    offset += 5; // Beginners benefit from shorter boards
  } else if (exp === 'advanced' || exp === 'expert') {
    offset -= 5; // Advanced riders can handle longer boards
  }
  
  // Weight adjustment
  if (weight) {
    if (weight > 180) offset -= 2; // Heavier riders need longer boards
    if (weight < 140) offset += 2; // Lighter riders need shorter boards
  }
  
  const recommendedLengthCm = heightCm - offset;
  return Math.round(recommendedLengthCm);
}

// Calculate recommended surfboard length based on height, weight, and experience
function calculateSurfboardLength(heightInches, weight, experience, surfStyle) {
  if (!heightInches || !weight) return null;
  
  // Base calculation starts with height
  let lengthInches = heightInches;
  
  // Adjust based on experience level
  const exp = (experience || '').toLowerCase();
  if (exp === 'beginner') {
    lengthInches += 8; // Beginners need longer, more stable boards
  } else if (exp === 'intermediate') {
    lengthInches += 4;
  } else if (exp === 'advanced' || exp === 'expert') {
    lengthInches += 0; // Advanced riders can go shorter
  }
  
  // Adjust based on surf style
  const style = (surfStyle || '').toLowerCase();
  if (style.includes('longboard')) {
    lengthInches += 12; // Longboards are significantly longer
  } else if (style.includes('shortboard')) {
    lengthInches -= 4; // Shortboards are shorter and more maneuverable
  }
  
  // Weight adjustments
  if (weight > 180) lengthInches += 2; // Heavier surfers need more volume/length
  if (weight < 140) lengthInches -= 2; // Lighter surfers can go shorter
  
  return Math.round(lengthInches);
}

// Check if a board length is suitable for a rider
function isBoardSizeSuitable(boardLengthCm, recommendedLengthCm, tolerance = 5) {
  if (!boardLengthCm || !recommendedLengthCm) return false;
  return Math.abs(boardLengthCm - recommendedLengthCm) <= tolerance;
}

// Generate size-specific match reasons
function generateSizeMatchReason(boardLengthCm, recommendedLengthCm, boardType = 'board') {
  if (!boardLengthCm || !recommendedLengthCm) return null;
  
  const diff = boardLengthCm - recommendedLengthCm;
  const absDiff = Math.abs(diff);
  
  if (absDiff <= 2) {
    return `Perfect ${boardType} length for your height and style`;
  } else if (absDiff <= 5) {
    if (diff > 0) {
      return `Slightly longer ${boardType} - gives more stability and float`;
    } else {
      return `Slightly shorter ${boardType} - more maneuverable and playful`;
    }
  } else if (absDiff <= 8) {
    if (diff > 0) {
      return `Longer ${boardType} - excellent for stability and powder`;
    } else {
      return `Shorter ${boardType} - great for tricks and tight turns`;
    }
  } else {
    return `${boardType.charAt(0).toUpperCase() + boardType.slice(1)} size may not be optimal for your measurements`;
  }
}

// Enhanced size and physical compatibility matching