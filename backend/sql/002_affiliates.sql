DO $$ BEGIN CREATE TYPE aff_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE aff_event_status AS ENUM ('PENDING', 'APPROVED', 'REVERSED', 'PAID');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    status aff_status NOT NULL DEFAULT 'PENDING',
    tier TEXT NOT NULL DEFAULT 'BRONZE',
    default_payout_currency currency_code NOT NULL DEFAULT 'MXN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_aff_email ON affiliates(email);
CREATE TABLE IF NOT EXISTS affiliate_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    landing TEXT NOT NULL,
    utm JSONB NULL,
    ip_hash TEXT NULL,
    ua_hash TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS affiliate_attributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    code TEXT NOT NULL,
    attributed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS affiliate_commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier TEXT NOT NULL,
    event_type TEXT NOT NULL,
    percent NUMERIC(6, 3) NOT NULL,
    window_days INT NOT NULL DEFAULT 30,
    cap_cents BIGINT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tier, event_type)
);
INSERT INTO affiliate_commission_rules(tier, event_type, percent, window_days, cap_cents)
VALUES ('BRONZE', 'NET_SPEND_WINDOW', 10.000, 30, 80000),
    ('SILVER', 'NET_SPEND_WINDOW', 12.000, 30, 120000),
    ('GOLD', 'NET_SPEND_WINDOW', 14.000, 30, 180000) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS affiliate_commission_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    user_id TEXT NOT NULL,
    currency currency_code NOT NULL,
    base_amount_cents BIGINT NOT NULL,
    percent NUMERIC(6, 3) NOT NULL,
    commission_cents BIGINT NOT NULL,
    status aff_event_status NOT NULL DEFAULT 'PENDING',
    ref_type TEXT NOT NULL,
    ref_id TEXT NOT NULL,
    hold_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_aff_event_idempotent ON affiliate_commission_events(ref_type, ref_id, affiliate_id);
CREATE TABLE IF NOT EXISTS affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id),
    currency currency_code NOT NULL,
    total_cents BIGINT NOT NULL,
    method TEXT NOT NULL,
    method_ref TEXT NULL,
    status TEXT NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS affiliate_payout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID NOT NULL REFERENCES affiliate_payouts(id),
    commission_event_id UUID NOT NULL REFERENCES affiliate_commission_events(id)
);