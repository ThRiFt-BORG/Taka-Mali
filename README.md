# CE4HOW Taka ni Mali - Geospatial Waste Management M&E Dashboard v2

A full-stack Monitoring & Evaluation (M&E) system for tracking waste collection across Kakamega Municipality. Built with React, TypeScript, Tailwind CSS, tRPC, and Drizzle ORM.

## 🎯 Overview

**Taka ni Mali** (Money in Waste) is a geospatial dashboard that extends the original static Leaflet waste map into a comprehensive M&E system. It enables:

- **Data Collectors** to securely submit waste collection records with geospatial coordinates
- **Public Users** to view aggregated analytics, trends, and interactive maps
- **Administrators** to manage data, users, and system configuration

## ✨ Key Features

### Public Dashboard (No Authentication Required)
- **Interactive Map**: Leaflet-based visualization of waste collection sites in Kakamega County
- **Dynamic Filtering**: Filter by waste type, date range, and collection site
- **Data Table**: View detailed collection records with sorting and pagination
- **Trend Analysis**: Chart.js line chart showing waste collection volumes over time
- **Summary Statistics**: Total records, volume aggregates, and waste type breakdown

### Collector Interface (Authenticated)
- **Data Submission Form**: Submit waste collection records with:
  - Collection date and site name
  - Waste type (Organic, Inorganic, Mixed)
  - Total volume and separation status
  - Separated volumes (organic/inorganic) when applicable
  - Number of collections
  - Geospatial coordinates (latitude/longitude)
- **Form Validation**: Client and server-side validation with volume constraints
- **My Records**: View all submitted records with filtering and export options

### Authentication & Security
- **Manus OAuth Integration**: Secure user authentication with 24-hour JWT tokens
- **Role-Based Access Control (RBAC)**:
  - `admin`: Full system access
  - `collector`: Data submission and record management
  - `user`: Public dashboard access only
- **Encrypted Passwords**: bcrypt hashing for all credentials
- **CORS Protection**: Configured for Vercel frontend and localhost

## 🗂️ Project Structure

```
taka-ni-mali-v2/
├── client/                          # React + Vite frontend
│   ├── public/
│   │   ├── images/                 # v1 waste site images
│   │   ├── waste_data.geojson      # v1 waste collection points
│   │   └── Kakamega County.geojson # v1 administrative boundary
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Dashboard.tsx       # Public analytics dashboard
│   │   │   ├── Collector.tsx       # Data collection form
│   │   │   └── MyRecords.tsx       # Collector's submissions
│   │   ├── components/
│   │   │   ├── MapView.tsx         # Leaflet map component
│   │   │   └── ChartView.tsx       # Chart.js visualization
│   │   ├── lib/
│   │   │   └── trpc.ts             # tRPC client
│   │   ├── App.tsx                 # Main routing
│   │   └── main.tsx                # Entry point
│   └── package.json
├── server/
│   ├── routers/
│   │   └── collections.ts          # Collections API endpoints
│   ├── routers.ts                  # Main tRPC router
│   ├── db.ts                       # Database helpers
│   └── _core/                      # Framework internals
├── drizzle/
│   ├── schema.ts                   # Database schema (users, collections)
│   └── migrations/                 # Database migrations
└── package.json
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  role ENUM('user', 'admin', 'collector') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

### Collections Table
```sql
CREATE TABLE collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  collectorId INT NOT NULL REFERENCES users(id),
  siteName VARCHAR(255) NOT NULL,
  wasteType ENUM('Organic', 'Inorganic', 'Mixed') NOT NULL,
  collectionDate DATE NOT NULL,
  totalVolume DECIMAL(10,2) NOT NULL,
  wasteSeparated BOOLEAN DEFAULT FALSE,
  organicVolume DECIMAL(10,2),
  inorganicVolume DECIMAL(10,2),
  collectionCount INT DEFAULT 1,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## 🔌 API Endpoints

### Collections API

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/api/trpc/collections.submit` | POST | Collector | Submit new collection record |
| `/api/trpc/collections.myRecords` | GET | Collector | Fetch collector's own records |
| `/api/trpc/collections.filtered` | GET | Public | Filter collections by type/date/site |
| `/api/trpc/collections.summary` | GET | Public | Get aggregated statistics |
| `/api/trpc/collections.dashboardData` | GET | Public | Combined data for map and charts |

### Request/Response Examples

**Submit Collection:**
```bash
POST /api/trpc/collections.submit
Content-Type: application/json

{
  "siteName": "Kakamega Main Dumpsite",
  "wasteType": "Mixed",
  "collectionDate": "2025-10-27",
  "totalVolume": 5.5,
  "wasteSeparated": true,
  "organicVolume": 3.2,
  "inorganicVolume": 2.3,
  "collectionCount": 2,
  "latitude": -0.3031,
  "longitude": 34.7616
}
```

**Get Filtered Collections:**
```bash
GET /api/trpc/collections.filtered?wasteType=Organic&startDate=2025-10-01&endDate=2025-10-31
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL or MySQL database
- Manus OAuth credentials (for authentication)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd taka-ni-mali-v2
   pnpm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your database and OAuth credentials
   ```

3. **Initialize Database**
   ```bash
   pnpm db:push
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Frontend: http://localhost:5173
   Backend: http://localhost:3000

### Environment Variables

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/waste_me_db

# Authentication
JWT_SECRET=your_secret_key_here
OAUTH_SERVER_URL=https://api.manus.im

# Frontend
VITE_APP_TITLE=CE4HOW Taka ni Mali
VITE_APP_LOGO=https://example.com/logo.png
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# CORS
ALLOWED_ORIGINS=https://taka-ni-mali.vercel.app,http://localhost:5173
```

## 📊 Data Collection Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Collection Date | Date | ✅ | Must be valid date |
| Site Name | Text | ✅ | Min 1 character |
| Waste Type | Dropdown | ✅ | Organic/Inorganic/Mixed |
| Total Volume | Number | ✅ | Must be > 0 |
| Waste Separated | Boolean | ✅ | Yes/No |
| Organic Volume | Number | Optional | Only if separated |
| Inorganic Volume | Number | Optional | Only if separated |
| Number of Collections | Number | ✅ | Must be ≥ 1 |
| Latitude | Number | ✅ | Range: -90 to 90 |
| Longitude | Number | ✅ | Range: -180 to 180 |

**Validation Rules:**
- If `wasteSeparated` is true: `organicVolume + inorganicVolume ≤ totalVolume`
- All numeric fields must be positive
- Dates must be in valid ISO format

## 🔐 Security Features

- **HTTPS Enforced**: All production deployments use HTTPS
- **JWT Tokens**: 24-hour expiry with automatic refresh
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Protection**: Drizzle ORM parameterized queries
- **CORS Configuration**: Restricted to authorized origins
- **Input Validation**: Both client and server-side validation
- **Rate Limiting**: Recommended for production deployments

## 📱 Responsive Design

The dashboard is fully responsive:
- **Desktop (1024px+)**: Two-column layout (filters/table + map/chart)
- **Tablet (768px-1023px)**: Stacked layout with collapsible panels
- **Mobile (<768px)**: Single column, touch-friendly controls

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication flow (login, logout, session persistence)
- [ ] Data submission with various waste types
- [ ] Form validation (empty fields, invalid volumes)
- [ ] Filtering by waste type, date range, and site
- [ ] Map marker rendering and click interaction
- [ ] Chart updates with filter changes
- [ ] Table sorting and pagination
- [ ] RBAC enforcement (collector vs public access)
- [ ] Responsive design on mobile/tablet
- [ ] v1 map functionality preservation

### Automated Testing
```bash
pnpm test
```

## 📦 Deployment

### Frontend (Vercel)
1. Push to GitHub repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Backend (Render/Railway)
1. Create new service on Render/Railway
2. Connect GitHub repository
3. Set environment variables
4. Configure database connection
5. Deploy

### Database (Supabase/Neon)
1. Create PostgreSQL database
2. Update `DATABASE_URL` in environment
3. Run migrations: `pnpm db:push`

## 📚 Documentation

- **API Documentation**: See API Endpoints section above
- **Setup Guide**: See Getting Started section
- **Database Schema**: See Database Schema section
- **Environment Variables**: See Environment Variables section

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of the CE4HOW Initiative. All rights reserved.

## 👥 Support

For issues, questions, or feature requests, please contact the CE4HOW development team.

---

**Version**: 2.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready

