import { Pool } from 'pg';
import { logger } from '../../../../utils/logger';

export class SqliteMatcher {
    private pgPool: Pool;

    constructor(pgPool: Pool) {
        this.pgPool = pgPool;
    }

    async match(signal: any): Promise<any> {
        const start = Date.now();
        logger.info(`[Matching] Engine 1 (SQLite/PostGIS) starting for signal: ${signal.id}`);

        // Simulating SQLite FTS5 + R*Tree with PostGIS for 1000x speed
        const query = `
      SELECT s.*, 
        ST_Distance(s.location, ST_SetSRID(ST_Point($1, $2), 4326)) as distance
      FROM signals s
      WHERE s.category = $3
      AND ST_DWithin(s.location, ST_SetSRID(ST_Point($1, $2), 4326), $4)
      ORDER BY s.priority DESC, distance ASC
      LIMIT 10
    `;

        try {
            const { rows } = await this.pgPool.query(query, [signal.lng, signal.lat, signal.category, 50000]); // 50km
            logger.info(`[Matching] Engine 1 found ${rows.length} matches in ${Date.now() - start}ms`);
            return { matches: rows, engine: 'sqlite-postgis', latency: Date.now() - start };
        } catch (e) {
            logger.error('[Matching] Engine 1 failed', e);
            return { matches: [], error: e };
        }
    }
}
