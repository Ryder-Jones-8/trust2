# Render Deployment Guide for trust. platform

## Render.com - Free Backend Hosting

### Why Render?
- 750 hours/month free (more than Railway's limited plan)
- No credit card required
- Easy GitHub integration
- Automatic deployments

### Steps:

1. Go to https://render.com
2. Click "Get Started for Free"
3. Connect with GitHub
4. Click "New +" → "Web Service"
5. Connect your repository
6. Configure:
   - Name: trust-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Root Directory: backend

### Environment Variables:
DATABASE_URL=postgresql://neondb_owner:npg_90UbFJWeZPdy@ep-cold-cell-a8pfj6k2-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
JWT_SECRET=trust_platform_super_secret_key_2024
NODE_ENV=production

### Result:
Your backend will be available at: https://trust-backend.onrender.com
