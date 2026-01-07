-- Cultural Resilience Migration
-- 1. Indigenous Languages
CREATE TABLE IF NOT EXISTS indigenous_languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    -- ISO 639-3
    name VARCHAR(255) NOT NULL,
    native_name VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    region VARCHAR(255),
    status VARCHAR(50),
    -- vulnerable, endangered, etc.
    speakers INT,
    resources JSONB DEFAULT '[]',
    -- [{type: 'audio', url: '...'}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Note: Cultural Offers use the main 'community_offers' table with category='cultural'