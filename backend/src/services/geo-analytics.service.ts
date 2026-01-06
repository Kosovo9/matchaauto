import { z } from 'zod';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';

export const AnalyticsRequestSchema = z.object({
    boundingBox: z.object({
        minLat: z.number().min(-90).max(90),
        maxLat: z.number().min(-90).max(90),
        minLng: z.number().min(-180).max(180),
        maxLng: z.number().min(-180).max(180)
    }),
    gridSize: z.number().min(0.001).max(0.1).default(0.01), // degrees
    timeRange: z.object({
        start: z.date().optional(),
        end: z.date().optional()
    }).optional()
});

export const HeatmapPointSchema = z.object({
    lat: z.number(),
    lng: z.number(),
    intensity: z.number()
});

export type AnalyticsRequest = z.infer<typeof AnalyticsRequestSchema>;

export class GeoAnalyticsService {
    private pgPool: Pool;
    private redis: Redis;
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 300; // 5 minutes for realtime analytics
    private longCacheTTL = 3600; // 1 hour for historical patterns

    constructor(pgPool: Pool, redis: Redis) {
        this.pgPool = pgPool;
        this.redis = redis;
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 30000,
            timeout: 20000 // DB queries can be slow
        });
    }

    /**
     * Genera datos para mapa de calor (Heatmap) con caching y optimización espacial.
     */
    async getDensityStats(request: AnalyticsRequest): Promise<any[]> {
        const start = Date.now();
        metrics.increment('analytics.density_map_requests');

        try {
            const validated = AnalyticsRequestSchema.parse(request);
            const cacheKey = `analytics:density:${this.hashRequest(validated)}`;

            const cached = await this.redis.get(cacheKey);
            if (cached) {
                metrics.increment('analytics.cache_hits_total');
                return JSON.parse(cached);
            }
            metrics.increment('analytics.cache_misses_total');

            const result = await this.circuitBreaker.execute(async () => {
                const client = await this.pgPool.connect();
                try {
                    // Optimized Grid Clustering using PostGIS
                    // ST_SnapToGrid groups points into a grid for fast aggregation
                    const query = `
                        SELECT 
                            ST_Y(ST_SnapToGrid(location::geometry, $1, $1)) as lat,
                            ST_X(ST_SnapToGrid(location::geometry, $1, $1)) as lng,
                            COUNT(*) as intensity
                        FROM vehicle_locations
                        WHERE is_active = TRUE
                          AND ST_Intersects(location::geometry, ST_MakeEnvelope($2, $3, $4, $5, 4326))
                          ${validated.timeRange ? 'AND updated_at BETWEEN $6 AND $7' : ''}
                        GROUP BY lat, lng
                        HAVING COUNT(*) > 0;
                    `;

                    const params = [
                        validated.gridSize,
                        validated.boundingBox.minLng,
                        validated.boundingBox.minLat,
                        validated.boundingBox.maxLng,
                        validated.boundingBox.maxLat
                    ];

                    if (validated.timeRange?.start && validated.timeRange?.end) {
                        params.push(validated.timeRange.start, validated.timeRange.end);
                    }

                    const res = await client.query(query, params);
                    return res.rows.map(r => ({
                        lat: parseFloat(r.lat),
                        lng: parseFloat(r.lng),
                        intensity: parseInt(r.intensity)
                    }));
                } finally {
                    client.release();
                }
            });

            await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
            metrics.timing('analytics.density_duration_ms', Date.now() - start);

            return result;
        } catch (error) {
            logger.error('Density stats failed', { error });
            metrics.increment('analytics.errors_total');
            return []; // Fallback empty
        }
    }

    /**
     * Detecta áreas de alta demanda sin cobertura (Dark Zones)
     * Useful for business intelligence to know where to expand.
     */
    async findCoverageGaps(minDemand: number = 5, searchRadius: number = 2000): Promise<any[]> {
        const cacheKey = `analytics:gaps:${minDemand}:${searchRadius}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const result = await this.circuitBreaker.execute(async () => {
            const client = await this.pgPool.connect();
            try {
                // Find clusters of user searches/locations where NO vehicles are nearby
                const query = `
                    WITH demand_clusters AS (
                        SELECT 
                            ST_ClusterDBSCAN(location::geometry, eps := 0.005, minpoints := $1) OVER () as cid,
                            location
                        FROM user_locations
                        WHERE created_at > NOW() - INTERVAL '24 hours'
                    )
                    SELECT 
                        ST_Y(ST_Centroid(ST_Collect(location::geometry))) as lat,
                        ST_X(ST_Centroid(ST_Collect(location::geometry))) as lng,
                        COUNT(*) as unmet_demand_count
                    FROM demand_clusters
                    WHERE cid IS NOT NULL
                    AND NOT EXISTS (
                        SELECT 1 FROM vehicle_locations vl 
                        WHERE ST_DWithin(vl.location, demand_clusters.location, $2)
                    )
                    GROUP BY cid
                    ORDER BY unmet_demand_count DESC;
                `;
                const res = await client.query(query, [minDemand, searchRadius]);
                return res.rows;
            } finally {
                client.release();
            }
        });

        await this.redis.setex(cacheKey, this.longCacheTTL, JSON.stringify(result));
        return result;
    }

    /**
     * Análisis de patrones de movimiento (Commute Analysis)
     * Identifies "Hubs" for specific users (Home, Work, etc.)
     */
    async analyzeMovementPatterns(userId: string): Promise<any> {
        const cacheKey = `analytics:patterns:${userId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const result = await this.circuitBreaker.execute(async () => {
            const client = await this.pgPool.connect();
            try {
                // Use K-Means or Centroid logic to find top 2 hubs
                const query = `
                    SELECT 
                        ST_Y(ST_Centroid(ST_Collect(location::geometry))) as lat,
                        ST_X(ST_Centroid(ST_Collect(location::geometry))) as lng,
                        COUNT(*) as stay_count
                    FROM location_history
                    WHERE user_id = $1
                    GROUP BY ST_SnapToGrid(location::geometry, 0.005) -- roughly 500m
                    ORDER BY stay_count DESC
                    LIMIT 2;
                `;
                const res = await client.query(query, [userId]);
                return res.rows;
            } finally {
                client.release();
            }
        });

        await this.redis.setex(cacheKey, this.longCacheTTL, JSON.stringify(result));
        return result;
    }

    private hashRequest(req: any): string {
        return Buffer.from(JSON.stringify(req)).toString('base64');
    }

    async clearCache(): Promise<void> {
        const keys = await this.redis.keys('analytics:*');
        if (keys.length) await this.redis.del(...keys);
    }
}
