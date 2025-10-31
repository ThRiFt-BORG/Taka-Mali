# CE4HOW Taka ni Mali v2 - Setup Guide (Standalone)

Complete step-by-step guide to set up and deploy the Geospatial Waste Management M&E Dashboard with JWT-based authentication.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Database Configuration](#database-configuration)
3. [Environment Variables](#environment-variables)
4. [Running the Application](#running-the-application)
5. [Seed Demo Data](#seed-demo-data)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Local Development Setup

### Prerequisites

Before starting, ensure you have:

- **Node.js** 18.0.0 or higher
  - Download from https://nodejs.org/
  - Verify: `node --version`

- **pnpm** 10.0.0 or higher (package manager)
  - Install: `npm install -g pnpm`
  - Verify: `pnpm --version`

- **Git** 2.30.0 or higher
  - Download from https://git-scm.com/
  - Verify: `git --version`

- **Database Server** (MySQL 8.0+ or PostgreSQL 12+)
  - Option 1: Install locally
  - Option 2: Use Docker (recommended)
  - Option 3: Use managed service (AWS RDS, Azure Database, etc.)

### Option 1: Local MySQL Installation

**macOS (Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql -u root -p
```

**Windows:**
1. Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
2. Run installer and follow setup wizard
3. Start MySQL service from Services

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
```

### Option 2: Docker (Recommended)

**Install Docker:**
- Download from https://www.docker.com/products/docker-desktop

**Start MySQL in Docker:**
```bash
docker run --name waste-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=waste_me_db \
  -e MYSQL_USER=waste_user \
  -e MYSQL_PASSWORD=waste_password \
  -p 3306:3306 \
  -d mysql:8.0
```

**Verify connection:**
```bash
mysql -h 127.0.0.1 -u waste_user -p waste_password -D waste_me_db
```

### Option 3: PostgreSQL (Alternative)

**Docker:**
```bash
docker run --name waste-db \
  -e POSTGRES_DB=waste_me_db \
  -e POSTGRES_USER=waste_user \
  -e POSTGRES_PASSWORD=waste_password \
  -p 5432:5432 \
  -d postgres:15
```

**Verify connection:**
```bash
psql -h 127.0.0.1 -U waste_user -d waste_me_db
```

### Clone Repository

```bash
git clone <repository-url>
cd taka-ni-mali-v2
```

### Install Dependencies

```bash
pnpm install
```

This will install all required packages for both frontend and backend.

## Database Configuration

### Create Database

**For MySQL:**
```bash
mysql -u root -p
CREATE DATABASE waste_me_db;
CREATE USER 'waste_user'@'localhost' IDENTIFIED BY 'waste_password';
GRANT ALL PRIVILEGES ON waste_me_db.* TO 'waste_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**For PostgreSQL:**
```bash
psql -U postgres
CREATE DATABASE waste_me_db;
CREATE USER waste_user WITH PASSWORD 'waste_password';
GRANT ALL PRIVILEGES ON DATABASE waste_me_db TO waste_user;
\q
```

### Run Migrations

```bash
pnpm db:push
```

This command:
1. Generates migration files from schema
2. Applies migrations to the database
3. Creates all necessary tables

You should see output like:
```
✓ Your SQL migration file ➜ drizzle/0002_brainy_husk.sql 🚀
✓ migrations applied successfully!
```

## Environment Variables

### Create .env.local File

```bash
cp .env.example.standalone .env.local
```

### Configure Variables

Edit `.env.local` with your settings:

```env
# Database Connection
DATABASE_URL=mysql://waste_user:waste_password@localhost:3306/waste_me_db

# For PostgreSQL, use:
# DATABASE_URL=postgresql://waste_user:waste_password@localhost:5432/waste_me_db

# JWT Authentication
JWT_SECRET=your_super_secret_key_minimum_32_characters_long_change_this
JWT_ALGORITHM=HS256
JWT_EXPIRES_HOURS=24

# Application
VITE_APP_TITLE=CE4HOW Taka ni Mali
VITE_APP_LOGO=https://example.com/logo.png
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Ports
PORT=3000
VITE_PORT=5173
```

### Generate JWT Secret

For production, generate a secure random JWT secret:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Online Generator:**
- https://generate-secret.vercel.app/ (for development only)

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
pnpm dev
```

You should see:
```
  ➜  Local:   http://localhost:5173/
  ➜  API:     http://localhost:3000/api/trpc
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
pnpm build
```

This creates optimized production builds in:
- `client/dist/` - Frontend bundle
- `server/dist/` - Backend bundle

### Start Production Server

```bash
pnpm start
```

## Seed Demo Data

### Run Seed Script

```bash
pnpm ts-node scripts/seed.ts
```

This creates:
- 1 Admin user
- 2 Collector users
- 1 Public user
- 3 Sample collection records

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Collector 1 | collector1@example.com | password123 |
| Collector 2 | collector2@example.com | password123 |
| Public User | user@example.com | password123 |

**Important:** Change these credentials immediately in production!

### Create Custom Users

To create additional users, use the registration page at http://localhost:5173/register

## Production Deployment

### Frontend Deployment (Vercel)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Configure build settings:
     - Build Command: `pnpm build`
     - Output Directory: `client/dist`

3. **Set Environment Variables**
   - Add all variables from `.env.local` to Vercel project settings
   - Ensure `DATABASE_URL` points to production database

4. **Deploy**
   - Vercel automatically deploys on git push

### Backend Deployment (Render)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Build Command: `pnpm install && pnpm db:push`
     - Start Command: `pnpm start`
     - Environment: Node

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Update `DATABASE_URL` to production database

4. **Deploy**
   - Render automatically deploys on git push

### Database Deployment

**Option 1: AWS RDS**
1. Go to AWS RDS console
2. Create MySQL or PostgreSQL instance
3. Configure security groups
4. Get connection string
5. Update `DATABASE_URL` in environment variables

**Option 2: Azure Database**
1. Go to Azure portal
2. Create MySQL or PostgreSQL server
3. Configure firewall rules
4. Get connection string
5. Update `DATABASE_URL` in environment variables

**Option 3: Managed Services**
- PlanetScale (MySQL)
- Supabase (PostgreSQL)
- Railway (MySQL/PostgreSQL)
- MongoDB Atlas (if switching to MongoDB)

### Update CORS for Production

Update `ALLOWED_ORIGINS` in production environment:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
```

### Enable HTTPS

All production URLs must use HTTPS:
- Vercel: Automatic
- Render: Automatic
- Custom domains: Use Let's Encrypt or similar

## Troubleshooting

### Database Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solutions:**
1. Verify database is running: `mysql -u root -p`
2. Check DATABASE_URL in .env.local
3. Verify credentials are correct
4. If using Docker, ensure container is running: `docker ps`

### JWT Secret Error

**Error:** `JWT_SECRET environment variable is not set`

**Solutions:**
1. Add JWT_SECRET to .env.local
2. Ensure .env.local is in project root
3. Restart dev server: `pnpm dev`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE :::3000`

**Solutions:**
1. Kill process using port: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
2. Or change PORT in .env.local: `PORT=3001`

### CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solutions:**
1. Add your frontend URL to ALLOWED_ORIGINS
2. Include protocol: `https://yourdomain.com` (not just `yourdomain.com`)
3. Restart server

### Migration Error

**Error:** `Error: Unknown column 'password' in 'users'`

**Solutions:**
1. Run migrations: `pnpm db:push`
2. Check database connection
3. Verify schema.ts is correct

### Token Expired

**Error:** `Invalid or expired token`

**Solutions:**
1. Clear localStorage: Open DevTools → Application → LocalStorage → Delete auth_token
2. Log in again to get new token
3. Check JWT_EXPIRES_HOURS setting

### TypeScript Errors

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solutions:**
1. Run type check: `pnpm type-check`
2. Ensure all imports are correct
3. Rebuild: `pnpm build`

### Build Fails

**Error:** `Failed to compile`

**Solutions:**
1. Clear node_modules: `rm -rf node_modules && pnpm install`
2. Clear build cache: `rm -rf dist`
3. Check for syntax errors
4. Run `pnpm type-check`

## Development Tips

### Hot Reload

Both frontend and backend support hot reload during development:
- Frontend: Changes to React components auto-reload
- Backend: Changes to tRPC routers auto-reload
- Database: Changes to schema require `pnpm db:push`

### Debug Mode

Enable debug logging:

```bash
DEBUG=* pnpm dev
```

### Database Inspection

View database tables:

```bash
mysql -u waste_user -p waste_password -D waste_me_db
SHOW TABLES;
DESCRIBE users;
```

### API Testing

Test API endpoints with curl:

```bash
# Register
curl -X POST http://localhost:3000/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### View Logs

Backend logs are printed to console. For persistent logging, consider:
- Winston (logging library)
- Pino (JSON logging)
- ELK Stack (production logging)

## Next Steps

1. **Customize Branding**
   - Update VITE_APP_TITLE and VITE_APP_LOGO
   - Modify colors in client/src/index.css

2. **Add Features**
   - Create new database tables in drizzle/schema.ts
   - Add tRPC routers in server/routers/
   - Create React pages in client/src/pages/

3. **Deploy to Production**
   - Follow production deployment section above
   - Set up monitoring and logging
   - Configure backups for database

4. **Secure Your System**
   - Change demo user passwords
   - Enable HTTPS everywhere
   - Set up rate limiting
   - Configure firewall rules

## Support

For help with:
- **Setup Issues**: Check Troubleshooting section above
- **Database Problems**: Verify connection string and credentials
- **Deployment Questions**: Consult Vercel/Render documentation
- **Code Issues**: Check GitHub issues or create new one

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Drizzle ORM Guide](https://orm.drizzle.team/)
- [tRPC Documentation](https://trpc.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Leaflet Documentation](https://leafletjs.com/)

---

**Last Updated:** October 2025  
**Version:** 2.0.0

