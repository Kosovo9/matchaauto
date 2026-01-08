import { Context } from 'hono';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { RadiusSearchService, RadiusSearchRequestSchema } from '../services/radius-search.service';
import Redis from 'ioredis';
import { Pool } from 'pg';

/**
 * @controller RadiusSearchController
 * @description REST Controller for Radius Search, Heatmaps, Clustering, and Analytics.
 */

// ==================== ZOD SCHEMAS ====================
// Simplified validation for Hono input
const HeatmapRequestSchema = z.object({
    bounds: z.object({
        northeast: z.object({ lat: z.number(), lng: z.number() }),
        southwest: z.object({ lat: z.number(), lng: z.number() })
    }),
    resolution: z.number().min(10).max(1000).default(100)
}).strict();

const ClusterRequestSchema = z.object({
    points: z.array(z.object({
        lat: z.number(),
        lng: z.number(),
        weight: z.number().optional()
    })).min(2).max(10000),
    algorithm: z.enum(['dbscan', 'kmeans']).default('dbscan'),
    parameters: z.object({
        epsilon: z.number().default(1000),
        minPoints: z.number().default(5)
    }).optional()
}).strict();

// ==================== CONTROLLER ====================
export class RadiusSearchController {
    private readonly radiusSearchService: RadiusSearchService;

    constructor(redisClient: Redis, pgPool: Pool) {
        this.radiusSearchService = new RadiusSearchService(redisClient, pgPool);
    }

    // POST /api/v1/radius/search
    async searchWithinRadius(c: Context) {
        const start = Date.now();
        try {
            const body = await c.req.json();

            // Map incoming 'center' to 'latitude/longitude' expected by service
            const requestPayload = {
                ...body,
                latitude: body.center?.lat,
                longitude: body.center?.lng,
                // filters & options mapping if necessary, or let service schema handle valid subset
            };

            // Use the service's schema to parse what we can
            const validated = RadiusSearchRequestSchema.parse(requestPayload);

            const result = await this.radiusSearchService.search(validated);

            metrics.timing('radius_search.latency', Date.now() - start);
            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    // POST /api/v1/radius/heatmap
    async generateHeatmap(c: Context) {
        try {
            const body = await c.req.json();
            const validated = HeatmapRequestSchema.parse(body);

            const result = await this.radiusSearchService.generateDensityHeatmap(
                validated.bounds,
                validated.resolution
            );

            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    // POST /api/v1/radius/cluster
    async clusterPoints(c: Context) {
        try {
            const body = await c.req.json();
            const validated = ClusterRequestSchema.parse(body);

            const result = await this.radiusSearchService.clusterPoints(
                validated.points,
                validated.algorithm,
                validated.parameters
            );

            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    // POST /api/v1/radius/analytics
    async generateAnalytics(c: Context) {
        try {
            return c.json({ success: true, message: "Use specialized endpoint for full analytics" });
        } catch (e) { return this.handleError(e, c); }
    }

    // POST /api/v1/radius/stream
    async initializeStreamingSearch(c: Context) {
        return c.json({ error: "Streaming implemented via WebSocket server, not REST" }, 501);
    }

    private handleError(error: any, c: Context) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: (error as any).errors }, 400);
        } else {
            logger.error('Radius Search Controller Error', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    }
}
