import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { TimezoneService } from '../services/timezone.service';
import { MetricsCollector } from '../utils/metrics-collector';
import { logger } from '../utils/logger';

// ==================== ZOD SCHEMAS ====================
const TimezoneRequestSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timestamp: z.number().int().optional() // User can request timezone for a specific past/future time
});

// ==================== CONTROLLER ====================
export class TimezoneController {
    private service: TimezoneService;
    private metrics: MetricsCollector;

    constructor(redis: Redis, pgPool: Pool) {
        this.service = new TimezoneService(redis, pgPool);
        this.metrics = MetricsCollector.getInstance();
    }

    /**
     * Get Timezone information for a location.
     * GET /timezone?lat=...&lng=...&timestamp=...
     */
    async getTimezone(c: Context) {
        const startTime = Date.now();

        try {
            // Parse query params (convert strings to numbers)
            const latStr = c.req.query('lat');
            const lngStr = c.req.query('lng');
            const tsStr = c.req.query('timestamp');

            if (!latStr || !lngStr) {
                return c.json({ success: false, error: 'Missing latitude or longitude' }, 400);
            }

            const query = {
                latitude: parseFloat(latStr),
                longitude: parseFloat(lngStr),
                timestamp: tsStr ? parseInt(tsStr) : undefined
            };

            const validated = await TimezoneRequestSchema.parseAsync(query);

            const result = await this.service.getTimezoneByCoordinates(
                validated.latitude,
                validated.longitude,
                validated.timestamp
            );

            // Cache-Control for Timezones
            c.header('Cache-Control', 'public, max-age=3600');

            this.metrics.increment('timezone.request_success');

            return c.json({
                success: true,
                data: result,
                metadata: {
                    processingTime: Date.now() - startTime
                }
            });

        } catch (error) {
            return this.handleError(error, c);
        }
    }

    private handleError(error: any, c: Context) {
        logger.error('Timezone Controller Error', error);
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        } else {
            return c.json({ success: false, error: 'Internal Timezone Error' }, 500);
        }
    }
}
