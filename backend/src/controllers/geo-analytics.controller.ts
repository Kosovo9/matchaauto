import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { GeoAnalyticsService } from '../services/geo-analytics.service';
import { MetricsCollector } from '../utils/metrics-collector';
import { CacheStrategies, SpatialCache } from '../utils/spatial-cache';
import { logger } from '../utils/logger';

// ==================== ZOD SCHEMAS ====================
const BoundingBoxSchema = z.object({
    southwest: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
    }),
    northeast: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
    })
});

const HeatmapRequestSchema = z.object({
    points: z.array(z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        weight: z.number().min(0).optional(),
        timestamp: z.string().datetime().optional()
    })).min(1).max(1000000),
    bounds: BoundingBoxSchema.optional(),
    options: z.object({
        resolution: z.number().min(10).max(1000).default(100),
        radius: z.number().min(10).max(5000).default(100),
        normalization: z.enum(['linear', 'log', 'sqrt', 'quantile']).default('linear'),
        outputFormat: z.enum(['grid', 'geojson', 'png']).default('grid')
    }).optional().default({})
});

const ClusteringRequestSchema = z.object({
    points: z.array(z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        weight: z.number().optional()
    })).min(2).max(1000000),
    algorithm: z.enum(['dbscan', 'kmeans']).default('dbscan'),
    parameters: z.object({
        eps: z.number().min(0).default(0.01),
        minPoints: z.number().int().min(1).default(5),
        k: z.number().int().min(1).max(100).optional()
    }).optional().default({}),
    options: z.object({
        calculateMetrics: z.boolean().default(true)
    }).optional().default({})
});

const SpatialStatisticsSchema = z.object({
    points: z.array(z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        value: z.number().optional()
    })).min(1).max(1000000),
    statistics: z.array(z.enum([
        'centroid',
        'meanCenter',
        'standardDistance'
    ])).min(1).default(['centroid']),
    options: z.object({
        confidenceLevel: z.number().min(0.5).max(0.99).default(0.95)
    }).optional().default({})
});

// ==================== CONTROLLER ====================
export class GeoAnalyticsController {
    private service: GeoAnalyticsService;
    private redis: Redis;
    private pgPool: Pool;
    private metrics: MetricsCollector;
    private cache: SpatialCache;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.service = new GeoAnalyticsService(redis, pgPool);
        this.metrics = MetricsCollector.getInstance();
        this.cache = new SpatialCache(redis, CacheStrategies.MULTI_LAYER);
    }

    // ==================== PUBLIC METHODS ====================

    /**
     * Generate heatmap from point data
     */
    async generateHeatmap(c: Context) {
        const startTime = Date.now();
        const requestId = `heatmap-${Date.now()}`;

        try {
            const body = await c.req.json();
            const validated = await HeatmapRequestSchema.parseAsync(body);

            const serviceBounds = validated.bounds ? {
                minLat: validated.bounds.southwest.lat,
                minLng: validated.bounds.southwest.lng,
                maxLat: validated.bounds.northeast.lat,
                maxLng: validated.bounds.northeast.lng
            } : {
                minLat: -90, minLng: -180, maxLat: 90, maxLng: 180
            };

            const result = await this.service.calculateHeatmap(serviceBounds, validated.options.resolution);

            this.metrics.increment('geo_analytics.heatmap_generation');

            return c.json({
                success: true,
                data: result,
                metadata: {
                    requestId,
                    processingTime: Date.now() - startTime,
                    resolution: validated.options.resolution
                }
            });

        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Perform spatial clustering
     */
    async performClustering(c: Context) {
        const startTime = Date.now();

        try {
            const body = await c.req.json();
            const validated = await ClusteringRequestSchema.parseAsync(body);

            if (validated.algorithm === 'dbscan') {
                const points = validated.points.map(p => ({ lat: p.lat, lng: p.lng }));

                const result = await this.service.detectClusters(
                    points,
                    validated.parameters.eps,
                    validated.parameters.minPoints
                );

                this.metrics.increment('geo_analytics.clustering');

                return c.json({
                    success: true,
                    data: result,
                    metadata: {
                        algorithm: 'dbscan',
                        clustersFound: result.length,
                        processingTime: Date.now() - startTime
                    }
                });
            } else {
                return c.json({ success: false, error: 'Algorithm not implemented' }, 501);
            }

        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Calculate spatial statistics
     */
    async calculateSpatialStatistics(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await SpatialStatisticsSchema.parseAsync(body);

            const stats: any = {};

            if (validated.statistics.includes('centroid')) {
                const count = validated.points.length;
                if (count > 0) {
                    const sumLat = validated.points.reduce((sum, p) => sum + p.lat, 0);
                    const sumLng = validated.points.reduce((sum, p) => sum + p.lng, 0);
                    stats.centroid = { lat: sumLat / count, lng: sumLng / count };
                }
            }

            return c.json({ success: true, data: stats });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    private handleError(error: any, c: Context) {
        logger.error('GeoAnalytics Controller Error', error);
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        } else {
            return c.json({ success: false, error: 'Internal Analytics Error' }, 500);
        }
    }
}
