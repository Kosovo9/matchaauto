import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { LRUCache } from 'lru-cache';
import { compress, decompress } from 'lz4';
import { Mutex } from 'async-mutex';

export const BoundsSchema = z.object({
    minLng: z.number(), minLat: z.number(),
    maxLng: z.number(), maxLat: z.number()
});

export interface HeatmapData {
    grid: { lat: number; lng: number; intensity: number }[];
    maxIntensity: number;
}

export class GeoAnalyticsService {
    private redis: Redis;
    private pgPool: Pool;
    private memoryCache: LRUCache<string, Buffer>;
    private circuitBreaker: CircuitBreaker;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.memoryCache = new LRUCache<string, Buffer>({
            max: 500,
            ttl: 60000 // 1 min for heavy analytics
        });
        this.circuitBreaker = new CircuitBreaker({ failureThreshold: 3, timeout: 10000 });
    }

    async calculateHeatmap(bounds: z.infer<typeof BoundsSchema>, resolution: number = 10): Promise<HeatmapData> {
        const cacheKey = `heatmap:${JSON.stringify(bounds)}:${resolution}`;

        // 1. L1 Cache
        const mem = this.memoryCache.get(cacheKey);
        if (mem) return JSON.parse(decompress(mem).toString());

        // 2. L2 Cache
        const redis = await this.redis.get(cacheKey);
        if (redis) {
            const data = JSON.parse(redis);
            this.memoryCache.set(cacheKey, compress(Buffer.from(redis)));
            return data;
        }

        // 3. PostGIS Aggregation (Vectorized)
        return this.circuitBreaker.execute(async () => {
            const client = await this.pgPool.connect();
            try {
                // Snap to grid for O(1) aggregation relative to grid size, not N points
                // 0.001 deg is approx 100m. Resolution scales this.
                const gridSize = 0.001 * resolution;

                const res = await client.query(`
                SELECT 
                    ST_X(ST_SnapToGrid(location::geometry, $1)) as lng,
                    ST_Y(ST_SnapToGrid(location::geometry, $1)) as lat,
                    COUNT(*) as count
                FROM vehicle_locations
                WHERE location && ST_MakeEnvelope($2, $3, $4, $5, 4326)
                GROUP BY 1, 2
              `, [gridSize, bounds.minLng, bounds.minLat, bounds.maxLng, bounds.maxLat]);

                let maxIntensity = 0;
                const grid = res.rows.map(r => {
                    const val = parseInt(r.count);
                    if (val > maxIntensity) maxIntensity = val;
                    return { lat: parseFloat(r.lat), lng: parseFloat(r.lng), intensity: val };
                });

                // Normalize
                if (maxIntensity > 0) {
                    grid.forEach(g => g.intensity = parseFloat((g.intensity / maxIntensity).toFixed(2)));
                }

                const result = { grid, maxIntensity };

                // Cache
                const str = JSON.stringify(result);
                await this.redis.setex(cacheKey, 300, str);
                this.memoryCache.set(cacheKey, compress(Buffer.from(str)));

                return result;
            } finally {
                client.release();
            }
        });
    }

    async detectClusters(points: { lat: number, lng: number }[], epsilonKm: number, minPoints: number) {
        // For large datasets, push to DB. For small (<1000), do in-memory DBSCAN?
        // 10x approach: Offload to PostGIS `ST_ClusterDBSCAN`
        const client = await this.pgPool.connect();
        try {
            // Serialize points to WKT or use a temp table
            // Optimized: pass JSON array to a function that unpacks? 
            // Or insert into temp table.
            await client.query('CREATE TEMP TABLE IF NOT EXISTS temp_cluster_points (id serial, location geometry(Point, 4326))');
            await client.query('TRUNCATE temp_cluster_points');

            // Batch insert (simplified for implementation speed)
            // In real 10x, use pg-copy-streams
            const values = points.map(p => `(ST_SetSRID(ST_MakePoint(${p.lng}, ${p.lat}), 4326))`).join(',');
            await client.query(`INSERT INTO temp_cluster_points (location) VALUES ${values}`);

            const res = await client.query(`
              SELECT cid, ST_AsGeoJSON(ST_Centroid(ST_Collect(location))) as center, count(*) 
              FROM (
                  SELECT ST_ClusterDBSCAN(location, eps := $1, minpoints := $2) over () as cid, location
                  FROM temp_cluster_points
              ) sq
              WHERE cid IS NOT NULL
              GROUP BY cid
          `, [epsilonKm / 111.0, minPoints]); // Convert km to degrees approx

            return res.rows.map(r => ({
                id: r.cid,
                center: JSON.parse(r.center),
                count: parseInt(r.count)
            }));
        } finally {
            client.release();
        }
    }
}
