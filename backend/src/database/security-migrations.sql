-- 🛡️ SECURITY: HONEYPOT & AUDIT LOGS
CREATE TABLE IF NOT EXISTS honeypot_hits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    path VARCHAR(255) NOT NULL,
    payload_hash VARCHAR(64),
    -- SHA-256 of the trapped payload
    trapped_fields JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id UUID,
        severity VARCHAR(20) DEFAULT 'info',
        -- info, warning, critical
        ip_address VARCHAR(45),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_honeypot_ip ON honeypot_hits(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_user ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON security_audit_log(created_at);