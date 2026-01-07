import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { RouteOptimizationService, RouteOptimizationRequestSchema } from '../services/route-optimization.service';

/**
 * @controller RouteOptimizationController
 * @description REST Controller for route optimization.
 */

// ==================== CONTROLLER ====================
export class RouteOptimizationController {
    private service: RouteOptimizationService;
    private redis: Redis;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.service = new RouteOptimizationService(redis, pgPool);
    }

    async optimizeRoute(c: Context) {
        const start = Date.now();
        try {
            const body = await c.req.json();

            // Map incoming 'stops' to 'waypoints' if needed, or just validate against service schema
            // For now, let's assume the client sends what RouteOptimizationService expects
            // but we'll add a simple mapper for compatibility if they use the old format

            const requestData = body.stops ? {
                waypoints: body.stops.map((s: any) => ({
                    latitude: s.location.lat,
                    longitude: s.location.lng,
                    id: s.id
                })),
                algorithm: body.options?.algorithm || 'genetic'
            } : body;

            const validated = RouteOptimizationRequestSchema.parse(requestData);

            const result = await this.service.optimizeRoute(validated);

            metrics.timing('route_optimization.latency', Date.now() - start);
            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    async streamOptimization(c: Context) {
        return c.json({
            success: true,
            status: 'streaming_not_implemented_in_mvp',
            message: 'Use standard optimization endpoint'
        });
    }

    private handleError(error: any, c: Context) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        } else {
            logger.error('Route Optimization Error', error);
            return c.json({ success: false, error: 'Optimization Failed' }, 500);
        }
    }
}
