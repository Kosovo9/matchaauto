-- 🌍 MIGRATION: EXTENDED SPATIAL TABLES (v2)
-- Objetive: Support Reverse Geocoding Cache and Service Directory
-- 1. Reverse Geocoding Cache
CREATE TABLE IF NOT EXISTS reverse_geocode_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    full_address TEXT NOT NULL,
    country TEXT,
    country_code VARCHAR(10),
    state TEXT,
    county TEXT,
    city TEXT,
    district TEXT,
    street TEXT,
    house_number VARCHAR(50),
    postal_code VARCHAR(20),
    confidence DECIMAL(3, 2) DEFAULT 0.50,
    location_type VARCHAR(50),
    provider VARCHAR(50),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure uniqueness for caching
    CONSTRAINT unique_address_location UNIQUE (latitude, longitude, full_address)
);
-- Indexes for Reverse Geocoding
CREATE INDEX idx_rev_geocache_location ON reverse_geocode_cache USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
);
CREATE INDEX idx_rev_geocache_updated ON reverse_geocode_cache(updated_at);
-- 2. Services Directory (Charging stations, Mechanics, etc.)
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    -- 'charging', 'mechanic', 'wash', etc.
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    price_range JSONB,
    -- {min: 10, max: 50, currency: 'USD'}
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    features JSONB DEFAULT '{}',
    -- ['wifi', 'coffee', 'fast_charging']
    availability JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_open BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Indexes for Services
CREATE INDEX idx_services_location ON services USING GIST (location);
CREATE INDEX idx_services_type ON services(type);
CREATE INDEX idx_services_rating ON services(rating);
-- Trigger for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_services_timestamp BEFORE
UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
CREATE TRIGGER update_rev_geocache_timestamp BEFORE
UPDATE ON reverse_geocode_cache FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();