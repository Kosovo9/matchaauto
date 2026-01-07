-- Fixes and Additions for Block 1 Services (10x Optimization)
-- 1. Add missing 'previous_location' to geofence_events
ALTER TABLE geofence_events
ADD COLUMN IF NOT EXISTS previous_location GEOGRAPHY(Point, 4326),
    ADD COLUMN IF NOT EXISTS accuracy INTEGER,
    ADD COLUMN IF NOT EXISTS entity_id UUID,
    ADD COLUMN IF NOT EXISTS entity_type VARCHAR(20);
-- 2. Create 'validated_addresses' table for AddressValidationService
CREATE TABLE IF NOT EXISTS validated_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    street VARCHAR(200),
    street_number VARCHAR(50),
    unit VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2),
    country_name VARCHAR(100),
    formatted_address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timezone VARCHAR(50),
    accuracy DOUBLE PRECISION,
    validation_score DOUBLE PRECISION,
    provider VARCHAR(50),
    raw_response JSONB,
    usage_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(street, city, postal_code, country)
);
CREATE INDEX IF NOT EXISTS idx_validated_addr_search ON validated_addresses(postal_code, country, city);
-- 3. Create 'location_cache' table for LocationCacheService (Postgres Layer)
CREATE TABLE IF NOT EXISTS location_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    entity_id UUID UNIQUE NOT NULL,
    entity_type VARCHAR(20) CHECK (
        entity_type IN ('user', 'vehicle', 'service', 'asset')
    ),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    accuracy INTEGER,
    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    battery_level INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_location_cache_geo ON location_cache USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_location_cache_expiry ON location_cache(expires_at);
-- 4. Create 'spatial_grid_index' for ultra-fast spatial lookups
CREATE TABLE IF NOT EXISTS spatial_grid_index (
    geohash VARCHAR(12) PRIMARY KEY,
    entity_ids UUID [],
    updated_at TIMESTAMPTZ DEFAULT NOW()
);