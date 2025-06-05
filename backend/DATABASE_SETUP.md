# trust. Platform Database Setup Guide

## Prerequisites
1. PostgreSQL must be installed on your system
2. Default PostgreSQL user should be 'postgres' with password 'password'

## Option 1: Quick Database Setup (Recommended)

If you have PostgreSQL installed with default settings, run:

```bash
# Create database
createdb -U postgres trust_platform

# Run schema
psql -U postgres -d trust_platform -f database_schema.sql
```

## Option 2: Alternative Database Setup

If you need to create a user or use different credentials:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE trust_platform;
CREATE USER trust_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trust_platform TO trust_user;

-- Connect to the new database
\c trust_platform

-- Run the schema (copy from database_schema.sql)
```

## Option 3: Using Docker (Alternative)

If you prefer Docker:

```bash
# Run PostgreSQL in Docker
docker run --name trust-postgres -e POSTGRES_DB=trust_platform -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:14

# Wait for container to start, then run schema
docker exec -i trust-postgres psql -U postgres -d trust_platform < database_schema.sql
```

## Configuration

Update the `.env` file with your database credentials:

```
DATABASE_URL=postgresql://username:password@localhost:5432/trust_platform
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trust_platform
DB_USER=your_username
DB_PASSWORD=your_password
```

## Verification

After setup, test the connection:

```bash
node database.js
```

Or start the server and check the health endpoint:

```bash
node server.js
# Then visit: http://localhost:3001/api/health
```

## Troubleshooting

1. **Connection refused**: Ensure PostgreSQL is running
2. **Authentication failed**: Check username/password in .env
3. **Database does not exist**: Run `createdb trust_platform`
4. **Schema errors**: Ensure database_schema.sql is properly executed
