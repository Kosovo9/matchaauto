-- Payments Migration
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(5) NOT NULL,
    provider VARCHAR(20) NOT NULL,
    -- stripe, paypal, mercadopago
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, completed, failed, refunded
    gateway_id VARCHAR(100),
    -- ID from the external provider
    idempotency_key VARCHAR(100) UNIQUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway ON transactions(gateway_id);