import { Context, Next } from 'hono';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export function setupAuditMiddleware(pgPool: Pool) {
    return async (c: Context, next: Next) => {
        const startTime = Date.now();
        await next();
        const duration = Date.now() - startTime;

        // Solo auditar métodos de escritura o consultas pesadas
        if (['POST', 'PUT', 'DELETE'].includes(c.req.method) || duration > 500) {
            const client = await pgPool.connect();
            try {
                await client.query(
                    'INSERT INTO audit_logs (method, path, user_id, duration_ms, status) VALUES ($1, $2, $3, $4, $5)',
                    [c.req.method, c.req.path, c.req.header('X-User-Id') || 'anonymous', duration, c.res.status]
                );
            } catch (err) {
                logger.error('Audit logging failed:', err);
            } finally {
                client.release();
            }
        }
    };
}
