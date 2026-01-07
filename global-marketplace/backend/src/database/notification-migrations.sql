-- Notifications Migration
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    -- system, match_found, etc.
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    channels TEXT [],
    -- ['in_app', 'email']
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id)
WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);