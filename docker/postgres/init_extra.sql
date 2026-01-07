-- ==========================================
-- 🛡️ MASTER INITIALIZATION SCRIPT (210x Optimized)
-- ==========================================
-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
-- 2. User & Auth Registry (Sovereign Identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    reputation_score INT DEFAULT 100,
    identity_verified BOOLEAN DEFAULT false,
    trust_badge VARCHAR(20) DEFAULT 'ROOKIE',
    is_wholesale BOOLEAN DEFAULT false,
    company_tax_id VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 3. Vehicle Listings (Match-Auto Core)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vin VARCHAR(17),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    trim TEXT,
    color TEXT,
    mileage NUMERIC(15, 2),
    mileage_unit VARCHAR(10) DEFAULT 'km',
    fuel_type TEXT,
    transmission TEXT,
    drivetrain TEXT,
    features JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    price NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Vehicle Locations (Static index for performance)
CREATE TABLE IF NOT EXISTS vehicle_locations_static (
    vehicle_id UUID PRIMARY KEY REFERENCES vehicles(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Marketplace Network (@)
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active',
    category VARCHAR(50) NOT NULL,
    images JSONB DEFAULT '[]',
    location GEOGRAPHY(POINT, 4326),
    is_featured BOOLEAN DEFAULT false,
    is_wholesale_only BOOLEAN DEFAULT false,
    wholesale_min_qty INT DEFAULT 1,
    wholesale_price_hidden NUMERIC(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 6. Real Estate Assets (World Assets Exchange)
CREATE TABLE IF NOT EXISTS real_estate_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    type VARCHAR(30) NOT NULL,
    -- house, land, commercial
    address TEXT,
    area_sqft NUMERIC(10, 2),
    amenities JSONB DEFAULT '[]',
    location GEOGRAPHY(POINT, 4326),
    escrow_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 7. Transactions & Payment History
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    -- manual, lemon_squeezy
    status VARCHAR(20) DEFAULT 'pending',
    gateway_id TEXT,
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 8. Ad Network & Revenue
CREATE TABLE IF NOT EXISTS ad_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(20) NOT NULL,
    -- matchauto, marketplace, assets
    slot_type VARCHAR(20) NOT NULL,
    -- banner, featured
    price_cpm NUMERIC(8, 2) NOT NULL,
    active BOOLEAN DEFAULT true,
    total_impressions BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 9. Pro Features (Identity, Jury, Media)
CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    id_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    plaintiff_id UUID NOT NULL REFERENCES users(id),
    defendant_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    jury_votes JSONB DEFAULT '{}',
    -- {leader_id: vote}
    final_decision TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL,
    buyer_id UUID NOT NULL REFERENCES users(id),
    offered_price NUMERIC(12, 2),
    difference_type VARCHAR(20),
    -- cash, species
    items_offered JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 10. Performance & Analytics
CREATE TABLE IF NOT EXISTS search_heatmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location GEOGRAPHY(POINT, 4326),
    query_term TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS reverse_geocode_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    full_address TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_ll UNIQUE (latitude, longitude)
);
-- 11. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_gist ON vehicle_locations_static USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_marketplace_geo ON marketplace_items USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_assets_geo ON real_estate_assets USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);