import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { RadiusSearchService } from '../services/radius-search.service';
import Redis from 'ioredis';
import { Pool } from 'pg';

/**
 * @controller RadiusSearchController
 * @description REST Controller for Radius Search, Heatmaps, Clustering, and Analytics.
 */

// ==================== ZOD SCHEMAS ====================
const RadiusSearchRequestSchema = z.object({
    center: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
    }),
    radius: z.number().min(0).max(1000000).default(1000), // meters
    filters: z.object({ // Simplified filters
        entityTypes: z.array(z.string()).optional(),
        minSpeed: z.number().optional(),
        attributes: z.record(z.any()).optional()
    }).optional(),
    options: z.object({
        maxResults: z.number().min(1).max(10000).default(1000),
        includeMetadata: z.boolean().default(true)
    }).optional()
}).strict();

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
    async searchWithinRadius(req: Request, res: Response): Promise<void> {
        const start = Date.now();
        try {
            const validated = RadiusSearchRequestSchema.parse(req.body);

            const result = await this.radiusSearchService.searchWithinRadius(
                validated.center,
                validated.radius,
                validated.filters,
                validated.options
            );

            metrics.timing('radius_search.latency', Date.now() - start);
            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/radius/heatmap
    async generateHeatmap(req: Request, res: Response): Promise<void> {
        try {
            const validated = HeatmapRequestSchema.parse(req.body);

            // Note: Filters/Options optional here for brevity
            const result = await this.radiusSearchService.generateDensityHeatmap(
                validated.bounds,
                validated.resolution
            );

            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/radius/cluster
    async clusterPoints(req: Request, res: Response): Promise<void> {
        try {
            const validated = ClusterRequestSchema.parse(req.body);

            const result = await this.radiusSearchService.clusterPoints(
                validated.points,
                validated.algorithm,
                validated.parameters
            );

            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/radius/analytics
    async generateAnalytics(req: Request, res: Response): Promise<void> {
        // Basic implementation for blocking call, detailed one in earlier prompt
        try {
            // ... (simplified binding)
            res.json({ success: true, message: "Use specialized endpoint for full analytics" });
        } catch (e) { this.handleError(e, res); }
    }

    // POST /api/v1/radius/stream
    async initializeStreamingSearch(req: Request, res: Response): Promise<void> {
        // Simplified mock of streaming init
        res.status(501).json({ error: "Streaming implemented via WebSocket server, not REST" });
    }

    private handleError(error: any, res: Response) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
        } else {
            logger.error('Radius Search Controller Error', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}
