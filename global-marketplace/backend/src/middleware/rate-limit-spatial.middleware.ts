import { Context, Next } from 'hono';
import Redis from 'ioredis';
import { logger } from '../utils/logger';

export function setupSpatialRateLimit(redis: Redis) {
    return async (c: Context, next: Next) => {
        const userId = c.req.header('X-User-Id') || c.req.header('CF-Connecting-IP');
        const path = c.req.path;

        // Solo limitar rutas pesadas
        if (path.includes('/routes/optimize') || path.includes('/routes/matrix')) {
            const key = `rl:spatial:${userId}`;
            const count = await redis.incr(key);

            if (count === 1) await redis.expire(key, 60);

            if (count > 10) { // Max 10 expensive ops per minute
                logger.warn(`Spatial rate limit exceeded for ${userId}`);
                return c.json({ error: 'Too many spatial requests. Please wait 1 minute.' }, 429);
            }
        }

        await next();
    };
}
