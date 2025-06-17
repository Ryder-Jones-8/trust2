# FREE CLOUD DEPLOYMENT GUIDE

## Step 1: Create Free Database (Neon)
1. Go to https://neon.tech
2. Sign up with GitHub (free)
3. Create a new project called "trust-platform"
4. Copy the connection string (looks like: postgresql://username:password@hostname/database)

## Step 2: Deploy Backend to Railway (Free)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your trust repository
5. Choose the backend folder
6. Add environment variables:
   - DATABASE_URL: (your Neon connection string)
   - JWT_SECRET: trust_platform_super_secret_key_2024
   - PORT: 3001

## Step 3: Update Frontend Environment
Update your Netlify environment variables:
- VITE_API_URL: https://your-railway-app.railway.app

## Step 4: Deploy Database Schema
Run the database setup script against your Neon database

Your platform will then be accessible worldwide at your GoDaddy domain!

## Free Tier Limits:
- Railway: 500 hours/month (plenty for most shops)
- Neon: 3GB database (thousands of products)
- Netlify: Unlimited static hosting

## Estimated Monthly Cost: $0
