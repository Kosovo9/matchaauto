import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { metrics } from '../utils/metrics';

export const DistanceMatrixRequestSchema = z.object({
    origins: z.array(
        z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180),
            id: z.string().optional()
        })
    ).min(1).max(100),
    destinations: z.array(
        z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180),
            id: z.string().optional()
        })
    ).min(1).max(100),
    mode: z.enum(['driving', 'walking', 'cycling', 'transit']).default('driving'),
    units: z.enum(['metric', 'imperial']).default('metric'),
    optimize: z.boolean().default(true),
    trafficModel: z.enum(['best_guess', 'pessimistic', 'optimistic']).default('best_guess'),
    departureTime: z.date().optional(),
    arrivalTime: z.date().optional(),
    avoid: z.array(z.enum(['tolls', 'highways', 'ferries'])).default([]),
    restrictions: z.record(z.string(), z.any()).optional()
});

export const DistanceMatrixElementSchema = z.object({
    originIndex: z.number(),
    destinationIndex: z.number(),
    distance: z.object({
        value: z.number(),
        text: z.string()
    }),
    duration: z.object({
        value: z.number(), // seconds
        text: z.string()
    }),
    durationInTraffic: z.object({
        value: z.number(),
        text: z.string()
    }).optional(),
    status: z.enum(['OK', 'NOT_FOUND', 'ZERO_RESULTS', 'MAX_ROUTE_LENGTH_EXCEEDED']),
    fare: z.object({
        currency: z.string(),
        value: z.number(),
        text: z.string()
    }).optional(),
    polyline: z.string().optional()
});

export const DistanceMatrixResponseSchema = z.object({
    matrix: z.array(DistanceMatrixElementSchema),
    originAddresses: z.array(z.string()).optional(),
    destinationAddresses: z.array(z.string()).optional(),
    totalDistance: z.number(),
    totalDuration: z.number(),
    cacheHit: z.boolean(),
    cacheKey: z.string().optional(),
    executionTimeMs: z.number(),
    optimizationSavings: z.object({
        distance: z.number(),
        duration: z.number(),
        percentage: z.number()
    }).optional()
});

export type DistanceMatrixRequest = z.infer<typeof DistanceMatrixRequestSchema>;
export type DistanceMatrixResponse = z.infer<typeof DistanceMatrixResponseSchema>;
export type DistanceMatrixElement = z.infer<typeof DistanceMatrixElementSchema>;

interface DistanceProvider {
    name: string;
    priority: number;
    calculateMatrix(origins: any[], destinations: any[], options: any): Promise<any[]>;
    getCost(): number;
    getLimits(): { maxOrigins: number; maxDestinations: number };
}

export class DistanceMatrixService {
    private redis: Redis;
    private pgPool: Pool;
    private providers: DistanceProvider[] = [];
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 3600; // 1 hour for distance matrix

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;

        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            timeout: 15000
        });

        this.initializeProviders();
    }

    private initializeProviders(): void {
        // 1. PostGIS-based provider (fast for straight-line distance)
        this.providers.push({
            name: 'postgis',
            priority: 0,
            calculateMatrix: async (origins, destinations, options) => {
                const client = await this.pgPool.connect();

                try {
                    // Create temporary tables for origins and destinations
                    await client.query(`
            CREATE TEMP TABLE temp_origins (
              id SERIAL PRIMARY KEY,
              lat DOUBLE PRECISION,
              lon DOUBLE PRECISION,
              geom GEOGRAPHY(Point, 4326)
            ) ON COMMIT DROP;
          `);

                    await client.query(`
            CREATE TEMP TABLE temp_destinations (
              id SERIAL PRIMARY KEY,
              lat DOUBLE PRECISION,
              lon DOUBLE PRECISION,
              geom GEOGRAPHY(Point, 4326)
            ) ON COMMIT DROP;
          `);

                    // Insert origins
                    const originValues = origins.map(o => `(${o.latitude}, ${o.longitude}, ST_SetSRID(ST_MakePoint(${o.longitude}, ${o.latitude}), 4326))`).join(',');
                    await client.query(`INSERT INTO temp_origins (lat, lon, geom) VALUES ${originValues};`);

                    // Insert destinations
                    const destValues = destinations.map(d => `(${d.latitude}, ${d.longitude}, ST_SetSRID(ST_MakePoint(${d.longitude}, ${d.latitude}), 4326))`).join(',');
                    await client.query(`INSERT INTO temp_destinations (lat, lon, geom) VALUES ${destValues};`);

                    // Calculate distance matrix
                    const query = `
            SELECT 
              o.id as origin_id,
              d.id as destination_id,
              ST_Distance(o.geom, d.geom) as distance_meters,
              CASE 
                WHEN $1 = 'driving' THEN ST_Distance(o.geom, d.geom) * 1.3
                WHEN $1 = 'walking' THEN ST_Distance(o.geom, d.geom) * 0.8
                WHEN $1 = 'cycling' THEN ST_Distance(o.geom, d.geom) * 1.1
                ELSE ST_Distance(o.geom, d.geom)
              END as adjusted_distance,
              CASE 
                WHEN $1 = 'driving' THEN ST_Distance(o.geom, d.geom) / 16.6667
                WHEN $1 = 'walking' THEN ST_Distance(o.geom, d.geom) / 1.3889
                WHEN $1 = 'cycling' THEN ST_Distance(o.geom, d.geom) / 4.1667
                ELSE ST_Distance(o.geom, d.geom) / 8.3333
              END as duration_seconds
            FROM temp_origins o
            CROSS JOIN temp_destinations d
            WHERE ST_DWithin(o.geom, d.geom, 500000)
            ORDER BY o.id, d.id;
          `;
                    const result = await client.query(query, [options.mode]);

                    return result.rows.map(row => ({
                        originIndex: row.origin_id - 1,
                        destinationIndex: row.destination_id - 1,
                        distance: {
                            value: row.distance_meters,
                            text: this.formatDistance(row.distance_meters, options.units)
                        },
                        duration: {
                            value: row.duration_seconds,
                            text: this.formatDuration(row.duration_seconds)
                        },
                        status: 'OK'
                    }));
                } finally {
                    client.release();
                }
            },
            getCost: () => 0,
            getLimits: () => ({ maxOrigins: 1000, maxDestinations: 1000 })
        });

        // 2. Google Distance Matrix API (requires API key)
        if (process.env.GOOGLE_MAPS_API_KEY) {
            this.providers.push({
                name: 'google',
                priority: 1,
                calculateMatrix: async (origins, destinations, options) => {
                    const response = await fetch(
                        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                        `origins=${origins.map(o => `${o.latitude},${o.longitude}`).join('|')}` +
                        `&destinations=${destinations.map(d => `${d.latitude},${d.longitude}`).join('|')}` +
                        `&mode=${options.mode}` +
                        `&units=${options.units}` +
                        `&departure_time=${options.departureTime ? Math.floor(options.departureTime.getTime() / 1000) : 'now'}` +
                        `&traffic_model=${options.trafficModel}` +
                        `&avoid=${options.avoid.join('|')}` +
                        `&key=${process.env.GOOGLE_MAPS_API_KEY}`
                    );
                    const data: any = await response.json();
                    if (data.status !== 'OK') {
                        throw new Error(`Google Distance Matrix failed: ${data.status}`);
                    }
                    return data.rows.flatMap((row: any, originIndex: number) =>
                        row.elements.map((element: any, destinationIndex: number) => ({
                            originIndex,
                            destinationIndex,
                            distance: {
                                value: element.distance?.value || 0,
                                text: element.distance?.text || '0 km'
                            },
                            duration: {
                                value: element.duration?.value || 0,
                                text: element.duration?.text || '0 mins'
                            },
                            durationInTraffic: element.duration_in_traffic ? {
                                value: element.duration_in_traffic.value,
                                text: element.duration_in_traffic.text
                            } : undefined,
                            status: element.status,
                            fare: element.fare,
                            polyline: undefined
                        }))
                    );
                },
                getCost: () => 0.005,
                getLimits: () => ({ maxOrigins: 25, maxDestinations: 25 })
            });
        }

        // 3. OSRM provider (open source routing)
        if (process.env.OSRM_URL) {
            this.providers.push({
                name: 'osrm',
                priority: 2,
                calculateMatrix: async (origins, destinations, options) => {
                    const coordinates = [
                        ...origins.map(o => [o.longitude, o.latitude]),
                        ...destinations.map(d => [d.longitude, d.latitude])
                    ];
                    const response = await fetch(
                        `${process.env.OSRM_URL}/table/v1/${options.mode}/` +
                        `${coordinates.map(c => c.join(',')).join(';')}` +
                        `?sources=${origins.map((_, i) => i).join(';')}` +
                        `&destinations=${destinations.map((_, i) => origins.length + i).join(';')}` +
                        `&annotations=distance,duration`
                    );
                    const data: any = await response.json();
                    if (data.code !== 'Ok') {
                        throw new Error(`OSRM failed: ${data.message}`);
                    }
                    return data.durations.flatMap((row: number[], originIndex: number) =>
                        row.map((duration, destinationIndex) => ({
                            originIndex,
                            destinationIndex,
                            distance: {
                                value: data.distances[originIndex][destinationIndex],
                                text: this.formatDistance(data.distances[originIndex][destinationIndex], options.units)
                            },
                            duration: {
                                value: duration,
                                text: this.formatDuration(duration)
                            },
                            status: 'OK'
                        }))
                    );
                },
                getCost: () => 0,
                getLimits: () => ({ maxOrigins: 100, maxDestinations: 100 })
            });
        }

        // Sort providers by priority
        this.providers.sort((a, b) => a.priority - b.priority);
    }

    private formatDistance(meters: number, units: 'metric' | 'imperial'): string {
        if (units === 'imperial') {
            const miles = meters * 0.000621371;
            return miles >= 0.1 ? `${miles.toFixed(1)} mi` : `${Math.round(miles * 5280)} ft`;
        }
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${Math.round(meters)} m`;
    }

    private formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    private getCacheKey(request: DistanceMatrixRequest): string {
        const keyData = {
            origins: request.origins.map(o => [o.latitude.toFixed(6), o.longitude.toFixed(6)]),
            destinations: request.destinations.map(d => [d.latitude.toFixed(6), d.longitude.toFixed(6)]),
            mode: request.mode,
            units: request.units,
            trafficModel: request.trafficModel,
            avoid: request.avoid.sort(),
            departureTime: request.departureTime?.toISOString()
        };
        return `distance_matrix:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
    }

    async calculateMatrix(request: DistanceMatrixRequest): Promise<DistanceMatrixResponse> {
        const startTime = Date.now();
        metrics.increment('distance_matrix.requests_total');
        try {
            const validated = DistanceMatrixRequestSchema.parse(request);
            const cacheKey = this.getCacheKey(validated);
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                const cachedResp: DistanceMatrixResponse = JSON.parse(cached);
                logger.debug('Cache hit for distance matrix', { cacheKey: cacheKey.substring(0, 30) });
                metrics.increment('distance_matrix.cache_hits_total');
                return { ...cachedResp, executionTimeMs: Date.now() - startTime, cacheHit: true };
            }
            metrics.increment('distance_matrix.cache_misses_total');

            // Choose provider based on limits
            let provider = this.providers[0];
            for (const p of this.providers) {
                const limits = p.getLimits();
                if (validated.origins.length <= limits.maxOrigins && validated.destinations.length <= limits.maxDestinations) {
                    provider = p;
                    break;
                }
            }

            const matrix = await this.circuitBreaker.execute(() => provider.calculateMatrix(
                validated.origins,
                validated.destinations,
                {
                    mode: validated.mode,
                    units: validated.units,
                    trafficModel: validated.trafficModel,
                    departureTime: validated.departureTime,
                    avoid: validated.avoid
                }
            ));

            const totalDistance = matrix.reduce((sum, el) => sum + el.distance.value, 0);
            const totalDuration = matrix.reduce((sum, el) => sum + el.duration.value, 0);

            let optimizationSavings;
            if (validated.optimize) {
                // Simple optimization: sort destinations by average distance
                const destScores = validated.destinations.map((_, idx) => {
                    const distances = matrix.filter(m => m.destinationIndex === idx).map(m => m.distance.value);
                    const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
                    return { idx, avg };
                });
                destScores.sort((a, b) => a.avg - b.avg);
                const optimized = matrix.map(el => ({
                    ...el,
                    destinationIndex: destScores.findIndex(d => d.idx === el.destinationIndex)
                }));
                const optDist = optimized.reduce((s, e) => s + e.distance.value, 0);
                const savings = totalDistance - optDist;
                optimizationSavings = {
                    distance: savings,
                    duration: (savings / 1000) * 3600, // rough estimate
                    percentage: (savings / totalDistance) * 100
                };
                matrix.splice(0, matrix.length, ...optimized);
            }

            const response: DistanceMatrixResponse = {
                matrix,
                totalDistance,
                totalDuration,
                cacheHit: false,
                cacheKey,
                executionTimeMs: Date.now() - startTime,
                optimizationSavings
            };

            await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(response));
            logger.info('Distance matrix calculated', {
                provider: provider.name,
                origins: validated.origins.length,
                destinations: validated.destinations.length,
                elements: matrix.length,
                executionTime: response.executionTimeMs
            });
            metrics.timing('distance_matrix.execution_time_ms', response.executionTimeMs);
            return response;
        } catch (err: any) {
            metrics.increment('distance_matrix.errors_total');
            logger.error('Distance matrix calculation error', { error: err.message, stack: err.stack });
            throw err;
        }
    }

    async clearCache(prefix: string = 'distance_matrix:'): Promise<number> {
        try {
            const keys = await this.redis.keys(`${prefix}*`);
            if (keys.length) await this.redis.del(...keys);
            return keys.length;
        } catch (e) {
            logger.error('Failed to clear distance matrix cache', { error: e });
            return 0;
        }
    }
}
