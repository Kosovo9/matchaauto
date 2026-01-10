DO $$ BEGIN CREATE TYPE currency_code AS ENUM ('MXN', 'USD');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE ledger_type AS ENUM (
    'CREDIT_CASHBACK',
    'CREDIT_REFERRAL_REFERRER',
    'CREDIT_REFERRAL_REFERRED',
    'CREDIT_MISSION',
    'DEBIT_AD_SPEND',
    'DEBIT_DONATION_IMPACT',
    'FX_CONVERT_IN',
    'FX_CONVERT_OUT',
    'ADMIN_ADJUST'
);
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN CREATE TYPE ledger_status AS ENUM ('PENDING', 'POSTED', 'REVERSED', 'EXPIRED');
EXCEPTION
WHEN duplicate_object THEN NULL;
END $$;
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    currency currency_code NOT NULL,
    balance_cents BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, currency)
);
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    wallet_currency currency_code NOT NULL,
    type ledger_type NOT NULL,
    status ledger_status NOT NULL DEFAULT 'POSTED',
    amount_cents BIGINT NOT NULL,
    expires_at TIMESTAMPTZ NULL,
    ref_type TEXT NULL,
    ref_id TEXT NULL,
    memo TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON ledger_entries(user_id, wallet_currency, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_ref ON ledger_entries(ref_type, ref_id);
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS referral_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    referred_user_id TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(code, referred_user_id)
);
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id TEXT NOT NULL,
    referred_user_id TEXT NOT NULL,
    first_paid_ref TEXT NULL,
    rewarded_at TIMESTAMPTZ NULL,
    UNIQUE(referrer_user_id, referred_user_id)
);
CREATE TABLE IF NOT EXISTS charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT NULL,
    country TEXT NOT NULL DEFAULT 'MX',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS impact_pool (
    currency currency_code PRIMARY KEY,
    pool_cents BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO impact_pool(currency)
VALUES ('MXN') ON CONFLICT DO NOTHING;
INSERT INTO impact_pool(currency)
VALUES ('USD') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS impact_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    currency currency_code NOT NULL,
    amount_cents BIGINT NOT NULL,
    charity_id UUID NULL REFERENCES charities(id),
    ledger_entry_id UUID NOT NULL REFERENCES ledger_entries(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO charities(name, legal_name, country, is_verified)
VALUES (
        'Refugios Locales (Impact Pool)',
        'Impact In-App',
        'MX',
        true
    ) ON CONFLICT DO NOTHING;