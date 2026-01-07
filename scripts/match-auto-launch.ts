import pkg from 'pg';
const { Pool } = pkg;
import Redis from 'ioredis';
import fs from 'fs';

/**
 * 🚀 MATCH-AUTO 1000X LAUNCH ORCHESTRATOR (SUPREME EDITION)
 * Provisioning core infrastructure + QUEEN (Geo) + KING (Hubs) modules.
 */

const SQL_MIGRATIONS = [
    // EXTENSIONS
    'CREATE EXTENSION IF NOT EXISTS postgis;',
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',

    // HUB MODULE (KING)
    `CREATE TABLE IF NOT EXISTS hubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    language VARCHAR(10) DEFAULT 'es',
    member_count INTEGER DEFAULT 0,
    completed_exchanges INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    `CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hub_id UUID REFERENCES hubs(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    ttl INTEGER DEFAULT 24,
    delivery VARCHAR(20) DEFAULT 'pwa',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

    // TRACKING & GEOFENCING (QUEEN)
    `CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    geometry GEOMETRY(Geometry, 4326) NOT NULL,
    rules JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,
    'CREATE INDEX IF NOT EXISTS idx_geofences_geometry ON geofences USING GIST (geometry);',

    `CREATE TABLE IF NOT EXISTS vehicle_positions (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id VARCHAR(100) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,
    'CREATE INDEX IF NOT EXISTS idx_vehicle_positions_location ON vehicle_positions USING GIST (location);'
];

async function main() {
    console.log('\n👑 [KING-QUEEN] Initiating Supreme Deployment Sequence...');

    const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/match_auto';
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    console.log(`📡 Targeting DB: ${dbUrl}`);

    const pg = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 10000 });
    const redis = new Redis(redisUrl, { connectTimeout: 10000, retryStrategy: (times) => Math.min(times * 100, 3000) });

    try {
        console.log('🔍 [0/3] Infrastructure Probe...');
        await pg.query('SELECT 1');
        console.log('   - Database: ONLINE');

        console.log('📦 [1/3] Synchronizing KING & QUEEN Core (PostGIS + Hubs)...');
        for (const sql of SQL_MIGRATIONS) {
            await pg.query(sql);
            process.stdout.write('💎 ');
        }
        console.log('\n✅ Infrastructure calibrated to 1000x.');

        console.log('⚡ [2/3] Priming High-Speed Nexus (Redis)...');
        await redis.set('system:status', 'supreme');
        await redis.set('system:modules', 'queen,king');
        console.log('✅ Nexus primed.');

        console.log('\n🏆 SUPREME DEPLOYMENT SUCCESSFUL.');
        console.log('🚀 KING (Hubs) and QUEEN (Geo) are now under your command.\n');

    } catch (error: any) {
        console.error('\n❌ CRITICAL LAUNCH FAILURE:');
        console.error(`   MESSAGE: ${error.message}`);
        console.error('\n🛡️  CONSEJO: Asegúrate de que Docker Desktop esté corriendo y los contenedores vivos.');
        console.error('   Usa: "docker-compose up -d" antes de este script.');
        process.exit(1);
    } finally {
        await pg.end();
        redis.disconnect();
    }
}

main();
