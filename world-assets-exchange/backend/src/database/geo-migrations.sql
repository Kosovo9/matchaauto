-- ============================================
-- POSTGIS MIGRATIONS FOR MATCHA AUTO 1000x
-- ============================================
-- Migration 001: Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
-- CREATE EXTENSION IF NOT EXISTS postgis_sfcgal; -- Optional, depends on environment
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Migration 002: Create spatial tables
-- Note: Assuming users and vehicles tables exist. If not, foreign keys will fail.
CREATE TABLE IF NOT EXISTS vehicle_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    accuracy INTEGER CHECK (
        accuracy >= 0
        AND accuracy <= 100
    ),
    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION CHECK (speed >= 0),
    heading DOUBLE PRECISION CHECK (
        heading >= 0
        AND heading <= 360
    ),
    battery_level INTEGER CHECK (
        battery_level >= 0
        AND battery_level <= 100
    ),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Migration 003: Create user locations table
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    session_id VARCHAR(255),
    device_type VARCHAR(50) CHECK (device_type IN ('mobile', 'web', 'api', 'iot')),
    accuracy INTEGER DEFAULT 50 CHECK (
        accuracy >= 0
        AND accuracy <= 100
    ),
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    is_online BOOLEAN DEFAULT FALSE,
    geofence_id UUID,
    search_radius INTEGER DEFAULT 10000 CHECK (
        search_radius >= 100
        AND search_radius <= 50000
    ),
    preferences JSONB DEFAULT '{"unit": "km", "maxDistance": 50, "autoRefresh": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Migration 004: Create geofences table
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    geometry GEOGRAPHY(Polygon, 4326) NOT NULL,
    center GEOGRAPHY(Point, 4326) NOT NULL,
    radius INTEGER NOT NULL CHECK (
        radius >= 10
        AND radius <= 50000
    ),
    is_active BOOLEAN DEFAULT TRUE,
    rules JSONB DEFAULT '{
        "notifyOnEntry": true,
        "notifyOnExit": true,
        "autoMatch": false,
        "restrictions": [],
        "speedLimit": null,
        "operatingHours": null
    }',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    CONSTRAINT valid_polygon CHECK (
        ST_IsValid(geometry::geometry)
        AND ST_Area(geometry::geometry) > 0
    )
);
-- Migration 005: Create geofence events table
CREATE TABLE IF NOT EXISTS geofence_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    geofence_id UUID NOT NULL,
    event_type VARCHAR(20) CHECK (
        event_type IN ('entry', 'exit', 'inside', 'nearby')
    ),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    distance_meters DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Migration 006: Create spatial analytics table
CREATE TABLE IF NOT EXISTS spatial_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    hour INTEGER NOT NULL CHECK (
        hour >= 0
        AND hour <= 23
    ),
    region VARCHAR(100),
    bounding_box GEOGRAPHY(Polygon, 4326),
    total_vehicles INTEGER DEFAULT 0 CHECK (total_vehicles >= 0),
    active_vehicles INTEGER DEFAULT 0 CHECK (active_vehicles >= 0),
    total_users INTEGER DEFAULT 0 CHECK (total_users >= 0),
    active_users INTEGER DEFAULT 0 CHECK (active_users >= 0),
    avg_speed DOUBLE PRECISION CHECK (avg_speed >= 0),
    max_density_point GEOGRAPHY(Point, 4326),
    heatmap_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, hour, region)
);
-- Migration 007: Create location history table
CREATE TABLE IF NOT EXISTS location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(20) CHECK (entity_type IN ('user', 'vehicle')),
    entity_id UUID NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    accuracy INTEGER,
    altitude DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    battery_level INTEGER,
    geofence_id UUID,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Migration 008: Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_geo ON vehicle_locations USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_user_locations_geo ON user_locations USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_geofences_geo ON geofences USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_geofences_center ON geofences USING GIST (center);
-- Migration 009: Create spatial functions
CREATE OR REPLACE FUNCTION calculate_bearing(
        lat1 DOUBLE PRECISION,
        lon1 DOUBLE PRECISION,
        lat2 DOUBLE PRECISION,
        lon2 DOUBLE PRECISION
    ) RETURNS DOUBLE PRECISION AS $$
DECLARE d_lon DOUBLE PRECISION;
x DOUBLE PRECISION;
y DOUBLE PRECISION;
bearing DOUBLE PRECISION;
BEGIN d_lon = radians(lon2 - lon1);
lat1 = radians(lat1);
lat2 = radians(lat2);
y = sin(d_lon) * cos(lat2);
x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(d_lon);
bearing = degrees(atan2(y, x));
RETURN (bearing + 360) % 360;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
-- Migration 010: Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_location_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_vehicle_locations_updated BEFORE
UPDATE ON vehicle_locations FOR EACH ROW EXECUTE FUNCTION update_location_timestamp();
CREATE TRIGGER trg_user_locations_updated BEFORE
UPDATE ON user_locations FOR EACH ROW EXECUTE FUNCTION update_location_timestamp();
CREATE TRIGGER trg_geofences_updated BEFORE
UPDATE ON geofences FOR EACH ROW EXECUTE FUNCTION update_location_timestamp();