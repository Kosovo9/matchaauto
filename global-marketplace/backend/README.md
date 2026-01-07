# 🌍 MatchaAuto Geolocation Backend (1000x)

High-performance geolocation and proximity search engine built with Hono, PostGIS, and Redis.

## 🚀 Features

- **Spatial Search**: Ultra-fast nearby vehicle discovery using PostGIS GIST indexes.
- **Geofencing**: Automated geofence entry/exit detection.
- **Hierarchical Clustering**: Real-time vehicle density visualization using DBScan.
- **Universal Search**: Supports Cars, Buses, Boats, Planes, Motorcycles, and Armored vehicles.
- **Multiplex Geocoding**: Concurrent support for Nominatim and Google Maps with Redis caching.

## 🛠 Tech Stack

- **Framework**: [Hono](https://hono.dev/) (Cloudflare Workers / Node.js)
- **Database**: PostgreSQL + PostGIS Extension
- **Cache**: Upstash Redis (REST)
- **Validation**: Zod
- **ORM**: Prisma (Relational) + Direct SQL (Spatial)

## 📦 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment**:
   ```bash
   cp .env.example .env
   # Update variables
   ```

3. **Migrations**:
   ```bash
   psql $DATABASE_URL -f src/database/geo-migrations.sql
   psql $DATABASE_URL -f src/database/geo-indexes.sql
   ```

4. **Development**:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

- `GET /api/locations/nearby?lat={lat}&lng={lng}&radius={meters}`
- `GET /api/locations/autocomplete?q={query}`
- `GET /api/vehicles`
- `POST /api/vehicles`

## 🔒 Security

- All endpoints protected by `authMiddleware`.
- Input validation on all requests using Zod.
- PostGIS triggers for coordinate safety.

---
© 2026 MatchaAuto | Built for 1000x Scalability
