-- 💰 MONETIZATION: BOOSTS & ORDERS
-- Canon implementation for Mercado Pago & PayPal
CREATE TABLE IF NOT EXISTS boost_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id TEXT NOT NULL,
    -- Logical link to listing/vehicle
    plan_id VARCHAR(50) NOT NULL,
    -- basic, premium, diamond
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MXN',
    provider VARCHAR(20) NOT NULL,
    -- mercadopago, paypal
    provider_ref VARCHAR(255),
    -- preference_id or order_id
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, paid, expired, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);
CREATE TABLE IF NOT EXISTS boosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id TEXT NOT NULL UNIQUE,
    -- Only one active boost per listing
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    placement VARCHAR(50) DEFAULT 'featured',
    -- featured, search_top, region_blast
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    -- active, expired, cancelled
    order_id UUID REFERENCES boost_orders(id)
);
CREATE INDEX IF NOT EXISTS idx_boost_orders_user ON boost_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_boost_orders_ref ON boost_orders(provider_ref);
CREATE INDEX IF NOT EXISTS idx_boosts_listing ON boosts(listing_id);
CREATE INDEX IF NOT EXISTS idx_boosts_expires ON boosts(expires_at);