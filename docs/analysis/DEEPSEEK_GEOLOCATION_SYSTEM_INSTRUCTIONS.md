# 🌍 INSTRUCCIONES PARA DEEPSEEK: SISTEMA DE GEOLOCALIZACIÓN MATCHAAUTO

**Proyecto**: MatchaAuto - Geolocation & Proximity Search Engine  
**Objetivo**: Crear un sistema de geolocalización completo para buscar vehículos por ubicación (ciudad, pueblo, estado, país, km/millas)  
**Stack**: Node.js + TypeScript + PostgreSQL + PostGIS + Redis  
**Tipos de Vehículos**: Autos, Autobuses, Lanchas, Aviones, Motos, Blindados, etc.

---

## 📋 TABLA DE CONTENIDOS

1. [Descripción del Sistema](#descripción-del-sistema)
2. [Arquitectura Técnica](#arquitectura-técnica)
3. [Estructura de Base de Datos](#estructura-de-base-de-datos)
4. [APIs y Endpoints](#apis-y-endpoints)
5. [Algoritmos de Búsqueda](#algoritmos-de-búsqueda)
6. [Instrucciones Detalladas por Archivo](#instrucciones-detalladas-por-archivo)
7. [Pruebas y Validación](#pruebas-y-validación)

---

## 🎯 DESCRIPCIÓN DEL SISTEMA

### Funcionalidades Principales

El sistema debe permitir:

1. **Búsqueda por Ubicación Exacta**
   - Coordenadas GPS (latitud, longitud)
   - Dirección completa (calle, número, ciudad, estado, país)

2. **Búsqueda por Radio de Distancia**
   - Radio en km o millas
   - Resultados ordenados por proximidad
   - Máximo 1000 resultados por búsqueda

3. **Búsqueda Jerárquica**
   - Por País
   - Por Estado/Provincia
   - Por Ciudad
   - Por Pueblo/Municipio
   - Por Código Postal

4. **Filtros Combinados**
   - Tipo de vehículo (auto, autobús, lancha, avión, moto, blindado, etc.)
   - Precio (mín-máx)
   - Año (mín-máx)
   - Marca/Modelo
   - Estado (nuevo, usado, en reparación)

5. **Optimizaciones de Rendimiento**
   - Caché en Redis
   - Índices geoespaciales en PostgreSQL
   - Búsqueda fuzzy para ciudades
   - Autocompletado de ubicaciones

### Tipos de Vehículos Soportados

```
- AUTO (Sedan, SUV, Coupe, Hatchback, Pickup, Minivan)
- AUTOBUS (Urbano, Interurbano, Escolar, Turístico)
- LANCHA (Pesca, Recreo, Turismo, Deportiva)
- AVION (Comercial, Privado, Carga, Helicóptero)
- MOTO (Deportiva, Crucero, Touring, Off-road)
- BLINDADO (Nivel 1-5)
- CAMION (Ligero, Mediano, Pesado)
- BICICLETA (Carretera, Montaña, Urbana)
- CUATRIMOTO (ATV)
- TRACTOR (Agrícola, Industrial)
```

---

## 🏗️ ARQUITECTURA TÉCNICA

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend/API Client                      │
│  (Next.js, React Native, Web App)                           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              API Gateway (Express/Fastify)                  │
│  ├─ /api/vehicles/search                                    │
│  ├─ /api/vehicles/nearby                                    │
│  ├─ /api/locations/autocomplete                             │
│  ├─ /api/locations/hierarchy                                │
│  └─ /api/vehicles/{id}/details                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──┐  ┌──────▼──┐  ┌─────▼──┐
│PostgreSQL│  │  Redis  │  │Geocoder│
│ +PostGIS │  │ (Cache) │  │(Google)│
└──────────┘  └─────────┘  └────────┘
```

### Flujo de Datos

```
1. Usuario ingresa ubicación (texto o GPS)
   ↓
2. Geocodificación (convertir texto a coordenadas)
   ↓
3. Búsqueda en PostGIS (índice geoespacial)
   ↓
4. Filtrado adicional (tipo, precio, etc.)
   ↓
5. Ordenamiento por distancia
   ↓
6. Caché en Redis
   ↓
7. Retornar resultados
```

---

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tabla: vehicles

```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('AUTO', 'AUTOBUS', 'LANCHA', 'AVION', 'MOTO', 'BLINDADO', 'CAMION', 'BICICLETA', 'CUATRIMOTO', 'TRACTOR') NOT NULL,
  subtype VARCHAR(100),
  
  -- Ubicación
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_point GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_GeomFromText('POINT(' || longitude || ' ' || latitude || ')', 4326)) STORED,
  
  address VARCHAR(500) NOT NULL,
  street VARCHAR(255),
  number VARCHAR(50),
  neighborhood VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  state_province VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL DEFAULT 'Colombia',
  postal_code VARCHAR(20),
  
  -- Información del vehículo
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(100),
  mileage INTEGER,
  fuel_type ENUM('GASOLINA', 'DIESEL', 'HIBRIDO', 'ELECTRICO', 'GAS', 'OTRO'),
  transmission ENUM('MANUAL', 'AUTOMATICA', 'CVT'),
  
  -- Precios
  price DECIMAL(15, 2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'COP',
  rental_price_per_day DECIMAL(10, 2),
  rental_price_per_hour DECIMAL(10, 2),
  
  -- Estado
  status ENUM('DISPONIBLE', 'VENDIDO', 'ALQUILADO', 'REPARACION', 'RESERVADO') DEFAULT 'DISPONIBLE',
  
  -- Vendedor
  seller_id UUID NOT NULL REFERENCES users(id),
  
  -- Metadatos
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Índices
  CONSTRAINT valid_coordinates CHECK (latitude >= -90 AND latitude <= 90 AND longitude >= -180 AND longitude <= 180)
);

-- Índices geoespaciales
CREATE INDEX idx_vehicles_location ON vehicles USING GIST (location_point);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_city ON vehicles(city);
CREATE INDEX idx_vehicles_state ON vehicles(state_province);
CREATE INDEX idx_vehicles_country ON vehicles(country);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_price ON vehicles(price);
CREATE INDEX idx_vehicles_year ON vehicles(year);
```

### Tabla: locations (Caché de ciudades/pueblos)

```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name VARCHAR(255) NOT NULL,
  type ENUM('PAIS', 'ESTADO', 'CIUDAD', 'PUEBLO', 'CODIGO_POSTAL') NOT NULL,
  
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_point GEOGRAPHY(POINT, 4326),
  
  country VARCHAR(255) NOT NULL,
  state_province VARCHAR(255),
  city VARCHAR(255),
  postal_code VARCHAR(20),
  
  -- Población aproximada
  population INTEGER,
  
  -- Slugs para URLs amigables
  slug VARCHAR(255) UNIQUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_location ON locations USING GIST (location_point);
```

### Tabla: vehicle_searches (Analytics)

```sql
CREATE TABLE vehicle_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES users(id),
  
  search_query VARCHAR(500),
  search_type ENUM('RADIUS', 'CITY', 'STATE', 'COUNTRY', 'HIERARCHY'),
  
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius_km DECIMAL(10, 2),
  
  filters JSONB,
  
  results_count INTEGER,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_searches_user ON vehicle_searches(user_id);
CREATE INDEX idx_searches_created ON vehicle_searches(created_at);
```

---

## 🔌 APIs Y ENDPOINTS

### 1. Búsqueda por Radio de Distancia

**Endpoint**: `POST /api/vehicles/nearby`

```typescript
// Request
{
  latitude: 4.7110,
  longitude: -74.0721,
  radius_km: 10,
  vehicle_type?: 'AUTO' | 'AUTOBUS' | 'LANCHA' | 'AVION' | 'MOTO' | 'BLINDADO',
  filters?: {
    min_price?: number,
    max_price?: number,
    min_year?: number,
    max_year?: number,
    brand?: string,
    status?: 'DISPONIBLE' | 'VENDIDO' | 'ALQUILADO' | 'REPARACION' | 'RESERVADO',
    fuel_type?: 'GASOLINA' | 'DIESEL' | 'HIBRIDO' | 'ELECTRICO',
    transmission?: 'MANUAL' | 'AUTOMATICA'
  },
  sort_by?: 'distance' | 'price' | 'year' | 'rating',
  limit?: number,
  offset?: number
}

// Response
{
  success: true,
  data: {
    search_id: 'uuid',
    center: { latitude: 4.7110, longitude: -74.0721 },
    radius_km: 10,
    total_results: 245,
    results: [
      {
        id: 'uuid',
        name: 'Tesla Model S Plaid',
        type: 'AUTO',
        subtype: 'Sedan',
        brand: 'Tesla',
        model: 'Model S',
        year: 2024,
        price: 150000000,
        price_currency: 'COP',
        distance_km: 2.5,
        distance_miles: 1.55,
        latitude: 4.7250,
        longitude: -74.0650,
        address: 'Carrera 7 #45-89, Bogotá',
        city: 'Bogotá',
        state_province: 'Cundinamarca',
        country: 'Colombia',
        status: 'DISPONIBLE',
        seller: {
          id: 'uuid',
          name: 'Juan Pérez',
          rating: 4.8,
          verified: true
        },
        images: ['url1', 'url2'],
        created_at: '2026-01-05T10:00:00Z'
      }
      // ... más resultados
    ]
  },
  timestamp: '2026-01-05T10:05:00Z'
}
```

### 2. Búsqueda por Ciudad

**Endpoint**: `GET /api/vehicles/search/by-city`

```typescript
// Query Parameters
{
  city: 'Bogotá',
  state_province?: 'Cundinamarca',
  country?: 'Colombia',
  vehicle_type?: 'AUTO',
  filters?: JSON.stringify({ min_price: 10000000, max_price: 100000000 }),
  limit?: 50,
  offset?: 0
}

// Response
{
  success: true,
  data: {
    location: {
      name: 'Bogotá',
      type: 'CIUDAD',
      country: 'Colombia',
      state_province: 'Cundinamarca',
      population: 8000000,
      latitude: 4.7110,
      longitude: -74.0721
    },
    total_results: 5432,
    results: [
      // ... vehículos disponibles en Bogotá
    ]
  }
}
```

### 3. Búsqueda Jerárquica

**Endpoint**: `GET /api/locations/hierarchy`

```typescript
// Query Parameters
{
  country: 'Colombia',
  state_province?: 'Cundinamarca',
  city?: 'Bogotá'
}

// Response
{
  success: true,
  data: {
    country: {
      name: 'Colombia',
      type: 'PAIS',
      vehicle_count: 125000,
      states: [
        {
          name: 'Cundinamarca',
          type: 'ESTADO',
          vehicle_count: 35000,
          cities: [
            {
              name: 'Bogotá',
              type: 'CIUDAD',
              vehicle_count: 28000,
              latitude: 4.7110,
              longitude: -74.0721
            },
            {
              name: 'Soacha',
              type: 'CIUDAD',
              vehicle_count: 3500,
              latitude: 4.5800,
              longitude: -74.2300
            }
          ]
        }
      ]
    }
  }
}
```

### 4. Autocompletado de Ubicaciones

**Endpoint**: `GET /api/locations/autocomplete`

```typescript
// Query Parameters
{
  query: 'Bog',
  country?: 'Colombia',
  limit?: 10
}

// Response
{
  success: true,
  data: [
    {
      id: 'uuid',
      name: 'Bogotá',
      type: 'CIUDAD',
      country: 'Colombia',
      state_province: 'Cundinamarca',
      latitude: 4.7110,
      longitude: -74.0721,
      vehicle_count: 28000
    },
    {
      id: 'uuid',
      name: 'Bogotá (Código Postal)',
      type: 'CODIGO_POSTAL',
      country: 'Colombia',
      postal_code: '110111'
    }
  ]
}
```

### 5. Detalles de Vehículo con Ubicación

**Endpoint**: `GET /api/vehicles/{id}`

```typescript
// Response
{
  success: true,
  data: {
    id: 'uuid',
    name: 'Tesla Model S Plaid',
    type: 'AUTO',
    // ... todos los detalles del vehículo
    location: {
      latitude: 4.7250,
      longitude: -74.0650,
      address: 'Carrera 7 #45-89, Bogotá',
      city: 'Bogotá',
      state_province: 'Cundinamarca',
      country: 'Colombia',
      postal_code: '110111',
      // Ubicaciones cercanas
      nearby_cities: [
        { name: 'Soacha', distance_km: 25 },
        { name: 'Zipaquirá', distance_km: 45 }
      ]
    },
    seller: { /* ... */ },
    images: [ /* ... */ ]
  }
}
```

### 6. Búsqueda Avanzada Multi-Criterio

**Endpoint**: `POST /api/vehicles/search/advanced`

```typescript
// Request
{
  location: {
    search_type: 'RADIUS', // 'RADIUS' | 'CITY' | 'STATE' | 'COUNTRY'
    latitude?: 4.7110,
    longitude?: -74.0721,
    radius_km?: 15,
    city?: 'Bogotá',
    state_province?: 'Cundinamarca',
    country?: 'Colombia'
  },
  vehicle_filters: {
    types: ['AUTO', 'MOTO'],
    brands: ['Tesla', 'BMW'],
    models: ['Model S', 'M340i'],
    min_year: 2020,
    max_year: 2024,
    min_price: 50000000,
    max_price: 200000000,
    fuel_types: ['ELECTRICO', 'GASOLINA'],
    transmission: 'AUTOMATICA',
    status: 'DISPONIBLE'
  },
  sorting: {
    field: 'distance', // 'distance' | 'price' | 'year' | 'rating'
    order: 'ASC' // 'ASC' | 'DESC'
  },
  pagination: {
    limit: 50,
    offset: 0
  }
}

// Response: Similar al endpoint /api/vehicles/nearby
```

---

## 🧮 ALGORITMOS DE BÚSQUEDA

### 1. Cálculo de Distancia (Haversine)

```typescript
// Distancia entre dos puntos GPS
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'km' | 'miles' = 'km'
): number {
  const R = unit === 'km' ? 6371 : 3959; // Radio de la Tierra
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### 2. Búsqueda Geoespacial en PostGIS

```sql
-- Buscar todos los vehículos dentro de un radio
SELECT 
  v.id,
  v.name,
  v.type,
  v.price,
  v.latitude,
  v.longitude,
  ST_Distance(
    v.location_point,
    ST_GeomFromText('POINT(-74.0721 4.7110)', 4326)::geography
  ) / 1000 AS distance_km
FROM vehicles v
WHERE 
  v.status = 'DISPONIBLE'
  AND ST_DWithin(
    v.location_point,
    ST_GeomFromText('POINT(-74.0721 4.7110)', 4326)::geography,
    10000 -- 10 km en metros
  )
ORDER BY distance_km ASC
LIMIT 100;
```

### 3. Búsqueda Fuzzy para Ciudades

```typescript
// Búsqueda aproximada usando Levenshtein distance
function fuzzySearchCities(query: string, cities: string[]): string[] {
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  return cities
    .map(city => ({
      city,
      distance: levenshteinDistance(query.toLowerCase(), city.toLowerCase())
    }))
    .filter(item => item.distance <= 2)
    .sort((a, b) => a.distance - b.distance)
    .map(item => item.city);
}
```

### 4. Caché Inteligente en Redis

```typescript
// Generar clave de caché
function generateCacheKey(
  searchType: string,
  params: Record<string, any>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${JSON.stringify(params[key])}`)
    .join('|');
  return `search:${searchType}:${Buffer.from(sortedParams).toString('base64')}`;
}

// Guardar en caché
async function cacheSearchResults(
  key: string,
  results: any[],
  ttl: number = 3600 // 1 hora
): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(results));
}

// Recuperar del caché
async function getCachedResults(key: string): Promise<any[] | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}
```

---

## 📝 INSTRUCCIONES DETALLADAS POR ARCHIVO

### ARCHIVO 1: `src/database/schema.ts`

**Descripción**: Esquema de base de datos con Prisma ORM

**Contenido a Generar**:

```typescript
// Definir modelos Prisma para:
// - Vehicle
// - Location
// - VehicleSearch
// - User
// - Seller
// - Review

// Incluir:
// - Relaciones entre modelos
// - Validaciones
// - Índices
// - Enums para tipos de vehículos
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/database/schema.ts` usando Prisma ORM que defina los modelos Vehicle, Location, VehicleSearch, User, Seller, Review con todas las relaciones, validaciones e índices geoespaciales necesarios para soportar búsqueda por ubicación. Incluye enums para tipos de vehículos (AUTO, AUTOBUS, LANCHA, AVION, MOTO, BLINDADO, CAMION, BICICLETA, CUATRIMOTO, TRACTOR) y estados (DISPONIBLE, VENDIDO, ALQUILADO, REPARACION, RESERVADO).

---

### ARCHIVO 2: `src/services/geolocation.service.ts`

**Descripción**: Servicio de geolocalización principal

**Contenido a Generar**:

```typescript
// Clase GeoLocationService con métodos:
// - searchNearby(lat, lon, radius, filters)
// - searchByCity(city, state, country, filters)
// - searchByHierarchy(country, state, city)
// - calculateDistance(lat1, lon1, lat2, lon2, unit)
// - geocodeAddress(address)
// - reverseGeocode(lat, lon)
// - getLocationHierarchy(country)
// - fuzzySearchLocations(query)
// - autocompleteLocations(query)

// Incluir:
// - Validaciones de entrada
// - Manejo de errores
// - Logging
// - Caché
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/geolocation.service.ts` que implemente la clase GeoLocationService con los siguientes métodos: searchNearby (búsqueda por radio), searchByCity (búsqueda por ciudad), searchByHierarchy (búsqueda jerárquica), calculateDistance (cálculo de distancia Haversine), geocodeAddress (convertir dirección a coordenadas), reverseGeocode (convertir coordenadas a dirección), getLocationHierarchy (obtener jerarquía de ubicaciones), fuzzySearchLocations (búsqueda aproximada), autocompleteLocations (autocompletado). Incluye validaciones, manejo de errores, logging y caché con Redis.

---

### ARCHIVO 3: `src/services/vehicle.service.ts`

**Descripción**: Servicio de vehículos con filtros

**Contenido a Generar**:

```typescript
// Clase VehicleService con métodos:
// - createVehicle(data)
// - updateVehicle(id, data)
// - deleteVehicle(id)
// - getVehicleById(id)
// - getVehiclesByType(type, filters)
// - getVehiclesByBrand(brand, filters)
// - getVehiclesByPriceRange(minPrice, maxPrice, filters)
// - filterVehicles(filters)
// - getVehicleStats()

// Incluir:
// - Validaciones
// - Búsqueda con Prisma
// - Paginación
// - Ordenamiento
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/vehicle.service.ts` que implemente la clase VehicleService con métodos para crear, actualizar, eliminar y buscar vehículos. Incluye métodos para filtrar por tipo, marca, rango de precio, año, combustible, transmisión y estado. Implementa paginación, ordenamiento y validaciones de datos.

---

### ARCHIVO 4: `src/controllers/geolocation.controller.ts`

**Descripción**: Controladores para endpoints de geolocalización

**Contenido a Generar**:

```typescript
// Clase GeoLocationController con métodos:
// - searchNearby(req, res)
// - searchByCity(req, res)
// - searchByHierarchy(req, res)
// - autocompleteLocations(req, res)
// - getLocationDetails(req, res)
// - advancedSearch(req, res)

// Incluir:
// - Validación de parámetros
// - Manejo de errores
// - Respuestas JSON
// - Logging
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/controllers/geolocation.controller.ts` que implemente controladores para los endpoints de geolocalización. Incluye validación de parámetros usando Zod, manejo de errores, respuestas JSON estructuradas y logging. Los controladores deben ser: searchNearby, searchByCity, searchByHierarchy, autocompleteLocations, getLocationDetails, advancedSearch.

---

### ARCHIVO 5: `src/controllers/vehicle.controller.ts`

**Descripción**: Controladores para endpoints de vehículos

**Contenido a Generar**:

```typescript
// Clase VehicleController con métodos:
// - createVehicle(req, res)
// - updateVehicle(req, res)
// - deleteVehicle(req, res)
// - getVehicleById(req, res)
// - listVehicles(req, res)
// - searchVehicles(req, res)

// Incluir:
// - Validación con Zod
// - Autenticación
// - Autorización
// - Manejo de errores
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/controllers/vehicle.controller.ts` que implemente controladores para CRUD de vehículos. Incluye validación con Zod, autenticación JWT, autorización basada en roles, manejo de errores y logging. Los controladores deben ser: createVehicle, updateVehicle, deleteVehicle, getVehicleById, listVehicles, searchVehicles.

---

### ARCHIVO 6: `src/routes/geolocation.routes.ts`

**Descripción**: Rutas de geolocalización

**Contenido a Generar**:

```typescript
// Definir rutas:
// POST /api/vehicles/nearby
// GET /api/vehicles/search/by-city
// GET /api/locations/hierarchy
// GET /api/locations/autocomplete
// GET /api/vehicles/{id}
// POST /api/vehicles/search/advanced

// Incluir:
// - Middleware de autenticación
// - Middleware de validación
// - Manejo de errores
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/routes/geolocation.routes.ts` que defina todas las rutas de geolocalización. Incluye: POST /api/vehicles/nearby, GET /api/vehicles/search/by-city, GET /api/locations/hierarchy, GET /api/locations/autocomplete, GET /api/vehicles/{id}, POST /api/vehicles/search/advanced. Cada ruta debe tener middleware de autenticación opcional, validación de parámetros y manejo de errores.

---

### ARCHIVO 7: `src/routes/vehicle.routes.ts`

**Descripción**: Rutas de vehículos

**Contenido a Generar**:

```typescript
// Definir rutas CRUD:
// POST /api/vehicles
// GET /api/vehicles
// GET /api/vehicles/{id}
// PUT /api/vehicles/{id}
// DELETE /api/vehicles/{id}

// Incluir:
// - Autenticación requerida
// - Autorización
// - Validación
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/routes/vehicle.routes.ts` que defina las rutas CRUD para vehículos. Incluye: POST /api/vehicles (crear), GET /api/vehicles (listar), GET /api/vehicles/{id} (obtener), PUT /api/vehicles/{id} (actualizar), DELETE /api/vehicles/{id} (eliminar). Todas las rutas requieren autenticación JWT y autorización apropiada.

---

### ARCHIVO 8: `src/utils/validators.ts`

**Descripción**: Validadores con Zod

**Contenido a Generar**:

```typescript
// Esquemas Zod para:
// - CreateVehicleSchema
// - UpdateVehicleSchema
// - SearchNearbySchema
// - SearchByCitySchema
// - AdvancedSearchSchema
// - LocationSchema
// - PaginationSchema

// Incluir:
// - Validaciones de coordenadas
// - Validaciones de distancia
// - Validaciones de precio
// - Validaciones de año
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/utils/validators.ts` que defina esquemas Zod para validar todos los inputs de la API. Incluye validadores para: CreateVehicleSchema, UpdateVehicleSchema, SearchNearbySchema, SearchByCitySchema, AdvancedSearchSchema, LocationSchema, PaginationSchema. Todos deben incluir validaciones de rangos, formatos y tipos de datos.

---

### ARCHIVO 9: `src/utils/distance.ts`

**Descripción**: Utilidades de cálculo de distancia

**Contenido a Generar**:

```typescript
// Funciones:
// - calculateHaversineDistance(lat1, lon1, lat2, lon2, unit)
// - calculateBoundingBox(lat, lon, radiusKm)
// - isPointInRadius(lat1, lon1, lat2, lon2, radiusKm)
// - formatDistance(distance, unit)
// - convertKmToMiles(km)
// - convertMilesToKm(miles)

// Incluir:
// - Validaciones
// - Manejo de errores
// - Tests
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/utils/distance.ts` que implemente funciones de cálculo de distancia geográfica. Incluye: calculateHaversineDistance (fórmula Haversine), calculateBoundingBox (caja delimitadora), isPointInRadius (verificar si punto está en radio), formatDistance (formatear distancia), convertKmToMiles, convertMilesToKm. Todas las funciones deben incluir validaciones y manejo de errores.

---

### ARCHIVO 10: `src/utils/geocoding.ts`

**Descripción**: Utilidades de geocodificación

**Contenido a Generar**:

```typescript
// Funciones:
// - geocodeAddress(address)
// - reverseGeocode(lat, lon)
// - parseAddress(address)
// - formatAddress(components)
// - fuzzyMatchCity(query, cities)
// - getLocationFromIP(ip)

// Incluye:
// - Integración con Google Geocoding API
// - Caché
// - Manejo de errores
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/utils/geocoding.ts` que implemente funciones de geocodificación. Incluye: geocodeAddress (convertir dirección a coordenadas), reverseGeocode (convertir coordenadas a dirección), parseAddress (parsear componentes de dirección), formatAddress (formatear dirección), fuzzyMatchCity (búsqueda aproximada de ciudades), getLocationFromIP (obtener ubicación desde IP). Integra con Google Geocoding API, implementa caché en Redis y manejo de errores.

---

### ARCHIVO 11: `src/middleware/auth.middleware.ts`

**Descripción**: Middleware de autenticación

**Contenido a Generar**:

```typescript
// Middleware:
// - verifyToken(req, res, next)
// - verifyRole(roles)(req, res, next)
// - optionalAuth(req, res, next)

// Incluir:
// - Verificación JWT
// - Manejo de errores
// - Logging
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/middleware/auth.middleware.ts` que implemente middleware de autenticación JWT. Incluye: verifyToken (verificar token JWT), verifyRole (verificar rol del usuario), optionalAuth (autenticación opcional). Todos deben incluir manejo de errores y logging.

---

### ARCHIVO 12: `src/middleware/validation.middleware.ts`

**Descripción**: Middleware de validación

**Contenido a Generar**:

```typescript
// Middleware:
// - validateBody(schema)
// - validateQuery(schema)
// - validateParams(schema)

// Incluir:
// - Validación con Zod
// - Manejo de errores
// - Respuestas de error formateadas
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/middleware/validation.middleware.ts` que implemente middleware de validación. Incluye: validateBody (validar cuerpo de solicitud), validateQuery (validar parámetros de query), validateParams (validar parámetros de ruta). Todos deben usar Zod y retornar errores formateados.

---

### ARCHIVO 13: `src/middleware/error.middleware.ts`

**Descripción**: Middleware de manejo de errores

**Contenido a Generar**:

```typescript
// Middleware:
// - errorHandler(err, req, res, next)
// - notFoundHandler(req, res, next)

// Incluir:
// - Tipos de errores personalizados
// - Logging
// - Respuestas de error formateadas
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/middleware/error.middleware.ts` que implemente middleware de manejo de errores. Incluye: errorHandler (capturar y formatear errores), notFoundHandler (manejar rutas no encontradas). Debe incluir tipos de errores personalizados, logging y respuestas de error formateadas.

---

### ARCHIVO 14: `src/config/database.ts`

**Descripción**: Configuración de base de datos

**Contenido a Generar**:

```typescript
// Configuración:
// - Conexión PostgreSQL
// - Inicialización Prisma
// - Migraciones
// - Seeding

// Incluir:
// - Variables de entorno
// - Manejo de conexiones
// - Logging
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/database.ts` que configure la conexión a PostgreSQL con Prisma ORM. Incluye: inicialización de cliente Prisma, manejo de conexiones, logging, variables de entorno. Debe soportar múltiples ambientes (desarrollo, testing, producción).

---

### ARCHIVO 15: `src/config/redis.ts`

**Descripción**: Configuración de Redis

**Contenido a Generar**:

```typescript
// Configuración:
// - Conexión Redis
// - Opciones de caché
// - TTLs por defecto

// Incluir:
// - Variables de entorno
// - Manejo de errores
// - Logging
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/redis.ts` que configure la conexión a Redis. Incluye: inicialización del cliente Redis, opciones de caché, TTLs por defecto, variables de entorno, manejo de errores y logging.

---

### ARCHIVO 16: `src/config/env.ts`

**Descripción**: Configuración de variables de entorno

**Contenido a Generar**:

```typescript
// Validar y cargar:
// - DATABASE_URL
// - REDIS_URL
// - GOOGLE_GEOCODING_API_KEY
// - JWT_SECRET
// - NODE_ENV
// - PORT
// - LOG_LEVEL

// Incluir:
// - Validación con Zod
// - Valores por defecto
// - Documentación
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/env.ts` que valide y cargue todas las variables de entorno necesarias. Incluye: DATABASE_URL, REDIS_URL, GOOGLE_GEOCODING_API_KEY, JWT_SECRET, NODE_ENV, PORT, LOG_LEVEL. Usa Zod para validación, proporciona valores por defecto y documentación.

---

### ARCHIVO 17: `src/app.ts`

**Descripción**: Aplicación Express principal

**Contenido a Generar**:

```typescript
// Configurar:
// - Express app
// - Middleware global
// - Rutas
// - Manejo de errores

// Incluir:
// - CORS
// - Logging
// - Compresión
// - Rate limiting
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/app.ts` que configure la aplicación Express. Incluye: middleware global (CORS, logging, compresión, rate limiting), rutas de geolocalización y vehículos, manejo de errores, middleware 404. La app debe estar lista para usar.

---

### ARCHIVO 18: `src/server.ts`

**Descripción**: Servidor principal

**Contenido a Generar**:

```typescript
// Configurar:
// - Iniciar servidor
// - Conectar base de datos
// - Conectar Redis
// - Logging

// Incluir:
// - Graceful shutdown
// - Manejo de errores
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/server.ts` que inicie el servidor Express. Incluye: conexión a base de datos, conexión a Redis, logging, graceful shutdown, manejo de errores no capturados.

---

### ARCHIVO 19: `src/types/index.ts`

**Descripción**: Tipos TypeScript globales

**Contenido a Generar**:

```typescript
// Tipos:
// - Vehicle
// - Location
// - User
// - Seller
// - SearchParams
// - SearchResult
// - ApiResponse
// - Error types

// Incluir:
// - Documentación
// - Validaciones
```

**Instrucción para DeepSeek**:
> Genera un archivo `src/types/index.ts` que defina todos los tipos TypeScript necesarios. Incluye: Vehicle, Location, User, Seller, SearchParams, SearchResult, ApiResponse, tipos de error. Todos deben estar documentados y validados.

---

### ARCHIVO 20: `prisma/schema.prisma`

**Descripción**: Esquema Prisma

**Contenido a Generar**:

```prisma
// Modelos:
// - User
// - Seller
// - Vehicle
// - Location
// - VehicleSearch
// - Review

// Incluir:
// - Relaciones
// - Índices
// - Validaciones
```

**Instrucción para DeepSeek**:
> Genera un archivo `prisma/schema.prisma` que defina todos los modelos de base de datos. Incluye: User, Seller, Vehicle, Location, VehicleSearch, Review con todas las relaciones, índices geoespaciales y validaciones. El esquema debe soportar búsqueda por ubicación con PostGIS.

---

### ARCHIVO 21: `prisma/migrations/init.sql`

**Descripción**: Migración inicial de base de datos

**Contenido a Generar**:

```sql
-- Crear:
// - Extensión PostGIS
// - Tablas
// - Índices
// - Funciones

// Incluir:
// - Documentación
// - Validaciones
```

**Instrucción para DeepSeek**:
> Genera un archivo `prisma/migrations/init.sql` que cree la estructura inicial de la base de datos. Incluye: extensión PostGIS, tablas (users, sellers, vehicles, locations, vehicle_searches, reviews), índices geoespaciales, índices de búsqueda, funciones de utilidad. Debe estar completamente documentado.

---

### ARCHIVO 22: `scripts/seed.ts`

**Descripción**: Script de seeding de datos

**Contenido a Generar**:

```typescript
// Seed:
// - Usuarios de prueba
// - Vendedores de prueba
// - Ciudades y pueblos
// - Vehículos de prueba

// Incluir:
// - Datos realistas
// - Múltiples tipos de vehículos
// - Ubicaciones variadas
```

**Instrucción para DeepSeek**:
> Genera un archivo `scripts/seed.ts` que popule la base de datos con datos de prueba. Incluye: usuarios de prueba, vendedores, ciudades y pueblos de Colombia (Bogotá, Medellín, Cali, Barranquilla, etc.), vehículos de prueba de todos los tipos (autos, autobuses, lanchas, aviones, motos, blindados, etc.) con ubicaciones variadas y precios realistas.

---

### ARCHIVO 23: `tests/geolocation.test.ts`

**Descripción**: Tests de geolocalización

**Contenido a Generar**:

```typescript
// Tests:
// - searchNearby
// - searchByCity
// - calculateDistance
// - geocodeAddress
// - fuzzySearch
// - autocomplete

// Incluir:
// - Casos de éxito
// - Casos de error
// - Casos límite
```

**Instrucción para DeepSeek**:
> Genera un archivo `tests/geolocation.test.ts` que implemente tests unitarios e integración para el servicio de geolocalización. Incluye tests para: searchNearby, searchByCity, calculateDistance, geocodeAddress, fuzzySearch, autocomplete. Cada test debe incluir casos de éxito, error y límite.

---

### ARCHIVO 24: `tests/vehicle.test.ts`

**Descripción**: Tests de vehículos

**Contenido a Generar**:

```typescript
// Tests:
// - createVehicle
// - updateVehicle
// - deleteVehicle
// - getVehicleById
// - filterVehicles

// Incluir:
// - Casos de éxito
// - Casos de error
// - Validaciones
```

**Instrucción para DeepSeek**:
> Genera un archivo `tests/vehicle.test.ts` que implemente tests unitarios para el servicio de vehículos. Incluye tests para: createVehicle, updateVehicle, deleteVehicle, getVehicleById, filterVehicles. Cada test debe incluir casos de éxito, error y validaciones.

---

### ARCHIVO 25: `.env.example`

**Descripción**: Ejemplo de variables de entorno

**Contenido a Generar**:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/matchaauto

# Redis
REDIS_URL=redis://localhost:6379

# Google Geocoding
GOOGLE_GEOCODING_API_KEY=your_api_key_here

# JWT
JWT_SECRET=your_jwt_secret_here

# Environment
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

**Instrucción para DeepSeek**:
> Genera un archivo `.env.example` con todas las variables de entorno necesarias. Incluye: DATABASE_URL, REDIS_URL, GOOGLE_GEOCODING_API_KEY, JWT_SECRET, NODE_ENV, PORT, LOG_LEVEL con valores de ejemplo y comentarios.

---

### ARCHIVO 26: `package.json`

**Descripción**: Configuración de dependencias

**Contenido a Generar**:

```json
{
  "name": "matchaauto-geolocation",
  "version": "1.0.0",
  "description": "Geolocation system for MatchaAuto",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx scripts/seed.ts",
    "db:studio": "prisma studio",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "express": "^4.18.2",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "redis": "^4.6.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.1",
    "axios": "^1.5.0",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^7.0.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "pino": "^8.16.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "tsx": "^3.13.0",
    "@types/node": "^20.5.0",
    "@types/express": "^4.17.17",
    "vitest": "^0.34.0",
    "eslint": "^8.48.0",
    "prettier": "^3.0.0"
  }
}
```

**Instrucción para DeepSeek**:
> Genera un archivo `package.json` con todas las dependencias necesarias. Incluye scripts para desarrollo, build, tests, migraciones de base de datos. Las dependencias principales son: express, prisma, redis, zod, dotenv, axios, jsonwebtoken, bcryptjs, express-rate-limit, cors, compression, pino.

---

### ARCHIVO 27: `tsconfig.json`

**Descripción**: Configuración de TypeScript

**Contenido a Generar**:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Instrucción para DeepSeek**:
> Genera un archivo `tsconfig.json` con configuración de TypeScript. Incluye: target ES2020, strict mode, esModuleInterop, path aliases (@/*), outDir dist, rootDir src.

---

### ARCHIVO 28: `README.md`

**Descripción**: Documentación del proyecto

**Contenido a Generar**:

```markdown
# MatchaAuto Geolocation System

Sistema de geolocalización completo para MatchaAuto que permite buscar vehículos por ubicación.

## Características

- Búsqueda por radio de distancia (km/millas)
- Búsqueda por ciudad, estado, país
- Búsqueda jerárquica
- Autocompletado de ubicaciones
- Filtros avanzados
- Caché inteligente
- API RESTful

## Instalación

1. Clonar repositorio
2. npm install
3. Configurar .env
4. npm run db:push
5. npm run db:seed
6. npm run dev

## Endpoints

### Búsqueda por Radio
POST /api/vehicles/nearby

### Búsqueda por Ciudad
GET /api/vehicles/search/by-city

### Jerarquía de Ubicaciones
GET /api/locations/hierarchy

### Autocompletado
GET /api/locations/autocomplete

## Documentación Completa

Ver DEEPSEEK_GEOLOCATION_SYSTEM_INSTRUCTIONS.md
```

**Instrucción para DeepSeek**:
> Genera un archivo `README.md` con documentación completa del proyecto. Incluye: descripción, características, instalación, endpoints principales, ejemplos de uso, estructura del proyecto.

---

## ✅ PRUEBAS Y VALIDACIÓN

### Checklist de Pruebas

- [ ] **Búsqueda por Radio**: Verificar que retorna vehículos dentro del radio especificado
- [ ] **Búsqueda por Ciudad**: Verificar que retorna todos los vehículos en la ciudad
- [ ] **Cálculo de Distancia**: Verificar precisión del cálculo Haversine
- [ ] **Geocodificación**: Verificar conversión de dirección a coordenadas
- [ ] **Caché**: Verificar que las búsquedas se cachean correctamente
- [ ] **Filtros**: Verificar que los filtros funcionan correctamente
- [ ] **Paginación**: Verificar que la paginación funciona correctamente
- [ ] **Autocompletado**: Verificar que el autocompletado retorna resultados relevantes
- [ ] **Errores**: Verificar que los errores se manejan correctamente
- [ ] **Performance**: Verificar que las búsquedas son rápidas (< 200ms)

### Ejemplos de Prueba

```bash
# Búsqueda por radio
curl -X POST http://localhost:3000/api/vehicles/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 4.7110,
    "longitude": -74.0721,
    "radius_km": 10,
    "vehicle_type": "AUTO",
    "limit": 50
  }'

# Búsqueda por ciudad
curl -X GET "http://localhost:3000/api/vehicles/search/by-city?city=Bogotá&country=Colombia"

# Autocompletado
curl -X GET "http://localhost:3000/api/locations/autocomplete?query=Bog"
```

---

## 🎯 RESUMEN PARA DEEPSEEK

**Instrucción Principal para DeepSeek**:

> Eres un ingeniero de software experto. Tu tarea es generar un **sistema de geolocalización completo y profesional** para MatchaAuto que permita buscar vehículos (autos, autobuses, lanchas, aviones, motos, blindados, etc.) por ubicación.

> **Requisitos**:
> 1. Stack: Node.js + Express + TypeScript + PostgreSQL + PostGIS + Redis
> 2. Generar los 28 archivos especificados en las instrucciones detalladas
> 3. Cada archivo debe ser completo, funcional y listo para producción
> 4. Incluir validaciones, manejo de errores, logging y tests
> 5. Implementar búsqueda por: radio (km/millas), ciudad, estado, país, código postal
> 6. Implementar caché inteligente en Redis
> 7. Implementar autocompletado de ubicaciones
> 8. Implementar filtros avanzados (tipo, precio, año, marca, etc.)
> 9. Implementar paginación y ordenamiento
> 10. Incluir documentación completa

> **Archivos a Generar**:
> 1. src/database/schema.ts
> 2. src/services/geolocation.service.ts
> 3. src/services/vehicle.service.ts
> 4. src/controllers/geolocation.controller.ts
> 5. src/controllers/vehicle.controller.ts
> 6. src/routes/geolocation.routes.ts
> 7. src/routes/vehicle.routes.ts
> 8. src/utils/validators.ts
> 9. src/utils/distance.ts
> 10. src/utils/geocoding.ts
> 11. src/middleware/auth.middleware.ts
> 12. src/middleware/validation.middleware.ts
> 13. src/middleware/error.middleware.ts
> 14. src/config/database.ts
> 15. src/config/redis.ts
> 16. src/config/env.ts
> 17. src/app.ts
> 18. src/server.ts
> 19. src/types/index.ts
> 20. prisma/schema.prisma
> 21. prisma/migrations/init.sql
> 22. scripts/seed.ts
> 23. tests/geolocation.test.ts
> 24. tests/vehicle.test.ts
> 25. .env.example
> 26. package.json
> 27. tsconfig.json
> 28. README.md

> **Especificaciones Técnicas**:
> - Usar Prisma ORM con PostgreSQL + PostGIS para geolocalización
> - Usar Redis para caché con TTL inteligente
> - Usar Zod para validación de datos
> - Usar JWT para autenticación
> - Usar Pino para logging
> - Implementar cálculo de distancia Haversine
> - Implementar búsqueda fuzzy para ciudades
> - Implementar índices geoespaciales en PostgreSQL
> - Soportar múltiples tipos de vehículos
> - Soportar búsqueda en km y millas

> **Tipos de Vehículos**:
> AUTO, AUTOBUS, LANCHA, AVION, MOTO, BLINDADO, CAMION, BICICLETA, CUATRIMOTO, TRACTOR

> **Ubicaciones Soportadas**:
> País, Estado/Provincia, Ciudad, Pueblo/Municipio, Código Postal

> **Endpoints Principales**:
> - POST /api/vehicles/nearby (búsqueda por radio)
> - GET /api/vehicles/search/by-city (búsqueda por ciudad)
> - GET /api/locations/hierarchy (jerarquía de ubicaciones)
> - GET /api/locations/autocomplete (autocompletado)
> - POST /api/vehicles/search/advanced (búsqueda avanzada)
> - GET /api/vehicles/{id} (detalles del vehículo)

> **Filtros Disponibles**:
> - Tipo de vehículo
> - Marca y modelo
> - Rango de precio
> - Rango de año
> - Tipo de combustible
> - Transmisión
> - Estado (disponible, vendido, alquilado, reparación, reservado)

> **Performance Targets**:
> - Búsqueda por radio: < 200ms
> - Búsqueda por ciudad: < 300ms
> - Autocompletado: < 100ms
> - Caché hit rate: > 80%

> Genera todos los archivos ahora. No hagas preguntas, solo genera el código completo y funcional.

---

**FIN DE INSTRUCCIONES PARA DEEPSEEK**

---

## 📞 SOPORTE

Para preguntas o clarificaciones sobre las instrucciones, contacta al equipo de MatchaAuto.

**Documento Preparado Por**: Manus AI - Ingeniero de Sistemas 10x  
**Fecha**: 5 de Enero de 2026  
**Versión**: 1.0  
**Estado**: Listo para DeepSeek
