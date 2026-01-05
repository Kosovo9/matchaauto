# MATCH-AUTO: ESQUEMA DE BASE DE DATOS CUÁNTICA 10X

Para lograr una velocidad cuántica 10x, la base de datos debe estar diseñada para minimizar los *joins* complejos y maximizar la localidad de los datos en el Edge.

---

## 1. ARQUITECTURA DE DATOS DISTRIBUIDA

| Capa | Tecnología | Función Crítica | Optimización 10x |
| :--- | :--- | :--- | :--- |
| **Edge Cache** | **Cloudflare D1** | Datos de solo lectura (Ciudades, Categorías). | Latencia <10ms. |
| **Primary Store** | **Supabase (Postgres)** | Datos relacionales y transaccionales. | RLS y PostGIS nativo. |
| **Media Metadata** | **Cloudflare R2 Metadata** | Información de archivos (billones). | Acceso directo desde el Edge. |

---

## 2. ESQUEMA DE TABLAS CLAVE (SQL OPTIMIZADO)

### 2.1. Tabla de Usuarios (Profiles)
Optimizada para acceso rápido y seguridad Clerk.
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY, -- Sincronizado con Clerk ID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user', -- user, affiliate, admin, vp
  trust_score FLOAT DEFAULT 5.0,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB, -- Preferencias, idioma, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### 2.2. Tabla de Vehículos (Listings)
Diseñada para búsquedas geo-espaciales instantáneas.
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(15,2),
  currency CHAR(3) DEFAULT 'MXN',
  category_id INT, -- 1: Car, 2: Plane, 3: Boat, etc.
  make TEXT,
  model TEXT,
  year INT,
  mileage INT,
  location_id INT, -- Referencia a D1
  geo_point GEOGRAPHY(POINT), -- PostGIS para radio search
  media_urls JSONB, -- Array de URLs de R2/Stream
  status TEXT DEFAULT 'active', -- active, sold, flagged
  is_featured BOOLEAN DEFAULT FALSE,
  is_vp BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_listings_geo ON listings USING GIST (geo_point);
CREATE INDEX idx_listings_price_cat ON listings(price, category_id);
```

### 2.3. Tabla de Anuncios (Match-Ads)
Estructura de alto rendimiento para el motor de publicidad.
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES profiles(id),
  ad_type TEXT, -- banner, featured, video
  target_geo JSONB, -- Segmentación por ciudad/estado
  target_categories INT[], -- Segmentación por tipo de vehículo
  budget_daily DECIMAL(12,2),
  spent_today DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);
CREATE INDEX idx_ads_status_dates ON ads(status, start_date, end_date);
```

### 2.4. Tabla de Transacciones y Donaciones
Trazabilidad total para el 3% GP.
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(15,2),
  type TEXT, -- ad_payment, payout, donation
  gp_contribution DECIMAL(15,2), -- El 3% calculado
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. OPTIMIZACIÓN 10X REAL
1.  **Denormalización Selectiva:** Uso de `JSONB` para metadatos y URLs de medios para evitar *joins* en consultas de búsqueda masiva.
2.  **Índices GIST y GIN:** Para búsquedas geográficas y de texto completo ultra-rápidas.
3.  **Read Replicas:** Distribución de la base de datos Supabase en múltiples regiones para estar cerca de los usuarios globales.
4.  **Connection Pooling:** Uso de **Supavisor** para manejar miles de conexiones simultáneas sin latencia.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Quantum DB Architecture 💎
