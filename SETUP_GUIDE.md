# CE4HOW Taka ni Mali v2 - Setup Guide

Complete guide for setting up and running the Geospatial Waste Management M&E Dashboard locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **pnpm**: v8.0.0 or higher (`npm install -g pnpm`)
- **Git**: For cloning the repository
- **Database**: PostgreSQL 12+ or MySQL 8.0+
- **Text Editor**: VS Code, WebStorm, or similar

## Step 1: Clone the Repository

```bash
git clone https://github.com/ce4how/taka-ni-mali-v2.git
cd taka-ni-mali-v2
```

## Step 2: Install Dependencies

```bash
pnpm install
```

This will install all frontend and backend dependencies.

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
# Database Connection
DATABASE_URL=mysql://username:password@localhost:3306/waste_me_db
# or for PostgreSQL:
# DATABASE_URL=postgresql://username:password@localhost:5432/waste_me_db

# Authentication (from Manus)
JWT_SECRET=your_secret_key_here_min_32_chars
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Frontend Configuration
VITE_APP_TITLE=CE4HOW Taka ni Mali
VITE_APP_LOGO=https://example.com/logo.png
VITE_APP_ID=your_app_id_from_manus

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

## Step 4: Set Up Database

### Option A: Using Docker (Recommended)

```bash
# Start MySQL container
docker run --name waste-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=waste_me_db -p 3306:3306 -d mysql:8.0

# Or PostgreSQL
docker run --name waste-db -e POSTGRES_PASSWORD=root -e POSTGRES_DB=waste_me_db -p 5432:5432 -d postgres:15
```

### Option B: Local Installation

**MySQL:**
```bash
# macOS (Homebrew)
brew install mysql
brew services start mysql

# Linux (Ubuntu)
sudo apt-get install mysql-server
sudo systemctl start mysql

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

**PostgreSQL:**
```bash
# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Linux (Ubuntu)
sudo apt-get install postgresql
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/
```

### Create Database

```bash
# MySQL
mysql -u root -p
CREATE DATABASE waste_me_db;
CREATE USER 'waste_user'@'localhost' IDENTIFIED BY 'waste_password';
GRANT ALL PRIVILEGES ON waste_me_db.* TO 'waste_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# PostgreSQL
psql -U postgres
CREATE DATABASE waste_me_db;
CREATE USER waste_user WITH PASSWORD 'waste_password';
GRANT ALL PRIVILEGES ON DATABASE waste_me_db TO waste_user;
\q
```

## Step 5: Run Database Migrations

```bash
pnpm db:push
```

This will:
1. Generate migration files from your schema
2. Apply migrations to the database
3. Create all required tables (users, collections)

Verify the tables were created:

```bash
# MySQL
mysql -u waste_user -p waste_me_db
SHOW TABLES;
DESCRIBE users;
DESCRIBE collections;

# PostgreSQL
psql -U waste_user -d waste_me_db
\dt
\d users
\d collections
```

## Step 6: Start Development Server

```bash
pnpm dev
```

This will start both the frontend and backend:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

You should see output like:
```
[00:00:00] Server running on http://localhost:3000/
[00:00:00] Vite dev server running at http://localhost:5173
```

## Step 7: Test the Application

### Access the Application

1. Open http://localhost:5173 in your browser
2. You should see the landing page with:
   - Feature cards (Interactive Map, Analytics, Data Collection, Real-time Updates)
   - Get Started section with dashboard and data submission options
   - About section with key features

### Test Public Dashboard

1. Click "Open Dashboard" button
2. You should see:
   - Summary statistics cards (0 records initially)
   - Filter controls (waste type, date range)
   - Empty data table
   - Map and chart placeholders

### Test Authentication (if using Manus OAuth)

1. Click "Login" or "Submit Collection"
2. You'll be redirected to Manus OAuth portal
3. After login, you'll be redirected back with a session cookie

### Test Data Submission

1. Log in as a collector
2. Navigate to "Submit Collection" or "Data Collection Form"
3. Fill in the form:
   - Site Name: "Kakamega Main Dumpsite"
   - Collection Date: Today's date
   - Waste Type: "Organic"
   - Total Volume: 5.5 tons
   - Waste Separated: Yes
   - Organic Volume: 3.2 tons
   - Inorganic Volume: 2.3 tons
   - Number of Collections: 2
   - Latitude: -0.3031
   - Longitude: 34.7616
4. Click "Submit Collection"
5. You should see a success message

### Verify Data in Dashboard

1. Go back to Dashboard
2. You should now see:
   - 1 record in summary statistics
   - 5.5 tons total volume
   - 1 Organic waste type
   - The record in the data table
   - A marker on the map
   - A data point on the chart

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>

# Or specify different port
PORT=3001 pnpm dev
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
1. Verify database is running: `mysql -u root -p` or `psql -U postgres`
2. Check DATABASE_URL in .env.local
3. Ensure username and password are correct
4. Verify database exists: `SHOW DATABASES;` or `\l`

### Migration Errors

```
Error: Table 'waste_me_db.users' already exists
```

**Solution:**
1. Drop existing tables: `DROP TABLE collections; DROP TABLE users;`
2. Re-run migrations: `pnpm db:push`

### Module Not Found

```
Error: Cannot find module 'leaflet'
```

**Solution:**
```bash
pnpm install
pnpm install leaflet chart.js react-chartjs-2 @types/leaflet
```

### TypeScript Errors

```
error TS7016: Could not find a declaration file for module 'leaflet'
```

**Solution:**
```bash
pnpm add -D @types/leaflet
```

## Development Workflow

### Making Changes

1. **Backend Changes**: Edit files in `server/` and `drizzle/`
   - Changes auto-reload via HMR
   - If schema changes, run `pnpm db:push`

2. **Frontend Changes**: Edit files in `client/src/`
   - Changes auto-reload via Vite HMR
   - Check browser console for errors

3. **Database Schema Changes**:
   ```bash
   # Edit drizzle/schema.ts
   pnpm db:push
   ```

### Debugging

**Browser DevTools:**
- Open DevTools (F12)
- Check Console for errors
- Use Network tab to inspect API calls
- Use Application tab to view cookies/storage

**Backend Debugging:**
```bash
# Add console.log statements in server code
# Logs appear in terminal running pnpm dev
```

**Database Inspection:**
```bash
# MySQL
mysql -u waste_user -p waste_me_db
SELECT * FROM collections;

# PostgreSQL
psql -U waste_user -d waste_me_db
SELECT * FROM collections;
```

## Demo Credentials

For testing without OAuth:

| Role | Username | Password |
|------|----------|----------|
| Collector | demo_collector | password123 |
| Admin | demo_admin | password123 |
| Public | (no login) | (no login) |

*Note: These are example credentials. Implement actual user creation in production.*

## Next Steps

1. **Customize Branding**: Update `VITE_APP_TITLE` and `VITE_APP_LOGO`
2. **Configure OAuth**: Set up Manus OAuth credentials
3. **Add Demo Data**: Create sample collection records
4. **Deploy**: Follow deployment guide for Vercel/Render
5. **Monitor**: Set up error tracking and analytics

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Leaflet Documentation](https://leafletjs.com)
- [Chart.js Documentation](https://www.chartjs.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in browser console and terminal
3. Check database logs: `tail -f /var/log/mysql/error.log`
4. Contact the CE4HOW development team

---

**Last Updated**: October 2025  
**Version**: 2.0.0

