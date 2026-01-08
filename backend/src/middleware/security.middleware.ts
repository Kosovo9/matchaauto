
import { Context, Next } from 'hono';
import type { Pool } from 'pg';
import { logger } from '../utils/logger';
import { createHash } from 'crypto';

/**
 * 🍯 Honeypot Guard: Traps bots by checking for hidden fields
 */
export function honeypotGuard(fields: string[] = ['website', 'company_url']) {
    return async (c: Context, next: Next) => {
        if (c.req.method !== 'POST') return await next();
        const pool = c.get('pg') as Pool;
        if (!pool) return await next(); // Skip if pool not injected yet

        try {
            const body = await c.req.json();
            const trappedFields: Record<string, any> = {};
            let isTrapped = false;

            for (const field of fields) {
                if (body && body[field] !== undefined && body[field] !== '') {
                    trappedFields[field] = body[field];
                    isTrapped = true;
                }
            }

            if (isTrapped) {
                const ip = c.req.header('x-forwarded-for') || 'unknown';
                const ua = c.req.header('user-agent');
                const path = c.req.path;
                const payloadHash = createHash('sha256').update(JSON.stringify(body)).digest('hex');

                logger.warn(`[HONEYPOT] Bot trapped from ${ip} on ${path}`);

                // Async log to DB (don't await to not block the trap response)
                pool.query(
                    'INSERT INTO honeypot_hits (ip_address, user_agent, path, trapped_fields, payload_hash) VALUES ($1, $2, $3, $4, $5)',
                    [ip, ua, path, JSON.stringify(trappedFields), payloadHash]
                ).catch(err => logger.error('[HONEYPOT] DB Log failed:', err));

                return c.json({ error: "Suspicious behavior detected." }, 403);
            }
        } catch (e) {
            // Body might not be JSON or already consumed, skip quietly
        }

        await next();
    };
}

/**
 * 📜 Audit Logger: Records sensitive actions
 */
export async function auditLog(pool: Pool, params: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    severity?: 'info' | 'warning' | 'critical';
    metadata?: any;
    ip?: string;
}) {
    try {
        await pool.query(
            `INSERT INTO security_audit_log (user_id, action, entity_type, entity_id, severity, metadata, ip_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                params.userId,
                params.action,
                params.entityType,
                params.entityId,
                params.severity || 'info',
                params.metadata ? JSON.stringify(params.metadata) : null,
                params.ip
            ]
        );
    } catch (error) {
        logger.error('[AUDIT] Failed to write audit log:', error);
    }
}
