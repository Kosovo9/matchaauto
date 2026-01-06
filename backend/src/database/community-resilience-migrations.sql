-- Community Resilience Tables (Offline-First Ready)
-- 1. Main Offers Table (Polymorphic)
CREATE TABLE IF NOT EXISTS community_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    -- Link to users table
    type VARCHAR(50) NOT NULL,
    -- 'goods', 'service', 'knowledge', 'request', 'offer'
    category VARCHAR(50) NOT NULL,
    -- 'agriculture', 'fishing', 'emergency', 'refugee_aid', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_geom GEOMETRY(Point, 4326),
    status VARCHAR(50) DEFAULT 'active',
    -- 'active', 'pending', 'completed', 'expired'
    details JSONB DEFAULT '{}',
    -- Flexible schema for each domain (crop details, fish species, etc.)
    metadata JSONB DEFAULT '{}',
    -- Region, origin, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_offers_location ON community_offers USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_community_offers_category ON community_offers(category);
CREATE INDEX IF NOT EXISTS idx_community_offers_status ON community_offers(status);
CREATE INDEX IF NOT EXISTS idx_community_offers_details ON community_offers USING GIN (details);
-- Fast JSONB search
-- 2. User Needs (TrueDemand Global)
CREATE TABLE IF NOT EXISTS user_needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    query TEXT,
    explicit BOOLEAN DEFAULT FALSE,
    -- True if user posted, False if inferred
    confidence FLOAT DEFAULT 0.5,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, query)
);
CREATE INDEX IF NOT EXISTS idx_user_needs_category ON user_needs(category);
-- 3. Ad Transactions (Ethical Billing)
CREATE TABLE IF NOT EXISTS ad_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL,
    user_id UUID NOT NULL,
    -- Who is paying (Advertiser)
    type VARCHAR(50) NOT NULL,
    -- 'view', 'open', 'contact'
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 4. Barter Confirmations (Reputation)
CREATE TABLE IF NOT EXISTS barter_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES community_offers(id),
    user_id UUID NOT NULL,
    -- Who is confirming
    counterpart_id UUID NOT NULL,
    -- Who they traded with
    confirmation_status VARCHAR(50) DEFAULT 'pending',
    -- 'confirmed', 'dispute'
    rating INT CHECK (
        rating BETWEEN 1 AND 5
    ),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- 5. Emergency Extensions
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refugee_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS refugee_since TIMESTAMP WITH TIME ZONE;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS emergency_mode BOOLEAN DEFAULT FALSE;
ALTER TABLE users
ADD COLUMN IF NOT EXISTS emergency_location JSONB;