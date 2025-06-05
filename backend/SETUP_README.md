# trust. Platform Database Setup Guide

## Prerequisites

1. **Install PostgreSQL** on your system:
   - Windows: Download from https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql postgresql-contrib`

## Setup Steps

### 1. Create Database

Open PostgreSQL command line (psql) as postgres user:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE trust_platform;

# Connect to the new database
\c trust_platform;
```

### 2. Run Database Schema

Copy and paste the contents of `database_schema.sql` into psql, or run:

```bash
psql -U postgres -d trust_platform -f database_schema.sql
```

### 3. Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` file with your PostgreSQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=trust_platform
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   PORT=3001
   JWT_SECRET=your_secure_jwt_secret_here
   ```

### 4. Install Dependencies & Start Server

```bash
npm install
npm start
```

### 5. Test the Setup

Visit: http://localhost:3001/api/health

You should see:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## Default Login Credentials

The database includes sample shops with these credentials:

1. **Wave Riders Surf Shop**
   - Email: `admin@waveriders.com`
   - Password: `password`

2. **Mountain Peak Ski Shop**
   - Email: `admin@mountainpeak.com`
   - Password: `password`

3. **Street Style Skate Shop**
   - Email: `admin@streetstyle.com`
   - Password: `password`

## API Endpoints

- `POST /api/auth/login` - Shop authentication
- `GET /api/products` - Get products (with optional filters)
- `POST /api/products` - Create new product (authenticated)
- `PUT /api/products/:id` - Update product (authenticated)
- `DELETE /api/products/:id` - Delete product (authenticated)
- `POST /api/recommendations` - Generate customer recommendations
- `GET /api/analytics/overview` - Get shop analytics (authenticated)
- `GET /api/shop/settings` - Get shop settings (authenticated)
- `PUT /api/shop/settings` - Update shop settings (authenticated)

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check your `.env` file credentials
3. Verify database exists: `\l` in psql
4. Check firewall settings

### Authentication Issues
1. Verify JWT_SECRET is set in `.env`
2. Use correct email/password combinations
3. Check token format in requests

### CORS Issues
1. Frontend must run on different port than backend
2. Check CORS configuration in server.js

## Next Steps

After successful setup:
1. Update frontend components to use real API endpoints
2. Test product management features
3. Test recommendation system
4. Customize analytics and reporting
