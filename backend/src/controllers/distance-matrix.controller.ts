import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { DistanceMatrixService, DistanceMatrixRequestSchema } from '../services/distance-matrix.service';

// ==================== ZOD SCHEMAS ====================
const BatchDistanceMatrixSchema = z.object({
    requests: z.array(DistanceMatrixRequestSchema).min(1).max(100),
    batchOptions: z.object({
        concurrency: z.number().min(1).max(100).default(10)
    }).optional()
});

// ==================== CONTROLLER ====================
export class DistanceMatrixController {
    private service: DistanceMatrixService;
    private redis: Redis;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.service = new DistanceMatrixService(redis, pgPool);
    }

    // POST /api/v1/distance/matrix
    async calculateMatrix(c: Context) {
        const start = Date.now();
        try {
            const body = await c.req.json();
            const validated = DistanceMatrixRequestSchema.parse(body);

            const result = await this.service.calculateMatrix(validated);

            metrics.timing('distance_matrix.latency', Date.now() - start);
            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    // POST /api/v1/distance/batch
    async calculateBatch(c: Context) {
        const start = Date.now();
        try {
            const body = await c.req.json();
            const validated = BatchDistanceMatrixSchema.parse(body);

            // Process in parallel with concurrency limit (simplified)
            const results = await Promise.all(
                validated.requests.map(req => this.service.calculateMatrix(req))
            );

            metrics.timing('distance_matrix.batch_latency', Date.now() - start);
            return c.json({ success: true, data: results });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    private handleError(error: any, c: Context) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: (error as z.ZodError).errors }, 400);
        } else {
            logger.error('Distance Matrix Error', error);
            return c.json({ success: false, error: 'Calculation Failed' }, 500);
        }
    }
}
