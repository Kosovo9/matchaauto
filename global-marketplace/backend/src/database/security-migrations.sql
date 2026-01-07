-- Security Tables Migration
-- 1. IP Blacklist (Persistent Bans)
CREATE TABLE IF NOT EXISTS ip_blacklist (
    ip_address VARCHAR(45) PRIMARY KEY,
    reason TEXT,
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_permanent BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_ip ON ip_blacklist(ip_address);
-- 2. Audit Log (Deep Tracking)
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    -- User ID or System ID
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    severity VARCHAR(20) CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 3. Honeypot Traps (Backend)
-- We track interactions with non-existent resources here
CREATE TABLE IF NOT EXISTS honeypot_hits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45),
    trap_name VARCHAR(100),
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);