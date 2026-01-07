import { Context } from 'hono';
import { z } from 'zod';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

// -------------------------------------------------------------------
// Schemas
// -------------------------------------------------------------------
const ExportSchema = z.object({
    modules: z.array(z.string()).optional().default(['all'])
});

const ImportSchema = z.object({
    file: z.instanceof(Buffer) // raw JSON payload
});

const ChangesSchema = z.object({
    since: z.string().datetime()
});

export class OfflineSyncController {
    private redis: Redis;
    private pg: Pool;

    constructor(redis: Redis, pg: Pool) {
        this.redis = redis;
        this.pg = pg;
    }

    // POST /export – generate a JSON snapshot of selected modules
    export = async (c: Context) => {
        try {
            const { modules } = ExportSchema.parse(await c.req.json());

            // 10×: Pull data in parallel using pipeline for Redis
            const redisPipeline = this.redis.pipeline();
            const redisKeys: string[] = [];
            if (modules.includes('all') || modules.includes('user-behavior')) {
                redisKeys.push('user_behavior_events');
                redisPipeline.xrange('user_behavior_events', '-', '+');
            }
            if (modules.includes('all') || modules.includes('resources')) {
                redisKeys.push('resource_allocations');
                redisPipeline.hgetall('resource_allocations');
            }

            const redisResults = await redisPipeline.exec();

            const client = await this.pg.connect();
            const { rows: maintenanceRows } = await client.query(
                `SELECT * FROM maintenance_logs WHERE created_at > now() - interval '1 day'`
            );
            client.release();

            const snapshot = {
                timestamp: new Date().toISOString(),
                redis: Object.fromEntries(
                    redisKeys.map((k, i) => [k, redisResults[i][1]])
                ),
                pg: { maintenanceLogs: maintenanceRows }
            };

            return c.json({ success: true, data: snapshot });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // POST /import – ingest a JSON snapshot (offline sync)
    import = async (c: Context) => {
        try {
            const body = await c.req.json();
            const { file } = ImportSchema.parse(body);
            const snapshot = file as any;

            const pipe = this.redis.pipeline();
            if (snapshot.redis?.user_behavior_events) {
                const events = snapshot.redis.user_behavior_events as any[];
                events.forEach(ev => {
                    pipe.xadd('user_behavior_events', '*', ...Object.entries(ev).flat());
                });
            }
            if (snapshot.redis?.resource_allocations) {
                const alloc = snapshot.redis.resource_allocations as Record<string, string>;
                pipe.hmset('resource_allocations', alloc);
            }

            const client = await this.pg.connect();
            try {
                await client.query('BEGIN');
                for (const log of snapshot.pg?.maintenanceLogs ?? []) {
                    await client.query(
                        `INSERT INTO maintenance_logs (vehicle_id, data, created_at)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
                        [log.vehicle_id, log.data, log.created_at]
                    );
                }
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }

            await pipe.exec();
            return c.json({ success: true, message: 'Import successful' });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // GET /changes – list changes since a timestamp (CRDT‑style)
    changes = async (c: Context) => {
        try {
            const { since } = ChangesSchema.parse(c.req.query());

            const newEvents = await this.redis.xrange('user_behavior_events', since, '+');

            const client = await this.pg.connect();
            const { rows: newLogs } = await client.query(
                `SELECT * FROM maintenance_logs WHERE created_at > $1`,
                [since]
            );
            client.release();

            return c.json({
                success: true,
                data: {
                    redis: { newUserBehaviorEvents: newEvents },
                    pg: { newMaintenanceLogs: newLogs }
                }
            });
        } catch (error) {
            return handleError(error, c);
        }
    };
}
