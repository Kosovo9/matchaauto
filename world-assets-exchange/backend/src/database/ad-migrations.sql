-- Ad System Tables
-- Core Tables for Ad Slots and Campaigns
CREATE TABLE IF NOT EXISTS ad_slots (
    id VARCHAR(50) PRIMARY KEY,
    -- e.g., 'home_hero_1'
    name VARCHAR(100) NOT NULL,
    page VARCHAR(50) NOT NULL,
    -- 'home', 'search', 'global'
    position VARCHAR(50) NOT NULL,
    -- 'hero_top', 'sidebar_right', etc.
    size VARCHAR(20) NOT NULL,
    -- '728x90', etc.
    base_price_daily DECIMAL(10, 2) NOT NULL DEFAULT 2.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    -- Advertiser ID
    slot_id VARCHAR(50) REFERENCES ad_slots(id),
    status VARCHAR(20) DEFAULT 'pending_payment',
    -- 'pending_payment', 'active', 'completed', 'cancelled'
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    content_url TEXT NOT NULL,
    -- Image/Video URL
    redirect_url TEXT NOT NULL,
    -- Where clicking takes you
    total_price DECIMAL(10, 2) NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ad_campaigns(slot_id, status, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ads_user ON ad_campaigns(user_id);
-- Seed Default Slots (Idempotent upsert)
INSERT INTO ad_slots (id, name, page, position, size, base_price_daily)
VALUES (
        'home_hero_1',
        'Home Hero Premium',
        'home',
        'hero_top',
        '970x250',
        2.00
    ),
    (
        'search_sidebar_1',
        'Search Sidebar Top',
        'search',
        'sidebar_right',
        '300x250',
        2.00
    ),
    (
        'search_mid_1',
        'Search Feed Interstitial',
        'search',
        'content_mid',
        '728x90',
        2.00
    ),
    (
        'listing_sidebar_1',
        'Listing Detail Sidebar',
        'details',
        'sidebar_right',
        '300x250',
        2.00
    ),
    (
        'global_footer',
        'Global Footer Banner',
        'global',
        'footer_top',
        '728x90',
        2.00
    ),
    (
        'mobile_sticky',
        'Mobile Bottom Sticky',
        'global',
        'sticky_bottom',
        'fluid',
        2.00
    ),
    (
        'search_hero_slim',
        'Search Header Slim',
        'search',
        'hero_top',
        '970x250',
        2.00
    ) ON CONFLICT (id) DO
UPDATE
SET base_price_daily = EXCLUDED.base_price_daily;