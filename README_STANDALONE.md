# CE4HOW Taka ni Mali v2 - Geospatial Waste Management M&E Dashboard

A production-ready full-stack web application for monitoring and evaluating waste collection activities across Kakamega Municipality. Built with React, TypeScript, tRPC, and Drizzle ORM with **standalone JWT-based authentication** (no external dependencies).

## Overview

This system extends the original static Leaflet waste map (v1) into a comprehensive monitoring and evaluation platform with:

- **Interactive Geospatial Dashboard**: Real-time visualization of waste collection sites on an interactive map
- **Data Collection Interface**: Authenticated form for submitting waste collection records
- **Advanced Analytics**: Charts, filters, and summaries of waste collection trends
- **Role-Based Access Control**: Admin, collector, and public user roles
- **Secure Authentication**: JWT tokens with bcrypt password hashing
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Key Features

### Public Dashboard
- Interactive Leaflet map showing all waste collection sites
- Dynamic markers color-coded by waste type
- Real-time data table with filtering and sorting
- Chart.js visualization of collection trends
- Summary statistics (total records, volume, waste type breakdown)
- No authentication required

### Data Collection (Authenticated)
- Form for submitting waste collection records
- Fields: site name, waste type, volume, separation status, coordinates
- Form validation with volume constraints
- Success/error feedback
- View and manage personal submissions

### Authentication
- User registration with email and password
- Login with JWT token generation
- Token stored in localStorage
- Automatic token refresh on page load
- Secure logout functionality

## Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- shadcn/ui (component library)
- Leaflet (mapping)
- Chart.js (charting)
- tRPC (type-safe API calls)

**Backend:**
- Node.js + Express (server)
- tRPC (RPC framework)
- Drizzle ORM (database)
- JWT (authentication)
- bcryptjs (password hashing)
- MySQL/PostgreSQL (database)

**Database:**
- MySQL 8.0+ or PostgreSQL 12+
- Drizzle ORM with migrations

## Project Structure

```
taka-ni-mali-v2/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/            # Page components (Home, Login, Register, Dashboard, etc.)
│   │   ├── components/       # Reusable UI components (MapView, ChartView, etc.)
│   │   ├── _core/            # Core utilities (hooks, auth helpers)
│   │   ├── lib/              # Library setup (tRPC client)
│   │   ├── App.tsx           # Main app with routing
│   │   └── index.css         # Global styles
│   └── public/               # Static assets (v1 GeoJSON data, images)
├── server/                    # Node.js/Express backend
│   ├── routers/              # tRPC routers (auth, collections, etc.)
│   ├── _core/                # Core utilities (auth, context, etc.)
│   ├── db.ts                 # Database query helpers
│   └── routers.ts            # Main router setup
├── drizzle/                   # Database schema and migrations
│   ├── schema.ts             # Table definitions
│   └── migrations/           # SQL migration files
├── scripts/                   # Utility scripts (seed, etc.)
├── .env.example.standalone   # Environment variables template
├── README_STANDALONE.md      # This file
└── SETUP_GUIDE.md           # Detailed setup instructions
```

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MySQL 8.0+ or PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taka-ni-mali-v2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example.standalone .env.local
   # Edit .env.local with your database and JWT credentials
   ```

4. **Set up the database**
   ```bash
   # Create database in your MySQL/PostgreSQL server
   # Then run migrations
   pnpm db:push
   ```

5. **Seed demo data (optional)**
   ```bash
   pnpm ts-node scripts/seed.ts
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

   The app will be available at:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Demo Credentials

After running the seed script, use these credentials to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Collector 1 | collector1@example.com | password123 |
| Collector 2 | collector2@example.com | password123 |
| Public User | user@example.com | password123 |

**Note:** Change these credentials immediately in production!

## Environment Variables

### Required
- `DATABASE_URL`: Database connection string (MySQL or PostgreSQL)
- `JWT_SECRET`: Secret key for JWT signing (minimum 32 characters)

### Optional
- `JWT_ALGORITHM`: JWT algorithm (default: HS256)
- `JWT_EXPIRES_HOURS`: Token expiration time (default: 24)
- `ALLOWED_ORIGINS`: CORS allowed origins (comma-separated)
- `PORT`: Backend port (default: 3000)
- `VITE_PORT`: Frontend port (default: 5173)

See `.env.example.standalone` for complete documentation.

## API Endpoints

### Authentication
- `POST /api/trpc/auth.register` - Create new account
- `POST /api/trpc/auth.login` - Login and get JWT token
- `GET /api/trpc/auth.me` - Get current user (requires token)
- `POST /api/trpc/auth.verify` - Verify token validity
- `POST /api/trpc/auth.logout` - Logout (client-side operation)

### Collections
- `POST /api/trpc/collections.submit` - Submit waste collection record
- `GET /api/trpc/collections.myRecords` - Get user's submissions
- `GET /api/trpc/collections.filtered` - Get filtered collections
- `GET /api/trpc/collections.summary` - Get summary statistics
- `GET /api/trpc/collections.dashboardData` - Get dashboard data

See `API_DOCUMENTATION.md` for detailed endpoint specifications.

## Authentication Flow

1. **Registration**: User creates account with email and password
   - Password is hashed with bcrypt (10 salt rounds)
   - User is assigned "collector" role by default

2. **Login**: User logs in with email and password
   - System verifies password against stored hash
   - JWT token is generated and returned
   - Token is stored in localStorage

3. **API Calls**: Token is sent in Authorization header
   - Format: `Authorization: Bearer <token>`
   - Backend verifies token and extracts user info
   - User context is available in protected procedures

4. **Token Expiration**: Tokens expire after 24 hours
   - User must log in again to get new token
   - Expired tokens return 401 Unauthorized

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(320) UNIQUE,
  name TEXT,
  password TEXT,  -- Hashed password for local auth
  role ENUM('user', 'admin', 'collector') DEFAULT 'user',
  loginMethod VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

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

## Deployment

### Frontend (Vercel, Netlify, or similar)
1. Set environment variables in deployment platform
2. Build: `pnpm build`
3. Deploy `dist` folder

### Backend (Render, Railway, Heroku, or similar)
1. Set environment variables in deployment platform
2. Run migrations: `pnpm db:push`
3. Start server: `pnpm start`

### Database
- Use managed PostgreSQL or MySQL service (AWS RDS, Azure Database, etc.)
- Ensure SSL connections are enabled
- Set `DATABASE_URL` with proper credentials

## Security Considerations

1. **JWT Secret**: Use a cryptographically secure random string (minimum 32 characters)
2. **Password Hashing**: Passwords are hashed with bcrypt (10 salt rounds)
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure ALLOWED_ORIGINS to only trusted domains
5. **Token Storage**: Tokens are stored in localStorage (consider using httpOnly cookies for higher security)
6. **SQL Injection**: Drizzle ORM prevents SQL injection through parameterized queries
7. **Rate Limiting**: Consider implementing rate limiting on auth endpoints

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure database server is running
- Check database user has proper permissions

### JWT Token Invalid
- Verify JWT_SECRET matches between frontend and backend
- Check token hasn't expired (24 hours)
- Ensure Authorization header format is correct: `Bearer <token>`

### CORS Errors
- Add your frontend URL to ALLOWED_ORIGINS
- Include protocol (http/https) and port if needed
- Separate multiple origins with commas

### Port Already in Use
- Change PORT or VITE_PORT in .env.local
- Or kill the process using the port

## Development

### Add New Feature
1. Update database schema in `drizzle/schema.ts`
2. Run migrations: `pnpm db:push`
3. Add query helper in `server/db.ts`
4. Create tRPC router in `server/routers/feature.ts`
5. Add router to main `server/routers.ts`
6. Create frontend pages/components in `client/src/pages/`
7. Wire up with tRPC hooks

### Run Tests
```bash
pnpm test
```

### Format Code
```bash
pnpm format
```

### Type Check
```bash
pnpm type-check
```

## Preserving v1 Functionality

All v1 functionality (static Leaflet map with GeoJSON data) is preserved:
- Original GeoJSON boundary data for Kakamega County is in `client/public/data/`
- Original waste site images are in `client/public/images/`
- Original map styling and markers are integrated into the Dashboard component
- v1 map is accessible at `/dashboard` (public, no authentication required)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checks
4. Submit a pull request

## License

This project is part of the CE4HOW Initiative. All rights reserved.

## Support

For issues, questions, or contributions, please contact the development team or submit an issue on the project repository.

## Changelog

### v2.0.0 (Current)
- Complete rewrite with React + TypeScript
- JWT-based authentication (no external OAuth)
- Full-stack tRPC implementation
- Interactive dashboard with Leaflet mapping
- Real-time data collection and analytics
- Role-based access control
- Production-ready deployment

### v1.0.0
- Static Leaflet map with GeoJSON data
- Basic waste site visualization
- No authentication or data collection

---

**Last Updated:** October 2025  
**Version:** 2.0.0  
**Status:** Production Ready

