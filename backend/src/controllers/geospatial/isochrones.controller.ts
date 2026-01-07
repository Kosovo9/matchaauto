import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { IsochronesService, IsochroneOptionsSchema } from '../../services/geospatial/isochrones.service';
import { logger } from '../../utils/logger';

export class IsochronesController {
    private service: IsochronesService;
    private redis: Redis;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.service = new IsochronesService(pgPool, redis);
    }

    async calculate(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await IsochroneOptionsSchema.parseAsync(body);

            // Check Cache
            const cacheKey = `isochrone:${JSON.stringify(validated)}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return c.json({ success: true, data: JSON.parse(cached), source: 'cache' });
            }

            const isochrones = await this.service.calculateIsochrones(validated);

            // Cache result (1 hour)
            await this.redis.setex(cacheKey, 3600, JSON.stringify(isochrones));

            return c.json({ success: true, data: isochrones });
        } catch (error) {
            logger.error('Isochrone Calculation Error', error);
            // Zod Error Handling could be centralized
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    }
}
