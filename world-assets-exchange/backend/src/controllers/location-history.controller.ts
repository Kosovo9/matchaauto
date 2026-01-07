import { Context } from 'hono';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export class LocationHistoryController {
    private pgPool: Pool;

    constructor(pgPool: Pool) {
        this.pgPool = pgPool;
    }

    /**
     * Obtiene el rastro histórico (Breadcrumbs) de una entidad
     */
    getTrace = async (c: Context) => {
        const entityId = c.req.param('id');
        const start = c.req.query('start');
        const end = c.req.query('end');

        const client = await this.pgPool.connect();
        try {
            const query = `
        SELECT 
          ST_X(location::geometry) as lng,
          ST_Y(location::geometry) as lat,
          speed, bearing, created_at
        FROM location_history
        WHERE entity_id = $1
          AND created_at BETWEEN $2 AND $3
        ORDER BY created_at ASC;
      `;
            const result = await client.query(query, [entityId, start || 'now() - interval \'24 hours\'', end || 'now()']);
            return c.json({ success: true, count: result.rows.length, data: result.rows });
        } finally {
            client.release();
        }
    };

    /**
     * Resumen de viaje (Distancia total, tiempo, velocidad promedio)
     */
    getTripSummary = async (c: Context) => {
        const entityId = c.req.param('id');
        const client = await this.pgPool.connect();
        try {
            const query = `
        SELECT 
          SUM(ST_Distance(location, LAG(location) OVER (ORDER BY created_at))::geography) as total_distance
        FROM location_history
        WHERE entity_id = $1;
      `;
            const result = await client.query(query, [entityId]);
            return c.json({ success: true, summary: result.rows[0] });
        } finally {
            client.release();
        }
    };
}
