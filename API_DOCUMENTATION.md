# CE4HOW Taka ni Mali v2 - API Documentation

Complete API reference for the Geospatial Waste Management M&E Dashboard.

## Overview

The API is built with tRPC and provides type-safe RPC endpoints. All endpoints are accessed via `/api/trpc/` prefix.

## Authentication

All authenticated endpoints require a valid JWT token in the session cookie. The token is automatically set after OAuth login.

**Headers:**
```
Cookie: session=<jwt_token>
```

**Token Expiry:** 24 hours

## Response Format

All responses follow the tRPC format:

```json
{
  "result": {
    "data": { /* endpoint-specific data */ }
  }
}
```

Errors return:
```json
{
  "error": {
    "code": "UNAUTHORIZED|FORBIDDEN|BAD_REQUEST|INTERNAL_SERVER_ERROR",
    "message": "Error description"
  }
}
```

## Collections Endpoints

### 1. Submit Collection

**Endpoint:** `POST /api/trpc/collections.submit`

**Access:** Collector, Admin

**Description:** Submit a new waste collection record.

**Request Body:**
```json
{
  "siteName": "Kakamega Main Dumpsite",
  "wasteType": "Organic",
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

**Field Descriptions:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| siteName | string | ✅ | Min 1 char, max 255 chars |
| wasteType | enum | ✅ | "Organic" \| "Inorganic" \| "Mixed" |
| collectionDate | string | ✅ | ISO 8601 date format (YYYY-MM-DD) |
| totalVolume | number | ✅ | > 0, max 2 decimal places |
| wasteSeparated | boolean | ✅ | true \| false |
| organicVolume | number | Optional | Required if wasteSeparated=true |
| inorganicVolume | number | Optional | Required if wasteSeparated=true |
| collectionCount | number | ✅ | Integer ≥ 1 |
| latitude | number | ✅ | -90 to 90 |
| longitude | number | ✅ | -180 to 180 |

**Validation Rules:**
- If `wasteSeparated` is true: `organicVolume + inorganicVolume ≤ totalVolume`
- All volumes must be positive numbers
- Collection date must be valid and not in future

**Success Response (200):**
```json
{
  "result": {
    "data": {
      "success": true,
      "message": "Collection submitted successfully"
    }
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | User not authenticated |
| 403 | FORBIDDEN | Only collectors can submit data |
| 400 | BAD_REQUEST | Invalid input (validation error) |
| 500 | INTERNAL_SERVER_ERROR | Database error |

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/trpc/collections.submit \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<jwt_token>" \
  -d '{
    "siteName": "Kakamega Main Dumpsite",
    "wasteType": "Organic",
    "collectionDate": "2025-10-27",
    "totalVolume": 5.5,
    "wasteSeparated": true,
    "organicVolume": 3.2,
    "inorganicVolume": 2.3,
    "collectionCount": 2,
    "latitude": -0.3031,
    "longitude": 34.7616
  }'
```

---

### 2. Get My Records

**Endpoint:** `GET /api/trpc/collections.myRecords`

**Access:** Collector, Admin

**Description:** Retrieve all collection records submitted by the authenticated user.

**Query Parameters:** None

**Success Response (200):**
```json
{
  "result": {
    "data": [
      {
        "id": 1,
        "collectorId": 5,
        "siteName": "Kakamega Main Dumpsite",
        "wasteType": "Organic",
        "collectionDate": "2025-10-27",
        "totalVolume": "5.50",
        "wasteSeparated": true,
        "organicVolume": "3.20",
        "inorganicVolume": "2.30",
        "collectionCount": 2,
        "latitude": "-0.3031",
        "longitude": "34.7616",
        "createdAt": "2025-10-27T12:00:00Z",
        "updatedAt": "2025-10-27T12:00:00Z"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | UNAUTHORIZED | User not authenticated |
| 403 | FORBIDDEN | Only collectors can view records |
| 500 | INTERNAL_SERVER_ERROR | Database error |

**Example cURL:**
```bash
curl http://localhost:3000/api/trpc/collections.myRecords \
  -H "Cookie: session=<jwt_token>"
```

---

### 3. Get Filtered Collections

**Endpoint:** `GET /api/trpc/collections.filtered`

**Access:** Public (no authentication required)

**Description:** Retrieve collection records with optional filtering.

**Query Parameters:**

| Parameter | Type | Optional | Description |
|-----------|------|----------|-------------|
| siteName | string | ✅ | Filter by site name (exact match) |
| wasteType | enum | ✅ | Filter by waste type |
| startDate | string | ✅ | Filter by start date (ISO 8601) |
| endDate | string | ✅ | Filter by end date (ISO 8601) |

**Success Response (200):**
```json
{
  "result": {
    "data": [
      {
        "id": 1,
        "collectorId": 5,
        "siteName": "Kakamega Main Dumpsite",
        "wasteType": "Organic",
        "collectionDate": "2025-10-27",
        "totalVolume": "5.50",
        "wasteSeparated": true,
        "organicVolume": "3.20",
        "inorganicVolume": "2.30",
        "collectionCount": 2,
        "latitude": "-0.3031",
        "longitude": "34.7616",
        "createdAt": "2025-10-27T12:00:00Z",
        "updatedAt": "2025-10-27T12:00:00Z"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | BAD_REQUEST | Invalid filter parameters |
| 500 | INTERNAL_SERVER_ERROR | Database error |

**Example cURL:**
```bash
# Get all records
curl http://localhost:3000/api/trpc/collections.filtered

# Filter by waste type
curl "http://localhost:3000/api/trpc/collections.filtered?wasteType=Organic"

# Filter by date range
curl "http://localhost:3000/api/trpc/collections.filtered?startDate=2025-10-01&endDate=2025-10-31"

# Filter by site and waste type
curl "http://localhost:3000/api/trpc/collections.filtered?siteName=Kakamega%20Main%20Dumpsite&wasteType=Mixed"
```

---

### 4. Get Summary Statistics

**Endpoint:** `GET /api/trpc/collections.summary`

**Access:** Public (no authentication required)

**Description:** Get aggregated statistics across all collections.

**Query Parameters:** None

**Success Response (200):**
```json
{
  "result": {
    "data": {
      "totalRecords": 42,
      "totalVolume": 234.56,
      "byWasteType": {
        "Organic": 15,
        "Inorganic": 18,
        "Mixed": 9
      },
      "bySite": {
        "Kakamega Main Dumpsite": 25,
        "Khayega Dumpsite": 12,
        "Lurambi Collection Point": 5
      }
    }
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 500 | INTERNAL_SERVER_ERROR | Database error |

**Example cURL:**
```bash
curl http://localhost:3000/api/trpc/collections.summary
```

---

### 5. Get Dashboard Data

**Endpoint:** `GET /api/trpc/collections.dashboardData`

**Access:** Public (no authentication required)

**Description:** Get combined data for dashboard visualization (trends and map markers).

**Query Parameters:** None

**Success Response (200):**
```json
{
  "result": {
    "data": {
      "trendData": {
        "2025-10-20": 12.5,
        "2025-10-21": 18.3,
        "2025-10-22": 15.7,
        "2025-10-23": 22.1,
        "2025-10-24": 19.8,
        "2025-10-25": 25.4,
        "2025-10-26": 21.2,
        "2025-10-27": 18.9
      },
      "markers": [
        {
          "id": 1,
          "lat": -0.3031,
          "lng": 34.7616,
          "siteName": "Kakamega Main Dumpsite",
          "wasteType": "Organic",
          "volume": 5.5,
          "date": "2025-10-27T12:00:00Z"
        },
        {
          "id": 2,
          "lat": -0.2950,
          "lng": 34.7700,
          "siteName": "Khayega Dumpsite",
          "wasteType": "Mixed",
          "volume": 8.2,
          "date": "2025-10-27T14:30:00Z"
        }
      ],
      "summary": {
        "totalRecords": 42,
        "totalVolume": 234.56
      }
    }
  }
}
```

**Data Structure:**

| Field | Type | Description |
|-------|------|-------------|
| trendData | object | Daily waste volumes (date → volume) |
| markers | array | Map markers with coordinates and details |
| summary | object | Aggregated totals |

**Marker Object:**

| Field | Type | Description |
|-------|------|-------------|
| id | number | Collection record ID |
| lat | number | Latitude coordinate |
| lng | number | Longitude coordinate |
| siteName | string | Waste collection site name |
| wasteType | string | Type of waste (Organic/Inorganic/Mixed) |
| volume | number | Total waste volume in tons |
| date | string | Collection date (ISO 8601) |

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 500 | INTERNAL_SERVER_ERROR | Database error |

**Example cURL:**
```bash
curl http://localhost:3000/api/trpc/collections.dashboardData
```

---

## Authentication Endpoints

### Login

**Endpoint:** Handled by Manus OAuth

**Flow:**
1. User clicks "Login"
2. Redirected to `VITE_OAUTH_PORTAL_URL`
3. After authentication, redirected back to `/api/oauth/callback`
4. Session cookie set with JWT token
5. Redirected to dashboard

### Logout

**Endpoint:** `POST /api/trpc/auth.logout`

**Access:** Authenticated users

**Description:** Clear session cookie and log out user.

**Success Response (200):**
```json
{
  "result": {
    "data": {
      "success": true
    }
  }
}
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | User not authenticated |
| FORBIDDEN | 403 | User lacks required permissions |
| BAD_REQUEST | 400 | Invalid input or validation error |
| NOT_FOUND | 404 | Resource not found |
| INTERNAL_SERVER_ERROR | 500 | Server error |

### Error Response Format

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Separated volumes cannot exceed total volume",
    "data": {
      "code": "BAD_REQUEST",
      "httpStatus": 400
    }
  }
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployments, consider:

```bash
# Recommended limits
- 100 requests per minute per IP
- 10 requests per second per authenticated user
- 1000 requests per hour per IP
```

---

## CORS Configuration

The API allows requests from:
- `http://localhost:5173` (local development)
- `https://taka-ni-mali.vercel.app` (production)

To add more origins, update `ALLOWED_ORIGINS` in `.env.local`.

---

## Testing Endpoints

### Using cURL

```bash
# Test public endpoint (no auth required)
curl http://localhost:3000/api/trpc/collections.summary

# Test authenticated endpoint
curl -H "Cookie: session=<jwt_token>" \
  http://localhost:3000/api/trpc/collections.myRecords

# Test POST endpoint
curl -X POST http://localhost:3000/api/trpc/collections.submit \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<jwt_token>" \
  -d '{"siteName":"Test","wasteType":"Organic",...}'
```

### Using Postman

1. Import the API collection
2. Set up environment variables:
   - `base_url`: http://localhost:3000
   - `jwt_token`: <your_jwt_token>
3. Use `{{base_url}}` and `{{jwt_token}}` in requests

### Using tRPC Client (React)

```typescript
import { trpc } from "@/lib/trpc";

// Query
const { data } = trpc.collections.summary.useQuery();

// Mutation
const mutation = trpc.collections.submit.useMutation();
await mutation.mutateAsync({
  siteName: "Test",
  wasteType: "Organic",
  // ... other fields
});
```

---

## Versioning

Current API Version: **v1**

No breaking changes are planned. Future versions will maintain backward compatibility.

---

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages
3. Check database logs
4. Contact CE4HOW development team

---

**Last Updated**: October 2025  
**Version**: 2.0.0

