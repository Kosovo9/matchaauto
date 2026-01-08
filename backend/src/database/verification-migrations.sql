-- 🛡️ IDENTITY VERIFICATION MODULE
-- Moved from init_extra.sql and enhanced for production
CREATE TABLE IF NOT EXISTS identity_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    id_type VARCHAR(50),
    -- passport, id_card, license
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, approved, rejected
    -- Reviewer Audit
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON identity_verifications(status);