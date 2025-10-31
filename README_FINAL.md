# CE4HOW Taka ni Mali v2 - Geospatial Waste Management M&E Dashboard

**Production-Ready Full-Stack Application** | React + TypeScript + tRPC + Drizzle ORM | JWT Authentication | Real-time Geospatial Analytics

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Authentication System](#authentication-system)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

CE4HOW Taka ni Mali v2 is a comprehensive monitoring and evaluation system for waste collection management in Kakamega Municipality. It extends the original static Leaflet map (v1) into a full-stack application with real-time data collection, interactive dashboards, and advanced analytics.

**Key Capabilities:**
- Interactive geospatial mapping with Leaflet
- Real-time waste collection data submission
- Secure JWT-based authentication
- Role-based access control (Admin, Collector, Public User)
- Advanced filtering and analytics with Chart.js
- Responsive design for all devices

## Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 10+
- **MySQL 8.0+** or **PostgreSQL 12+**
- **Git**

### 1. Clone & Install

```bash
git clone <repository-url>
cd taka-ni-mali-v2
pnpm install
```

### 2. Configure Database

**Option A: MySQL (Docker)**
```bash
docker run --name waste-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=waste_me_db \
  -e MYSQL_USER=waste_user \
  -e MYSQL_PASSWORD=waste_password \
  -p 3306:3306 \
  -d mysql:8.0
```

**Option B: PostgreSQL (Docker)**
```bash
docker run --name waste-db \
  -e POSTGRES_DB=waste_me_db \
  -e POSTGRES_USER=waste_user \
  -e POSTGRES_PASSWORD=waste_password \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Set Environment Variables

```bash
cp .env.example.standalone .env.local
```

Edit `.env.local`:
```env
# MySQL
DATABASE_URL=mysql://waste_user:waste_password@localhost:3306/waste_me_db

# OR PostgreSQL
# DATABASE_URL=postgresql://waste_user:waste_password@localhost:5432/waste_me_db

# JWT (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_ALGORITHM=HS256
JWT_EXPIRES_HOURS=24

# Application
VITE_APP_TITLE=CE4HOW Taka ni Mali
NODE_ENV=development
```

### 4. Initialize Database

```bash
pnpm db:push
```

### 5. Seed Demo Data

```bash
pnpm ts-node scripts/seed.ts
```

### 6. Start Development Server

```bash
pnpm dev
```

Open http://localhost:5173 in your browser.

## Features

### 🗺️ Public Dashboard (No Authentication Required)

Access at: `/dashboard`

**Components:**
- **Interactive Map**: Leaflet-based visualization of all waste collection sites
- **Dynamic Markers**: Color-coded by waste type (Organic, Inorganic, Mixed)
- **Data Table**: Filterable and sortable collection records
- **Chart.js Visualization**: Waste collection trends over time
- **Summary Statistics**: Total records, volume, waste type breakdown
- **Filtering**: By waste type, date range, and location

**Features:**
- Click markers to filter related data
- Responsive grid layout (left: filters/table, right: map/chart)
- Real-time data synchronization
- No login required

### 📝 Data Collection Interface (Authenticated)

Access at: `/collector` (requires login as collector or admin)

**Form Fields:**
- **Site Name** (required): Name of waste collection location
- **Collection Date** (required): Date of collection
- **Waste Type** (required): Organic, Inorganic, or Mixed
- **Total Volume** (required): Volume in tons (0-999.99)
- **Waste Separated**: Checkbox to indicate if waste was separated
- **Organic Volume**: Volume of organic waste (if separated)
- **Inorganic Volume**: Volume of inorganic waste (if separated)
- **Collection Count** (required): Number of collection events
- **Latitude** (required): Geographic latitude (-90 to 90)
- **Longitude** (required): Geographic longitude (-180 to 180)

**Features:**
- Form validation with helpful error messages
- Conditional fields (organic/inorganic volumes appear if separated)
- Success feedback after submission
- View personal submissions at `/my-records`
- Automatic form reset after successful submission

### 👤 User Management

**Roles:**
- **Admin**: Full system access, can submit data, view all records
- **Collector**: Can submit waste collection data and view own records
- **User**: Public access to dashboard only

**Authentication Pages:**
- `/login` - Email/password login
- `/register` - Create new collector account
- `/my-records` - View personal submissions (collectors only)

## Authentication System

### JWT-Based Authentication

The system uses **JSON Web Tokens (JWT)** for secure, stateless authentication.

#### How It Works

1. **Registration** (`/register`)
   ```
   User enters: email, password, name
   ↓
   Password hashed with bcrypt (10 salt rounds)
   ↓
   User stored in database with "collector" role
   ↓
   JWT token generated and returned
   ↓
   Token stored in localStorage
   ```

2. **Login** (`/login`)
   ```
   User enters: email, password
   ↓
   Password verified against stored hash
   ↓
   JWT token generated (expires in 24 hours)
   ↓
   Token stored in localStorage
   ↓
   Redirect to dashboard
   ```

3. **API Calls**
   ```
   Frontend sends: Authorization: Bearer <token>
   ↓
   Backend verifies token signature
   ↓
   Extracts user info from token payload
   ↓
   Allows/denies access based on role
   ```

4. **Token Expiration**
   ```
   After 24 hours: Token expires
   ↓
   User must log in again
   ↓
   New token issued
   ```

### Token Structure

JWT tokens contain:
```json
{
  "userId": 1,
  "email": "collector@example.com",
  "role": "collector",
  "iat": 1698000000,
  "exp": 1698086400
}
```

### Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **Token Signing**: HS256 algorithm with secret key
- **Token Storage**: localStorage (consider httpOnly cookies for higher security)
- **CORS Protection**: Restricted to allowed origins
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **Role-Based Access**: Endpoints check user role before allowing access

## API Endpoints

All endpoints use tRPC and are accessed via `/api/trpc/`

### Authentication Endpoints

#### Register New User
```
POST /api/trpc/auth.register
Content-Type: application/json

{
  "name": "John Collector",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Collector",
    "role": "collector"
  }
}
```

#### Login
```
POST /api/trpc/auth.login
Content-Type: application/json

{
  "email": "collector1@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 2,
    "email": "collector1@example.com",
    "name": "John Collector",
    "role": "collector"
  }
}
```

#### Get Current User
```
GET /api/trpc/auth.me
Authorization: Bearer <token>

Response:
{
  "id": 2,
  "email": "collector1@example.com",
  "name": "John Collector",
  "role": "collector"
}
```

#### Verify Token
```
POST /api/trpc/auth.verify
Content-Type: application/json

{
  "token": "eyJhbGc..."
}

Response:
{
  "valid": true,
  "payload": {
    "userId": 2,
    "email": "collector1@example.com",
    "role": "collector"
  }
}
```

#### Logout
```
POST /api/trpc/auth.logout

Response:
{
  "success": true
}
```

### Collections Endpoints

#### Submit Collection
```
POST /api/trpc/collections.submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteName": "Kakamega Main Dumpsite",
  "wasteType": "Organic",
  "collectionDate": "2025-10-22",
  "totalVolume": 12.5,
  "wasteSeparated": true,
  "organicVolume": 8.5,
  "inorganicVolume": 4.0,
  "collectionCount": 3,
  "latitude": -0.3031,
  "longitude": 34.7616
}

Response:
{
  "success": true,
  "id": 1,
  "message": "Collection submitted successfully"
}
```

#### Get My Records
```
GET /api/trpc/collections.myRecords
Authorization: Bearer <token>

Response:
[
  {
    "id": 1,
    "siteName": "Kakamega Main Dumpsite",
    "wasteType": "Organic",
    "totalVolume": "12.50",
    "collectionDate": "2025-10-22",
    "createdAt": "2025-10-22T10:30:00Z"
  }
]
```

#### Get Filtered Collections
```
GET /api/trpc/collections.filtered?wasteType=Organic&startDate=2025-10-01&endDate=2025-10-31

Response:
[
  {
    "id": 1,
    "siteName": "Kakamega Main Dumpsite",
    "wasteType": "Organic",
    "totalVolume": "12.50",
    "latitude": "-0.3031",
    "longitude": "34.7616",
    "collectionDate": "2025-10-22"
  }
]
```

#### Get Summary Statistics
```
GET /api/trpc/collections.summary

Response:
{
  "totalRecords": 15,
  "totalVolume": 187.5,
  "wasteTypeBreakdown": {
    "Organic": 8,
    "Inorganic": 4,
    "Mixed": 3
  },
  "averageVolume": 12.5
}
```

#### Get Dashboard Data
```
GET /api/trpc/collections.dashboardData

Response:
{
  "collections": [...],
  "summary": {...},
  "trends": [
    {
      "date": "2025-10-22",
      "volume": 45.3
    }
  ]
}
```

## Project Structure

```
taka-ni-mali-v2/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing page with navigation
│   │   │   ├── Login.tsx           # Email/password login
│   │   │   ├── Register.tsx        # Account creation
│   │   │   ├── Dashboard.tsx       # Public dashboard with map/chart
│   │   │   ├── Collector.tsx       # Data collection form
│   │   │   └── MyRecords.tsx       # User's submissions
│   │   ├── components/
│   │   │   ├── MapView.tsx         # Leaflet map component
│   │   │   ├── ChartView.tsx       # Chart.js visualization
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── _core/
│   │   │   └── hooks/
│   │   │       └── useAuth.ts      # Authentication hook
│   │   ├── lib/
│   │   │   └── trpc.ts             # tRPC client setup
│   │   ├── App.tsx                 # Main app with routing
│   │   └── index.css               # Global styles
│   └── public/                      # Static assets (v1 data, images)
│
├── server/                          # Node.js/Express Backend
│   ├── routers/
│   │   ├── auth.ts                 # Authentication endpoints
│   │   └── collections.ts          # Collections endpoints
│   ├── _core/
│   │   ├── auth.ts                 # JWT utilities
│   │   ├── context.ts              # tRPC context with auth
│   │   └── trpc.ts                 # tRPC setup
│   ├── db.ts                        # Database query helpers
│   └── routers.ts                  # Main router setup
│
├── drizzle/                         # Database
│   ├── schema.ts                    # Table definitions
│   ├── migrations/                  # SQL migration files
│   └── 0002_brainy_husk.sql        # Password field migration
│
├── scripts/
│   └── seed.ts                      # Demo data seeding script
│
├── .env.example.standalone          # Environment template
├── README_FINAL.md                  # This file
├── SETUP_GUIDE_STANDALONE.md       # Detailed setup guide
└── package.json                     # Dependencies
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(320) UNIQUE,
  name TEXT,
  password TEXT,  -- Hashed with bcrypt
  role ENUM('user', 'admin', 'collector') DEFAULT 'user',
  loginMethod VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier
- `openId`: Unique user identifier (local_timestamp format for local auth)
- `email`: User email (unique)
- `name`: User's full name
- `password`: Bcrypt-hashed password
- `role`: User role (user, admin, collector)
- `loginMethod`: Auth method (local, oauth, etc.)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
- `lastSignedIn`: Last login timestamp

### Collections Table

```sql
CREATE TABLE collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  collectorId INT NOT NULL,
  siteName VARCHAR(255) NOT NULL,
  wasteType ENUM('Organic', 'Inorganic', 'Mixed') NOT NULL,
  collectionDate DATE NOT NULL,
  totalVolume DECIMAL(10, 2) NOT NULL,
  wasteSeparated BOOLEAN DEFAULT FALSE,
  organicVolume DECIMAL(10, 2),
  inorganicVolume DECIMAL(10, 2),
  collectionCount INT DEFAULT 1,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (collectorId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique collection record ID
- `collectorId`: Reference to submitting user
- `siteName`: Name of collection site
- `wasteType`: Type of waste (Organic, Inorganic, Mixed)
- `collectionDate`: Date of collection
- `totalVolume`: Total waste volume in tons
- `wasteSeparated`: Whether waste was separated
- `organicVolume`: Volume of organic waste (if separated)
- `inorganicVolume`: Volume of inorganic waste (if separated)
- `collectionCount`: Number of collection events
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp

## Deployment

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Vercel Project**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Configure:
     - **Build Command**: `pnpm build`
     - **Output Directory**: `client/dist`
     - **Install Command**: `pnpm install`

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Ensure `DATABASE_URL` points to production database

4. **Deploy**
   - Vercel automatically deploys on git push

### Backend (Render)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `pnpm install && pnpm db:push`
     - **Start Command**: `pnpm start`
     - **Environment**: Node

3. **Set Environment Variables**
   - Add all variables from `.env.local`
   - Update `DATABASE_URL` to production database

4. **Deploy**
   - Render automatically deploys on git push

### Database (AWS RDS / Azure Database)

1. **Create Database Instance**
   - Choose MySQL 8.0+ or PostgreSQL 12+
   - Configure security groups
   - Get connection string

2. **Update Environment**
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/database
   ```

3. **Run Migrations**
   ```bash
   pnpm db:push
   ```

## Demo Credentials

After running `pnpm ts-node scripts/seed.ts`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Collector 1 | collector1@example.com | password123 |
| Collector 2 | collector2@example.com | password123 |
| Public User | user@example.com | password123 |

**⚠️ Change these immediately in production!**

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- Verify database is running: `mysql -u root -p`
- Check DATABASE_URL in .env.local
- Verify credentials match

### JWT Secret Error
```
Error: JWT_SECRET environment variable is not set
```
**Solution:**
- Add JWT_SECRET to .env.local
- Ensure .env.local is in project root
- Restart dev server: `pnpm dev`

### Port Already in Use
```
Error: listen EADDRINUSE :::3000
```
**Solution:**
- Kill process: `lsof -ti:3000 | xargs kill -9`
- Or change PORT in .env.local

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Add frontend URL to ALLOWED_ORIGINS
- Include protocol: `https://yourdomain.com`
- Restart server

### Token Expired
```
Error: Invalid or expired token
```
**Solution:**
- Clear localStorage: DevTools → Application → LocalStorage → Delete auth_token
- Log in again

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run database migrations
pnpm db:push

# Seed demo data
pnpm ts-node scripts/seed.ts

# Type check
pnpm type-check

# Format code
pnpm format
```

## Support & Resources

- **Setup Issues**: See SETUP_GUIDE_STANDALONE.md
- **API Reference**: See API_DOCUMENTATION.md
- **Node.js Docs**: https://nodejs.org/docs/
- **React Docs**: https://react.dev/
- **Drizzle ORM**: https://orm.drizzle.team/
- **tRPC**: https://trpc.io/
- **Leaflet**: https://leafletjs.com/

## License

Part of the CE4HOW Initiative. All rights reserved.

---

**Version:** 2.0.0 (Standalone)  
**Last Updated:** October 2025  
**Status:** Production Ready

