
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const poolConfig = process.env.INSTANCE_UNIX_SOCKET
    ? {
        host: process.env.INSTANCE_UNIX_SOCKET,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    }
    : {
        connectionString: process.env.DATABASE_URL,
    };

const pool = new pg.Pool(poolConfig);

async function runMigrations() {
    console.log('🚀 Starting Migrations...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Extensiones Requeridas
        console.log('📦 Enabling Extensions...');
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
        await client.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');

        // 1. Webhook Events (Anti-duplicados)
        console.log('🛡️ Creating webhook_events table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS webhook_events (
                id TEXT PRIMARY KEY,
                provider TEXT NOT NULL CHECK (provider IN ('mercadopago','paypal')),
                received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                processed_at TIMESTAMPTZ NULL,
                payload JSONB NOT NULL
            );
        `);

        // 2. Boost Orders (Bulletproof Contract)
        console.log('💰 Creating boost_orders table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS boost_orders (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                provider TEXT NOT NULL CHECK (provider IN ('mercadopago','paypal')),
                provider_reference UUID NOT NULL, -- Our internal linking UUID
                provider_order_id TEXT,           -- PayPal order id / MP preference id
                provider_payment_id TEXT,         -- PayPal capture id / MP payment id
                user_id UUID NOT NULL,            -- Link to users(id)
                listing_id TEXT NOT NULL,
                domain TEXT NOT NULL CHECK (domain IN ('auto','marketplace','assets')),
                city TEXT,
                boost_type TEXT NOT NULL DEFAULT 'featured',
                amount_cents INT NOT NULL CHECK (amount_cents > 0),
                currency TEXT NOT NULL DEFAULT 'MXN',
                status TEXT NOT NULL CHECK (status IN ('created','pending','paid','failed','canceled','refunded')) DEFAULT 'created',
                checkout_url TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                paid_at TIMESTAMPTZ,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                metadata JSONB NOT NULL DEFAULT '{}'::jsonb
            );

            CREATE UNIQUE INDEX IF NOT EXISTS ux_boost_orders_provider_ref
                ON boost_orders(provider, provider_reference);

            CREATE UNIQUE INDEX IF NOT EXISTS ux_boost_orders_provider_order
                ON boost_orders(provider, provider_order_id)
                WHERE provider_order_id IS NOT NULL;

            CREATE INDEX IF NOT EXISTS ix_boost_orders_user_status
                ON boost_orders(user_id, status, created_at DESC);
        `);

        // 3. Active Boosts (Anti-overlap)
        console.log('🔥 Creating active_boosts table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS active_boosts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID NOT NULL REFERENCES boost_orders(id) ON DELETE CASCADE,
                user_id UUID NOT NULL,
                listing_id TEXT NOT NULL,
                domain TEXT NOT NULL CHECK (domain IN ('auto','marketplace','assets')),
                city TEXT,
                boost_type TEXT NOT NULL DEFAULT 'featured',
                starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                ends_at TIMESTAMPTZ NOT NULL,
                status TEXT NOT NULL CHECK (status IN ('active','expired','canceled')) DEFAULT 'active',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                metadata JSONB NOT NULL DEFAULT '{}'::jsonb
            );

            CREATE UNIQUE INDEX IF NOT EXISTS ux_active_boosts_order
                ON active_boosts(order_id);

            CREATE UNIQUE INDEX IF NOT EXISTS ux_active_boosts_listing_type_active
                ON active_boosts(listing_id, boost_type)
                WHERE status = 'active';

            CREATE INDEX IF NOT EXISTS ix_active_boosts_expire
                ON active_boosts(status, ends_at);
        `);

        await client.query('COMMIT');
        console.log('✅ Migrations Completed Successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations();
