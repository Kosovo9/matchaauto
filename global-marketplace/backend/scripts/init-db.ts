import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function init() {
    console.log('🚀 MASTER INITIALIZATION: 1000x Community Resilience & Matching Ecosistema...');

    const client = await pool.connect();
    try {
        // 1. Extensions
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

        // 2. Core Resilience: community_offers
        await client.query(`
      CREATE TABLE IF NOT EXISTS community_offers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location_geom GEOGRAPHY(POINT, 4326),
        status TEXT DEFAULT 'active',
        details JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS community_offers_geom_idx ON community_offers USING GIST (location_geom);
    `);

        // 3. Emergency & Humanitarian
        await client.query(`
      CREATE TABLE IF NOT EXISTS emergency_needs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        urgency_level TEXT NOT NULL,
        description TEXT NOT NULL,
        location_geom GEOGRAPHY(POINT, 4326),
        contact_phone TEXT,
        status TEXT DEFAULT 'active',
        reported_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS emergency_needs_geom_idx ON emergency_needs USING GIST (location_geom);
    `);

        // 4. Skills & Needs
        await client.query(`
      CREATE TABLE IF NOT EXISTS user_skills (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        description TEXT NOT NULL,
        verification_count INTEGER DEFAULT 0,
        location_geom GEOGRAPHY(POINT, 4326),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_needs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        category TEXT NOT NULL,
        query TEXT NOT NULL,
        is_explicit BOOLEAN DEFAULT TRUE,
        confidence FLOAT DEFAULT 1.0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // 5. Signals & Visibility (Priority Real - THE BLUE UNICORN)
        await client.query(`
      CREATE TABLE IF NOT EXISTS signals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        location GEOGRAPHY(POINT, 4326),
        priority TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS signals_location_idx ON signals USING GIST (location);

      CREATE TABLE IF NOT EXISTS visibility_tiers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        signal_id UUID UNIQUE NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        duration_days INTEGER,
        region TEXT NOT NULL,
        amount_usd DECIMAL NOT NULL,
        status TEXT DEFAULT 'pending',
        activated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      );
    `);

        // 6. Hubs
        await client.query(`
      CREATE TABLE IF NOT EXISTS hubs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        purpose TEXT NOT NULL,
        sync_key TEXT NOT NULL,
        template TEXT NOT NULL,
        location GEOGRAPHY(POINT, 4326),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS hubs_location_idx ON hubs USING GIST (location);
    `);

        // 7. Matching & Tracking (1000x Infrastructure)
        await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        brands JSONB DEFAULT '[]',
        vehicle_types JSONB DEFAULT '[]',
        price_max DECIMAL DEFAULT 0,
        max_distance_km INTEGER DEFAULT 50,
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_garage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        vin TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS vehicle_positions (
        id BIGSERIAL PRIMARY KEY,
        vehicle_id TEXT NOT NULL,
        position_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS vehicle_positions_vid_idx ON vehicle_positions(vehicle_id);
    `);

        // 8. Ad Engagement
        await client.query(`
      CREATE TABLE IF NOT EXISTS ad_engagement_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ad_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

        console.log('✅ MASTER SCHEMA INITIALIZED SUCCESSFULLY!');
    } catch (error) {
        console.error('❌ MASTER INITIALIZATION FAILED:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

init();
