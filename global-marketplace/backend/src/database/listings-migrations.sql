-- Migration for Block 2: Listings & Vehicle Management
-- 1. Create Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    vin VARCHAR(17),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    trim VARCHAR(50),
    color VARCHAR(30),
    mileage NUMERIC(10, 2) NOT NULL,
    mileage_unit VARCHAR(10) DEFAULT 'km',
    fuel_type VARCHAR(20),
    transmission VARCHAR(20),
    drivetrain VARCHAR(20),
    features JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    price NUMERIC(12, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (
        status IN (
            'draft',
            'published',
            'sold',
            'reserved',
            'maintenance'
        )
    ),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);
-- 2. Create Static Vehicle Locations (for Search Optimization)
CREATE TABLE IF NOT EXISTS vehicle_locations_static (
    vehicle_id UUID PRIMARY KEY REFERENCES vehicles(id) ON DELETE CASCADE,
    location GEOGRAPHY(Point, 4326),
    address_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_loc_static_geo ON vehicle_locations_static USING GIST (location);
-- 3. Create User Preferences (for Matching)
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY,
    brands JSONB,
    price_min NUMERIC(12, 2),
    price_max NUMERIC(12, 2),
    vehicle_types JSONB,
    year_min INTEGER,
    features JSONB,
    max_distance_km INTEGER DEFAULT 100,
    notification_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- 4. Full Text Search Index (Simple TSVector)
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS text_search_vector TSVECTOR;
CREATE INDEX IF NOT EXISTS idx_vehicles_search ON vehicles USING GIN(text_search_vector);
CREATE OR REPLACE FUNCTION vehicles_search_trigger() RETURNS trigger AS $$ begin new.text_search_vector := to_tsvector(
        'english',
        coalesce(new.make, '') || ' ' || coalesce(new.model, '') || ' ' || coalesce(new.description, '')
    );
return new;
end $$ LANGUAGE plpgsql;
CREATE TRIGGER tsvectorupdate BEFORE
INSERT
    OR
UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE vehicles_search_trigger();