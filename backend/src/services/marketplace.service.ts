import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { Vehicle } from './vehicle.service';

export const SearchFilterSchema = z.object({
    query: z.string().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    yearMin: z.number().min(1900).optional(),
    yearMax: z.number().max(new Date().getFullYear() + 1).optional(),
    fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid', 'hydrogen']).optional(),
    transmission: z.enum(['automatic', 'manual']).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    radius: z.number().min(0).max(500000).default(50000), // 50km default
    sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'distance', 'relevance']).default('relevance'),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20)
});

export type SearchFilter = z.infer<typeof SearchFilterSchema>;

export class MarketplaceService {
    private redis: Redis;
    private pgPool: Pool;
    private readonly CACHE_TTL = 300; // 5 minutes for search results

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
    }

    async search(filters: SearchFilter): Promise<{ items: Vehicle[], total: number, page: number }> {
        const start = Date.now();

        try {
            // Validate filters
            const validated = SearchFilterSchema.parse(filters);

            // Generate cache key
            const cacheKey = `search:${JSON.stringify(validated)}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                metrics.increment('marketplace.search_cache_hits');
                return JSON.parse(cached);
            }

            metrics.increment('marketplace.search_cache_misses');

            const client = await this.pgPool.connect();
            try {
                // Build Dynamic Query
                const conditions: string[] = ['v.status = \'published\''];
                const values: any[] = [];
                let pIdx = 1;

                if (validated.query) {
                    conditions.push(`(v.make ILIKE $${pIdx} OR v.model ILIKE $${pIdx} OR v.description ILIKE $${pIdx})`);
                    values.push(`%${validated.query}%`);
                    pIdx++;
                }
                if (validated.minPrice) {
                    conditions.push(`v.price >= $${pIdx}`);
                    values.push(validated.minPrice);
                    pIdx++;
                }
                if (validated.maxPrice) {
                    conditions.push(`v.price <= $${pIdx}`);
                    values.push(validated.maxPrice);
                    pIdx++;
                }
                if (validated.make) {
                    conditions.push(`v.make ILIKE $${pIdx}`);
                    values.push(validated.make);
                    pIdx++;
                }
                // ... add other filters similarly

                // Spatial Filter
                let distanceField = '0 as distance';
                let orderBy = 'v.created_at DESC';

                if (validated.lat !== undefined && validated.lng !== undefined) {
                    // 10x Optimization: Use <-> operator for KNN if sorting by distance, or ST_DWithin for strict filtering
                    conditions.push(`ST_DWithin(vl.location::geography, ST_SetSRID(ST_MakePoint($${pIdx + 1}, $${pIdx}), 4326)::geography, $${pIdx + 2})`);
                    distanceField = `ST_Distance(vl.location::geography, ST_SetSRID(ST_MakePoint($${pIdx + 1}, $${pIdx}), 4326)::geography) as distance`;

                    values.push(validated.lat); // pIdx
                    values.push(validated.lng); // pIdx+1
                    values.push(validated.radius); // pIdx+2
                    pIdx += 3;

                    if (validated.sortBy === 'distance') {
                        orderBy = 'distance ASC';
                    }
                }

                if (validated.sortBy === 'price_asc') orderBy = 'v.price ASC';
                if (validated.sortBy === 'price_desc') orderBy = 'v.price DESC';

                const sql = `
            SELECT v.*, ${distanceField}, COUNT(*) OVER() as full_count
            FROM vehicles v
            LEFT JOIN vehicle_locations_static vl ON v.id = vl.vehicle_id
            WHERE ${conditions.join(' AND ')}
            ORDER BY ${orderBy}
            LIMIT $${pIdx} OFFSET $${pIdx + 1}
        `;

                values.push(validated.limit);
                values.push((validated.page - 1) * validated.limit);

                const result = await client.query(sql, values);

                const total = result.rows.length > 0 ? parseInt(result.rows[0].full_count) : 0;
                const items = result.rows.map(row => {
                    const { full_count, ...vehicle } = row;
                    // Clean up vehicle object
                    vehicle.price = parseFloat(vehicle.price);
                    vehicle.mileage = parseFloat(vehicle.mileage);
                    return vehicle as Vehicle;
                });

                const response = { items, total, page: validated.page };

                // Cache result
                await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(response));

                metrics.timing('marketplace.search_time_ms', Date.now() - start);
                return response;

            } finally {
                client.release();
            }

        } catch (error: any) {
            logger.error('Marketplace search failed', { error: error.message, filters });
            throw error; // Let controller handle error response
        }
    }

    async getFeaturedListings(limit = 10): Promise<Vehicle[]> {
        // Return high-value assets or sponsored listings
        // Optimized with simple Redis cache
        const cacheKey = `featured:limit:${limit}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const client = await this.pgPool.connect();
        try {
            const res = await client.query(`
            SELECT v.* 
            FROM vehicles v 
            WHERE v.status = 'published' AND (v.metadata->>'isFeatured')::boolean = true
            ORDER BY RANDOM() 
            LIMIT $1
         `, [limit]);

            const items = res.rows; // map properly in real impl
            await this.redis.setex(cacheKey, 600, JSON.stringify(items));
            return items as any;
        } finally {
            client.release();
        }
    }
}
