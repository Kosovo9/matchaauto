import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export const RadiusSearchRequestSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(10).max(50000).default(5000), // meters
    unit: z.enum(['meters', 'kilometers', 'miles']).default('meters'),
    categories: z.array(z.enum([
        'vehicle', 'part', 'service', 'dealer', 'mechanic', 'rental',
        'charging', 'parking', 'wash', 'repair', 'insurance', 'finance'
    ])).optional(),
    filters: z.object({
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        minRating: z.number().min(0).max(5).optional(),
        minBattery: z.number().min(0).max(100).optional(),
        vehicleType: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
        availability: z.object({
            start: z.date().optional(),
            end: z.date().optional(),
            instant: z.boolean().optional()
        }).optional(),
        sortBy: z.enum([
            'distance', 'price_low', 'price_high', 'rating', 'relevance',
            'availability', 'battery', 'speed'
        ]).default('distance'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0)
    }).optional()
});

export const SearchResultSchema = z.object({
    id: z.string().uuid(),
    type: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    distance: z.number(),
    bearing: z.number().min(0).max(360).optional(),
    data: z.record(z.string(), z.any()),
    score: z.number().min(0).max(1),
    metadata: z.object({
        accuracy: z.number().optional(),
        lastUpdated: z.date().optional(),
        status: z.string().optional(),
        provider: z.string().optional()
    }).optional()
});

export const RadiusSearchResponseSchema = z.object({
    results: z.array(SearchResultSchema),
    total: z.number(),
    hasMore: z.boolean(),
    searchCenter: z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number()
    }),
    executionTime: z.number(),
    cacheHit: z.boolean().default(false),
    boundingBox: z.object({
        minLat: z.number(),
        minLon: z.number(),
        maxLat: z.number(),
        maxLon: z.number()
    }).optional(),
    clusters: z.array(z.object({
        centerLat: z.number(),
        centerLon: z.number(),
        count: z.number(),
        radius: z.number(),
        density: z.number()
    })).optional()
});

export type RadiusSearchRequest = z.infer<typeof RadiusSearchRequestSchema>;
export type RadiusSearchResponse = z.infer<typeof RadiusSearchResponseSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;

export class RadiusSearchService {
    private redis: Redis;
    private pgPool: Pool;
    private cacheTTL = 300; // 5 minutes for search results

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
    }

    private async searchVehicles(
        lat: number,
        lon: number,
        radius: number,
        filters?: any
    ): Promise<SearchResult[]> {
        const client = await this.pgPool.connect();

        try {
            let query = `
        SELECT 
          v.id,
          v.user_id,
          v.vehicle_id,
          v.location,
          v.accuracy,
          v.speed,
          v.battery_level,
          v.last_updated,
          v.metadata,
          veh.brand as make,
          veh.model,
          veh.year,
          veh.price,
          veh.status,
          ST_Distance(
            v.location,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
          ) as distance_meters,
          DEGREES(ST_Azimuth(
            ST_Transform(ST_SetSRID(ST_MakePoint($2, $1), 4326), 3857),
            ST_Transform(v.location::geometry, 3857)
          )) as bearing
        FROM vehicle_locations v
        JOIN vehicles veh ON v.vehicle_id = veh.id
        JOIN users u ON v.user_id = u.id
        WHERE v.is_active = TRUE
          AND ST_DWithin(
            v.location,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            $3
          )
      `;

            const params: any[] = [lat, lon, radius];
            let paramIndex = 4;

            // Apply filters
            if (filters?.vehicleType?.length) {
                query += ` AND veh.type = ANY($${paramIndex})`;
                params.push(filters.vehicleType);
                paramIndex++;
            }

            if (filters?.minBattery) {
                query += ` AND v.battery_level >= $${paramIndex}`;
                params.push(filters.minBattery);
                paramIndex++;
            }

            if (filters?.maxPrice) {
                query += ` AND veh.price <= $${paramIndex}`;
                params.push(filters.maxPrice);
                paramIndex++;
            }

            if (filters?.minRating) {
                query += ` AND u.rating >= $${paramIndex}`;
                params.push(filters.minRating);
                paramIndex++;
            }

            // Apply sorting
            switch (filters?.sortBy) {
                case 'price_low':
                    query += ` ORDER BY veh.price ASC`;
                    break;
                case 'price_high':
                    query += ` ORDER BY veh.price DESC`;
                    break;
                case 'rating':
                    query += ` ORDER BY u.rating DESC`;
                    break;
                case 'battery':
                    query += ` ORDER BY v.battery_level DESC`;
                    break;
                default:
                    query += ` ORDER BY distance_meters ASC`;
            }

            query += ` LIMIT $${paramIndex}`;
            params.push(filters?.limit || 50);

            if (filters?.offset) {
                query += ` OFFSET $${paramIndex + 1}`;
                params.push(filters.offset);
            }

            const result = await client.query(query, params);

            return result.rows.map(row => ({
                id: row.id,
                type: 'vehicle',
                latitude: parseFloat(row.location.coordinates[1]),
                longitude: parseFloat(row.location.coordinates[0]),
                distance: row.distance_meters,
                bearing: row.bearing,
                data: {
                    vehicleId: row.vehicle_id,
                    userId: row.user_id,
                    make: row.make,
                    model: row.model,
                    year: row.year,
                    price: row.price,
                    batteryLevel: row.battery_level,
                    speed: row.speed,
                    features: row.features,
                    ownerRating: row.owner_rating,
                    metadata: row.metadata
                },
                score: this.calculateVehicleScore(row, filters),
                metadata: {
                    accuracy: row.accuracy,
                    lastUpdated: row.last_updated,
                    status: row.status
                }
            }));
        } finally {
            client.release();
        }
    }

    private async searchServices(
        lat: number,
        lon: number,
        radius: number,
        filters?: any
    ): Promise<SearchResult[]> {
        const client = await this.pgPool.connect();

        try {
            let query = `
        SELECT 
          s.id,
          s.name,
          s.type,
          s.location,
          s.price_range,
          s.rating,
          s.review_count,
          s.features,
          s.availability,
          s.metadata,
          s.is_open,
          ST_Distance(
            s.location,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
          ) as distance_meters,
          DEGREES(ST_Azimuth(
            ST_Transform(ST_SetSRID(ST_MakePoint($2, $1), 4326), 3857),
            ST_Transform(s.location::geometry, 3857)
          )) as bearing
        FROM services s
        WHERE s.is_active = TRUE
          AND ST_DWithin(
            s.location,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            $3
          )
      `;

            const params: any[] = [lat, lon, radius];
            let paramIndex = 4;

            // Apply filters
            if (filters?.categories?.length) {
                query += ` AND s.type = ANY($${paramIndex})`;
                params.push(filters.categories);
                paramIndex++;
            }

            if (filters?.minRating) {
                query += ` AND s.rating >= $${paramIndex}`;
                params.push(filters.minRating);
                paramIndex++;
            }

            // Apply sorting
            switch (filters?.sortBy) {
                case 'rating':
                    query += ` ORDER BY s.rating DESC`;
                    break;
                case 'price_low':
                    query += ` ORDER BY (s.price_range->>'min')::numeric ASC`;
                    break;
                default:
                    query += ` ORDER BY distance_meters ASC`;
            }

            query += ` LIMIT $${paramIndex}`;
            params.push(filters?.limit || 50);

            const result = await client.query(query, params);

            return result.rows.map(row => ({
                id: row.id,
                type: 'service',
                latitude: parseFloat(row.location.coordinates[1]),
                longitude: parseFloat(row.location.coordinates[0]),
                distance: row.distance_meters,
                bearing: row.bearing,
                data: {
                    name: row.name,
                    type: row.type,
                    priceRange: row.price_range,
                    rating: row.rating,
                    reviewCount: row.review_count,
                    features: row.features,
                    availability: row.availability,
                    isOpen: row.is_open
                },
                score: this.calculateServiceScore(row, filters),
                metadata: {
                    lastUpdated: row.metadata?.last_updated,
                    provider: row.metadata?.provider
                }
            }));
        } finally {
            client.release();
        }
    }

    private calculateVehicleScore(vehicle: any, filters?: any): number {
        let score = 1.0;

        // Distance factor (closer is better)
        const maxDistance = filters?.radius || 5000;
        const distanceFactor = Math.max(0, 1 - (vehicle.distance_meters / maxDistance));
        score *= 0.3 + (distanceFactor * 0.7);

        // Battery factor
        if (vehicle.battery_level !== null) {
            const batteryFactor = vehicle.battery_level / 100;
            score *= 0.7 + (batteryFactor * 0.3);
        }

        // Rating factor
        if (vehicle.owner_rating !== null) {
            const ratingFactor = vehicle.owner_rating / 5;
            score *= 0.8 + (ratingFactor * 0.2);
        }

        // Price factor (cheaper is better)
        if (vehicle.price !== null && filters?.maxPrice) {
            const priceFactor = Math.max(0, 1 - (vehicle.price / filters.maxPrice));
            score *= 0.6 + (priceFactor * 0.4);
        }

        // Recency factor (newer is better)
        if (vehicle.last_updated) {
            const hoursOld = (Date.now() - new Date(vehicle.last_updated).getTime()) / (1000 * 60 * 60);
            const recencyFactor = Math.max(0, 1 - (hoursOld / 24));
            score *= 0.9 + (recencyFactor * 0.1);
        }

        return Math.min(1.0, score);
    }

    private calculateServiceScore(service: any, filters?: any): number {
        let score = 1.0;

        // Distance factor
        const maxDistance = filters?.radius || 5000;
        const distanceFactor = Math.max(0, 1 - (service.distance_meters / maxDistance));
        score *= 0.4 + (distanceFactor * 0.6);

        // Rating factor
        if (service.rating !== null) {
            const ratingFactor = service.rating / 5;
            score *= 0.5 + (ratingFactor * 0.5);
        }

        // Review count factor (more reviews = more trust)
        if (service.review_count !== null) {
            const reviewFactor = Math.min(1, Math.log10(service.review_count + 1) / 2);
            score *= 0.8 + (reviewFactor * 0.2);
        }

        // Availability factor
        if (service.is_open) {
            score *= 1.2;
        }

        return Math.min(1.0, score);
    }

    private async detectClusters(
        results: SearchResult[],
        clusterRadius: number = 500
    ): Promise<any[]> {
        if (results.length === 0) return [];

        const clusters: any[] = [];
        const visited = new Set<string>();

        for (let i = 0; i < results.length; i++) {
            const point = results[i];
            const pointKey = `${point.latitude},${point.longitude}`;

            if (visited.has(pointKey)) continue;

            // Find all points within cluster radius
            const clusterPoints = results.filter((other, j) => {
                if (i === j) return true;

                const distance = this.calculateHaversineDistance(
                    point.latitude,
                    point.longitude,
                    other.latitude,
                    other.longitude
                );

                return distance <= clusterRadius;
            });

            if (clusterPoints.length >= 3) { // Minimum points for a cluster
                // Calculate cluster center
                const centerLat = clusterPoints.reduce((sum, p) => sum + p.latitude, 0) / clusterPoints.length;
                const centerLon = clusterPoints.reduce((sum, p) => sum + p.longitude, 0) / clusterPoints.length;

                // Calculate cluster radius (max distance from center)
                const radius = Math.max(...clusterPoints.map(p =>
                    this.calculateHaversineDistance(centerLat, centerLon, p.latitude, p.longitude)
                ));

                // Calculate density (points per square km)
                const area = Math.PI * Math.pow(radius / 1000, 2);
                const density = clusterPoints.length / Math.max(area, 0.01);

                clusters.push({
                    centerLat,
                    centerLon,
                    count: clusterPoints.length,
                    radius,
                    density,
                    types: [...new Set(clusterPoints.map(p => p.type))],
                    avgScore: clusterPoints.reduce((sum, p) => sum + p.score, 0) / clusterPoints.length
                });

                // Mark all points in cluster as visited
                clusterPoints.forEach(p => {
                    visited.add(`${p.latitude},${p.longitude}`);
                });
            }

            visited.add(pointKey);
        }

        return clusters;
    }

    private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000; // Earth's radius in meters
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private calculateBoundingBox(
        lat: number,
        lon: number,
        radius: number
    ): { minLat: number; minLon: number; maxLat: number; maxLon: number } {
        // Convert radius to degrees (approximate)
        const latDelta = radius / 111320; // meters per degree of latitude
        const lonDelta = radius / (111320 * Math.cos(this.toRad(lat)));

        return {
            minLat: lat - latDelta,
            minLon: lon - lonDelta,
            maxLat: lat + latDelta,
            maxLon: lon + lonDelta
        };
    }

    private getCacheKey(request: RadiusSearchRequest): string {
        const keyParts = [
            `lat:${request.latitude.toFixed(6)}`,
            `lon:${request.longitude.toFixed(6)}`,
            `radius:${request.radius}`,
            `unit:${request.unit}`,
            `cats:${request.categories?.sort().join(',') || 'all'}`,
            `filters:${JSON.stringify(request.filters || {})}`
        ];

        return `radius_search:${Buffer.from(keyParts.join('|')).toString('base64').substring(0, 50)}`;
    }

    async search(request: RadiusSearchRequest): Promise<RadiusSearchResponse> {
        const startTime = Date.now();

        // Validate request
        const validatedRequest = RadiusSearchRequestSchema.parse(request);

        // Convert radius to meters if needed
        let radiusMeters = validatedRequest.radius;
        if (validatedRequest.unit === 'kilometers') {
            radiusMeters = validatedRequest.radius * 1000;
        } else if (validatedRequest.unit === 'miles') {
            radiusMeters = validatedRequest.radius * 1609.34;
        }

        // Generate cache key
        const cacheKey = this.getCacheKey(validatedRequest);

        // Try cache first
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            const cachedResponse: RadiusSearchResponse = JSON.parse(cached);
            logger.debug('Cache hit for radius search:', {
                lat: validatedRequest.latitude,
                lon: validatedRequest.longitude,
                radius: radiusMeters
            });

            return {
                ...cachedResponse,
                cacheHit: true,
                executionTime: Date.now() - startTime
            };
        }

        // Perform searches based on categories
        let allResults: SearchResult[] = [];

        if (!validatedRequest.categories || validatedRequest.categories.includes('vehicle')) {
            const vehicleResults = await this.searchVehicles(
                validatedRequest.latitude,
                validatedRequest.longitude,
                radiusMeters,
                validatedRequest.filters
            );
            allResults.push(...vehicleResults);
        }

        if (!validatedRequest.categories || validatedRequest.categories.some(cat =>
            ['service', 'dealer', 'mechanic', 'rental', 'charging', 'parking', 'wash', 'repair'].includes(cat)
        )) {
            const serviceResults = await this.searchServices(
                validatedRequest.latitude,
                validatedRequest.longitude,
                radiusMeters,
                validatedRequest.filters
            );
            allResults.push(...serviceResults);
        }

        // Apply final sorting
        if (validatedRequest.filters?.sortBy === 'relevance') {
            allResults.sort((a, b) => b.score - a.score);
        } else if (validatedRequest.filters?.sortBy === 'distance') {
            allResults.sort((a, b) => a.distance - b.distance);
        }

        // Apply limit and offset
        const startIndex = validatedRequest.filters?.offset || 0;
        const limit = validatedRequest.filters?.limit || 50;
        const paginatedResults = allResults.slice(startIndex, startIndex + limit);

        // Detect clusters if we have enough results
        const clusters = allResults.length >= 10 ?
            await this.detectClusters(allResults, radiusMeters / 10) : [];

        // Calculate bounding box
        const boundingBox = this.calculateBoundingBox(
            validatedRequest.latitude,
            validatedRequest.longitude,
            radiusMeters
        );

        const response: RadiusSearchResponse = {
            results: paginatedResults,
            total: allResults.length,
            hasMore: startIndex + limit < allResults.length,
            searchCenter: {
                latitude: validatedRequest.latitude,
                longitude: validatedRequest.longitude,
                radius: radiusMeters
            },
            executionTime: Date.now() - startTime,
            cacheHit: false,
            boundingBox,
            clusters: clusters.slice(0, 10) // Limit to 10 clusters
        };

        // Cache the response
        await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(response));

        logger.info('Radius search completed:', {
            lat: validatedRequest.latitude,
            lon: validatedRequest.longitude,
            radius: radiusMeters,
            results: allResults.length,
            time: response.executionTime
        });

        return response;
    }

    async batchSearch(
        requests: RadiusSearchRequest[]
    ): Promise<RadiusSearchResponse[]> {
        const results: RadiusSearchResponse[] = [];

        // Process in parallel with concurrency limit
        const concurrencyLimit = 5;
        const chunks = [];

        for (let i = 0; i < requests.length; i += concurrencyLimit) {
            chunks.push(requests.slice(i, i + concurrencyLimit));
        }

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(request =>
                this.search(request).catch(error => {
                    logger.error('Batch search failed for request:', {
                        request,
                        error: error.message
                    });

                    return {
                        results: [],
                        total: 0,
                        hasMore: false,
                        searchCenter: {
                            latitude: request.latitude,
                            longitude: request.longitude,
                            radius: request.radius
                        },
                        executionTime: 0,
                        cacheHit: false,
                        error: error.message
                    } as any;
                })
            );

            const chunkResults = await Promise.all(chunkPromises);
            results.push(...chunkResults);

            // Small delay between chunks to avoid overwhelming the database
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    async getHeatmapData(
        bounds: {
            minLat: number;
            minLon: number;
            maxLat: number;
            maxLon: number;
        },
        gridSize: number = 20,
        categories?: string[]
    ): Promise<Array<{
        lat: number;
        lon: number;
        intensity: number;
        count: number;
        types: string[];
    }>> {
        const client = await this.pgPool.connect();

        try {
            const query = `
        WITH bounds AS (
          SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) as geom
        ),
        grid AS (
          SELECT 
            ST_SetSRID(
              ST_MakeEnvelope(
                ST_XMin(bounds.geom) + (ST_XMax(bounds.geom) - ST_XMin(bounds.geom)) * (x - 1) / $5,
                ST_YMin(bounds.geom) + (ST_YMax(bounds.geom) - ST_YMin(bounds.geom)) * (y - 1) / $5,
                ST_XMin(bounds.geom) + (ST_XMax(bounds.geom) - ST_XMin(bounds.geom)) * x / $5,
                ST_YMin(bounds.geom) + (ST_YMax(bounds.geom) - ST_YMin(bounds.geom)) * y / $5,
                4326
              ),
              4326
            )::geography as cell
          FROM bounds
          CROSS JOIN generate_series(1, $5) as x
          CROSS JOIN generate_series(1, $5) as y
        ),
        vehicle_counts AS (
          SELECT 
            g.cell,
            COUNT(vl.id) as vehicle_count,
            AVG(vl.battery_level) as avg_battery
          FROM grid g
          LEFT JOIN vehicle_locations vl ON ST_Within(vl.location::geometry, g.cell::geometry)
            AND vl.is_active = TRUE
            ${categories?.includes('vehicle') || !categories ? '' : 'AND 1=0'}
          GROUP BY g.cell
        ),
        service_counts AS (
          SELECT 
            g.cell,
            COUNT(s.id) as service_count,
            AVG(s.rating) as avg_rating
          FROM grid g
          LEFT JOIN services s ON ST_Within(s.location::geometry, g.cell::geometry)
            AND s.is_active = TRUE
            ${categories?.some(cat => ['service', 'dealer', 'mechanic'].includes(cat)) || !categories ? '' : 'AND 1=0'}
          GROUP BY g.cell
        )
        SELECT 
          ST_X(ST_Centroid(vc.cell::geometry)) as lon,
          ST_Y(ST_Centroid(vc.cell::geometry)) as lat,
          COALESCE(vc.vehicle_count, 0) + COALESCE(sc.service_count, 0) as total_count,
          COALESCE(vc.vehicle_count, 0) as vehicle_count,
          COALESCE(sc.service_count, 0) as service_count,
          COALESCE(vc.avg_battery, 0) as avg_battery,
          COALESCE(sc.avg_rating, 0) as avg_rating,
          CASE 
            WHEN COALESCE(vc.vehicle_count, 0) > 0 AND COALESCE(sc.service_count, 0) > 0 THEN 'mixed'
            WHEN COALESCE(vc.vehicle_count, 0) > 0 THEN 'vehicle'
            WHEN COALESCE(sc.service_count, 0) > 0 THEN 'service'
            ELSE 'empty'
          END as cell_type
        FROM vehicle_counts vc
        FULL OUTER JOIN service_counts sc ON vc.cell = sc.cell
        ORDER BY total_count DESC;
      `;

            const result = await client.query(query, [
                bounds.minLon,
                bounds.minLat,
                bounds.maxLon,
                bounds.maxLat,
                gridSize
            ]);

            return result.rows.map(row => {
                // Calculate intensity based on count and other factors
                const intensity = Math.min(1,
                    (row.total_count / 10) * 0.6 + // Count factor
                    (row.avg_battery / 100) * 0.2 + // Battery factor
                    (row.avg_rating / 5) * 0.2 // Rating factor
                );

                return {
                    lat: parseFloat(row.lat),
                    lon: parseFloat(row.lon),
                    intensity,
                    count: row.total_count,
                    types: [row.cell_type]
                };
            });
        } finally {
            client.release();
        }
    }

    async getSearchStats(
        lat: number,
        lon: number,
        radius: number
    ): Promise<{
        totalItems: number;
        byType: Record<string, number>;
        avgDistance: number;
        density: number;
        availabilityScore: number;
        priceRange: { min: number; max: number; avg: number };
    }> {
        const client = await this.pgPool.connect();

        try {
            const point = `ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography`;
            const distanceExpr = `ST_Distance(location, ${point})`;

            const [vehicles, services] = await Promise.all([
                client.query(`
          SELECT 
            COUNT(*) as count,
            AVG(${distanceExpr}) as avg_distance,
            AVG(price) as avg_price,
            MIN(price) as min_price,
            MAX(price) as max_price,
            AVG(battery_level) as avg_battery
          FROM vehicle_locations vl
          JOIN vehicles v ON vl.vehicle_id = v.id
          WHERE vl.is_active = TRUE
            AND ${distanceExpr} <= $3
        `, [lat, lon, radius]),

                client.query(`
          SELECT 
            COUNT(*) as count,
            AVG(${distanceExpr}) as avg_distance,
            AVG((price_range->>'min')::numeric) as avg_min_price,
            AVG((price_range->>'max')::numeric) as avg_max_price,
            AVG(rating) as avg_rating
          FROM services
          WHERE is_active = TRUE
            AND ${distanceExpr} <= $3
        `, [lat, lon, radius])
            ]);

            const vehicleStats = vehicles.rows[0];
            const serviceStats = services.rows[0];

            const totalItems = (parseInt(vehicleStats?.count || '0') + parseInt(serviceStats?.count || '0'));

            // Calculate area in square km
            const areaKm2 = Math.PI * Math.pow(radius / 1000, 2);
            const density = totalItems / Math.max(areaKm2, 0.01);

            // Calculate availability score (0-1)
            const availabilityScore = Math.min(1,
                (parseInt(vehicleStats?.count || '0') / 20) * 0.7 + // Vehicle availability
                (parseInt(serviceStats?.count || '0') / 10) * 0.3   // Service availability
            );

            return {
                totalItems,
                byType: {
                    vehicles: parseInt(vehicleStats?.count || '0'),
                    services: parseInt(serviceStats?.count || '0')
                },
                avgDistance: parseFloat(vehicleStats?.avg_distance || '0'),
                density,
                availabilityScore,
                priceRange: {
                    min: parseFloat(vehicleStats?.min_price || '0'),
                    max: parseFloat(vehicleStats?.max_price || '0'),
                    avg: parseFloat(vehicleStats?.avg_price || '0')
                }
            };
        } finally {
            client.release();
        }
    }

    async clearCache(prefix: string = 'radius_search:'): Promise<number> {
        try {
            const keys = await this.redis.keys(`${prefix}*`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            return keys.length;
        } catch (error) {
            logger.error('Failed to clear radius search cache:', error);
            return 0;
        }
    }
}
