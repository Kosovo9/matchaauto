import { z } from 'zod';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';

export const GeofenceSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    geometry: z.object({
        type: z.literal('Polygon'),
        coordinates: z.array(z.array(z.tuple([z.number(), z.number()])))
    }),
    center: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),
    radius: z.number().min(10).max(50000),
    isActive: z.boolean().default(true),
    rules: z.object({
        notifyOnEntry: z.boolean().default(true),
        notifyOnExit: z.boolean().default(true),
        autoMatch: z.boolean().default(false),
        restrictions: z.array(z.string()).optional(),
        speedLimit: z.number().min(0).optional(),
        operatingHours: z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
            days: z.array(z.number().min(0).max(6)).optional()
        }).optional(),
        actions: z.array(z.enum([
            'send_notification',
            'trigger_webhook',
            'update_status',
            'start_tracking',
            'stop_tracking',
            'apply_discount',
            'restrict_access'
        ])).default(['send_notification'])
    }).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().optional(),
    expiresAt: z.date().optional()
});

export const GeofenceEventSchema = z.object({
    id: z.string().uuid(),
    geofenceId: z.string().uuid(),
    userId: z.string().uuid(),
    entityId: z.string().uuid(),
    entityType: z.enum(['user', 'vehicle', 'asset']),
    eventType: z.enum(['entry', 'exit', 'inside', 'nearby', 'violation']),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    }),
    previousLocation: z.object({
        latitude: z.number(),
        longitude: z.number()
    }).optional(),
    distance: z.number().optional(),
    speed: z.number().optional(),
    heading: z.number().optional(),
    accuracy: z.number().optional(),
    triggeredRules: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
    timestamp: z.date().default(() => new Date())
});

export const GeofenceCheckRequestSchema = z.object({
    userId: z.string().uuid(),
    entityId: z.string().uuid(),
    entityType: z.enum(['user', 'vehicle', 'asset']),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),
    previousLocation: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional(),
    accuracy: z.number().min(0).max(100).optional(),
    speed: z.number().min(0).optional(),
    heading: z.number().min(0).max(360).optional(),
    timestamp: z.date().optional(),
    checkTypes: z.array(z.enum(['entry', 'exit', 'inside', 'violation'])).default(['entry', 'exit'])
});

export const GeofenceCheckResponseSchema = z.object({
    events: z.array(GeofenceEventSchema),
    activeGeofences: z.array(z.string().uuid()),
    triggeredActions: z.array(z.string()),
    executionTimeMs: z.number(),
    cacheHit: z.boolean().default(false)
});

export type Geofence = z.infer<typeof GeofenceSchema>;
export type GeofenceEvent = z.infer<typeof GeofenceEventSchema>;
export type GeofenceCheckRequest = z.infer<typeof GeofenceCheckRequestSchema>;
export type GeofenceCheckResponse = z.infer<typeof GeofenceCheckResponseSchema>;

export class GeoFencingService {
    private redis: Redis;
    private pgPool: Pool;
    private circuitBreaker: CircuitBreaker;
    private geofenceCache = new Map<string, Geofence>();
    private readonly CACHE_TTL = 300; // 5 minutes

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 30000,
            timeout: 10000
        });
    }

    async createGeofence(data: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Geofence> {
        const startTime = Date.now();
        metrics.increment('geofence.creations_total');

        try {
            // Validate input
            const validatedData = GeofenceSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);

            // Generate ID
            const id = randomUUID();
            const geofence: Geofence = {
                ...validatedData,
                id,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save to database
            await this.saveGeofenceToDatabase(geofence);

            // Cache geofence
            await this.cacheGeofence(geofence);

            // Update spatial index
            await this.updateSpatialIndex(geofence);

            logger.info('Geofence created', {
                id: geofence.id,
                name: geofence.name,
                radius: geofence.radius
            });

            metrics.timing('geofence.creation_time_ms', Date.now() - startTime);
            return geofence;

        } catch (error: any) {
            metrics.increment('geofence.creation_errors_total');
            logger.error('Geofence creation failed', {
                error: error.message,
                data
            });
            throw new Error(`Geofence creation failed: ${error.message}`);
        }
    }

    async updateGeofence(id: string, updates: Partial<Geofence>): Promise<Geofence> {
        const startTime = Date.now();

        try {
            // Get existing geofence
            const existing = await this.getGeofence(id);
            if (!existing) {
                throw new Error(`Geofence ${id} not found`);
            }

            // Merge updates
            const updatedGeofence: Geofence = {
                ...existing,
                ...updates,
                updatedAt: new Date()
            };

            // Validate
            const validated = GeofenceSchema.parse(updatedGeofence);

            // Update database
            await this.updateGeofenceInDatabase(validated);

            // Update cache
            await this.cacheGeofence(validated);

            // Update spatial index
            await this.updateSpatialIndex(validated);

            logger.info('Geofence updated', { id, updates: Object.keys(updates) });
            metrics.timing('geofence.update_time_ms', Date.now() - startTime);

            return validated;

        } catch (error: any) {
            metrics.increment('geofence.update_errors_total');
            logger.error('Geofence update failed', { id, error: error.message });
            throw error;
        }
    }

    async deleteGeofence(id: string): Promise<void> {
        try {
            // Mark as inactive in database
            await this.pgPool.query(
                'UPDATE geofences SET is_active = false, updated_at = NOW() WHERE id = $1',
                [id]
            );

            // Remove from cache
            await this.redis.del(`geofence:${id}`);
            this.geofenceCache.delete(id);

            // Remove from spatial index
            await this.redis.zrem('geofence:spatial:index', id);

            logger.info('Geofence deleted', { id });
            metrics.increment('geofence.deletions_total');

        } catch (error: any) {
            metrics.increment('geofence.deletion_errors_total');
            logger.error('Geofence deletion failed', { id, error: error.message });
            throw error;
        }
    }

    async getGeofence(id: string): Promise<Geofence | null> {
        const startTime = Date.now();

        try {
            // Check memory cache first
            const memoryCached = this.geofenceCache.get(id);
            if (memoryCached) {
                metrics.increment('geofence.cache_hits_memory');
                return memoryCached;
            }

            // Check Redis cache
            const redisCached = await this.redis.get(`geofence:${id}`);
            if (redisCached) {
                const geofence = GeofenceSchema.parse(JSON.parse(redisCached));
                this.geofenceCache.set(id, geofence);
                metrics.increment('geofence.cache_hits_redis');
                return geofence;
            }

            // Fetch from database
            const geofence = await this.getGeofenceFromDatabase(id);
            if (geofence) {
                // Cache in both layers
                await this.cacheGeofence(geofence);
            }

            metrics.timing('geofence.fetch_time_ms', Date.now() - startTime);
            return geofence;

        } catch (error: any) {
            metrics.increment('geofence.fetch_errors_total');
            logger.error('Geofence fetch failed', { id, error: error.message });
            return null;
        }
    }

    async checkLocation(request: GeofenceCheckRequest): Promise<GeofenceCheckResponse> {
        const startTime = Date.now();
        metrics.increment('geofence.checks_total');

        try {
            const validatedRequest = GeofenceCheckRequestSchema.parse(request);

            // Get relevant geofences for this location
            const relevantGeofences = await this.getRelevantGeofences(
                validatedRequest.location.latitude,
                validatedRequest.location.longitude,
                validatedRequest.accuracy || 50
            );

            if (relevantGeofences.length === 0) {
                return {
                    events: [],
                    activeGeofences: [],
                    triggeredActions: [],
                    executionTimeMs: Date.now() - startTime,
                    cacheHit: false
                };
            }

            // Check each geofence for events
            const events: GeofenceEvent[] = [];
            const triggeredActions: string[] = [];
            const activeGeofenceIds: string[] = [];

            for (const geofence of relevantGeofences) {
                const geofenceEvents = await this.checkGeofence(
                    geofence,
                    validatedRequest
                );

                events.push(...geofenceEvents.events);
                triggeredActions.push(...geofenceEvents.triggeredActions);

                if (geofenceEvents.isInside) {
                    activeGeofenceIds.push(geofence.id);
                }
            }

            // Log events to database
            if (events.length > 0) {
                await this.logGeofenceEvents(events);
            }

            // Trigger actions asynchronously
            if (triggeredActions.length > 0) {
                this.triggerActions(triggeredActions, events).catch(error => {
                    logger.error('Failed to trigger geofence actions', { error: error.message });
                });
            }

            const response: GeofenceCheckResponse = {
                events,
                activeGeofences: activeGeofenceIds,
                triggeredActions,
                executionTimeMs: Date.now() - startTime,
                cacheHit: false
            };

            logger.debug('Geofence check completed', {
                userId: validatedRequest.userId,
                entityId: validatedRequest.entityId,
                events: events.length,
                geofences: relevantGeofences.length,
                time: response.executionTimeMs
            });

            metrics.timing('geofence.check_time_ms', response.executionTimeMs);
            metrics.gauge('geofence.events_detected', events.length);

            return response;

        } catch (error: any) {
            metrics.increment('geofence.check_errors_total');
            logger.error('Geofence check failed', {
                error: error.message,
                request
            });
            throw new Error(`Geofence check failed: ${error.message}`);
        }
    }

    async batchCheckLocations(requests: GeofenceCheckRequest[]): Promise<GeofenceCheckResponse[]> {
        const batchSize = 50;
        const results: GeofenceCheckResponse[] = [];

        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchPromises = batch.map(request =>
                this.checkLocation(request).catch(error => {
                    logger.error('Batch geofence check failed', {
                        entityId: request.entityId,
                        error: error.message
                    });

                    return {
                        events: [],
                        activeGeofences: [],
                        triggeredActions: [],
                        executionTimeMs: 0,
                        cacheHit: false,
                        error: error.message
                    } as any;
                })
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Rate limiting
            if (i + batchSize < requests.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    async getGeofencesByBounds(
        bounds: {
            minLat: number;
            minLng: number;
            maxLat: number;
            maxLng: number;
        },
        filters?: {
            isActive?: boolean;
            minRadius?: number;
            maxRadius?: number;
            types?: string[];
        }
    ): Promise<Geofence[]> {
        const client = await this.pgPool.connect();

        try {
            let query = `
        SELECT 
          id, name, description, 
          ST_AsGeoJSON(geometry) as geometry,
          ST_AsGeoJSON(center) as center,
          radius, is_active, rules, metadata,
          created_at, updated_at, expires_at
        FROM geofences
        WHERE ST_Intersects(
          geometry,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
      `;

            const params: any[] = [bounds.minLng, bounds.minLat, bounds.maxLng, bounds.maxLat];
            let paramIndex = 5;

            if (filters?.isActive !== undefined) {
                query += ` AND is_active = $${paramIndex}`;
                params.push(filters.isActive);
                paramIndex++;
            }

            if (filters?.minRadius !== undefined) {
                query += ` AND radius >= $${paramIndex}`;
                params.push(filters.minRadius);
                paramIndex++;
            }

            if (filters?.maxRadius !== undefined) {
                query += ` AND radius <= $${paramIndex}`;
                params.push(filters.maxRadius);
                paramIndex++;
            }

            if (filters?.types && filters.types.length > 0) {
                query += ` AND metadata->>'type' IN (${filters.types.map((_, i) => `$${paramIndex + i}`).join(',')})`;
                params.push(...filters.types);
                paramIndex += filters.types.length;
            }

            query += ' ORDER BY radius DESC LIMIT 100';

            const result = await client.query(query, params);

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                geometry: JSON.parse(row.geometry),
                center: {
                    latitude: JSON.parse(row.center).coordinates[1],
                    longitude: JSON.parse(row.center).coordinates[0]
                },
                radius: row.radius,
                isActive: row.is_active,
                rules: row.rules,
                metadata: row.metadata,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                expiresAt: row.expires_at
            }));

        } finally {
            client.release();
        }
    }

    async getGeofenceStats(): Promise<{
        total: number;
        active: number;
        byType: Record<string, number>;
        events24h: number;
        avgRadius: number;
    }> {
        const client = await this.pgPool.connect();

        try {
            const [geofenceStats, eventStats] = await Promise.all([
                client.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN is_active THEN 1 END) as active,
            AVG(radius) as avg_radius,
            COALESCE(metadata->>'type', 'unknown') as type,
            COUNT(*) as type_count
          FROM geofences
          GROUP BY COALESCE(metadata->>'type', 'unknown')
        `),

                client.query(`
          SELECT COUNT(*) as events_count
          FROM geofence_events
          WHERE timestamp > NOW() - INTERVAL '24 hours'
        `)
            ]);

            const byType: Record<string, number> = {};
            geofenceStats.rows.forEach(row => {
                byType[row.type] = parseInt(row.type_count);
            });

            return {
                total: parseInt(geofenceStats.rows[0]?.total || '0'),
                active: parseInt(geofenceStats.rows[0]?.active || '0'),
                byType,
                events24h: parseInt(eventStats.rows[0]?.events_count || '0'),
                avgRadius: parseFloat(geofenceStats.rows[0]?.avg_radius || '0')
            };

        } finally {
            client.release();
        }
    }

    async clearExpiredGeofences(): Promise<number> {
        const client = await this.pgPool.connect();

        try {
            const result = await client.query(`
        DELETE FROM geofences 
        WHERE expires_at IS NOT NULL 
          AND expires_at < NOW()
        RETURNING COUNT(*) as deleted_count
      `);

            const deletedCount = parseInt(result.rows[0]?.deleted_count || '0');

            if (deletedCount > 0) {
                logger.info('Expired geofences cleared', { count: deletedCount });

                // Clear cache for deleted geofences
                const keys = await this.redis.keys('geofence:*');
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
                this.geofenceCache.clear();
            }

            return deletedCount;

        } finally {
            client.release();
        }
    }

    private async saveGeofenceToDatabase(geofence: Geofence): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            const geometry = JSON.stringify(geofence.geometry);
            const center = `POINT(${geofence.center.longitude} ${geofence.center.latitude})`;

            await client.query(`
        INSERT INTO geofences (
          id, name, description, geometry, center, radius,
          is_active, rules, metadata, created_at, updated_at, expires_at
        ) VALUES ($1, $2, $3, 
          ST_GeomFromGeoJSON($4), 
          ST_GeomFromText($5, 4326),
          $6, $7, $8, $9, $10, $11, $12
        )
      `, [
                geofence.id,
                geofence.name,
                geofence.description,
                geometry,
                center,
                geofence.radius,
                geofence.isActive,
                geofence.rules,
                geofence.metadata,
                geofence.createdAt,
                geofence.updatedAt,
                geofence.expiresAt
            ]);

        } finally {
            client.release();
        }
    }

    private async updateGeofenceInDatabase(geofence: Geofence): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            const geometry = JSON.stringify(geofence.geometry);
            const center = `POINT(${geofence.center.longitude} ${geofence.center.latitude})`;

            await client.query(`
        UPDATE geofences SET
          name = $2,
          description = $3,
          geometry = ST_GeomFromGeoJSON($4),
          center = ST_GeomFromText($5, 4326),
          radius = $6,
          is_active = $7,
          rules = $8,
          metadata = $9,
          updated_at = $10,
          expires_at = $11
        WHERE id = $1
      `, [
                geofence.id,
                geofence.name,
                geofence.description,
                geometry,
                center,
                geofence.radius,
                geofence.isActive,
                geofence.rules,
                geofence.metadata,
                geofence.updatedAt,
                geofence.expiresAt
            ]);

        } finally {
            client.release();
        }
    }

    private async getGeofenceFromDatabase(id: string): Promise<Geofence | null> {
        const client = await this.pgPool.connect();

        try {
            const result = await client.query(`
        SELECT 
          id, name, description, 
          ST_AsGeoJSON(geometry) as geometry,
          ST_AsGeoJSON(center) as center,
          radius, is_active, rules, metadata,
          created_at, updated_at, expires_at
        FROM geofences
        WHERE id = $1
      `, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            const geometry = JSON.parse(row.geometry);
            const center = JSON.parse(row.center);

            return {
                id: row.id,
                name: row.name,
                description: row.description,
                geometry,
                center: {
                    latitude: center.coordinates[1],
                    longitude: center.coordinates[0]
                },
                radius: row.radius,
                isActive: row.is_active,
                rules: row.rules,
                metadata: row.metadata,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                expiresAt: row.expires_at
            };

        } finally {
            client.release();
        }
    }

    private async cacheGeofence(geofence: Geofence): Promise<void> {
        try {
            // Cache in memory (LRU-like behavior)
            this.geofenceCache.set(geofence.id, geofence);

            // Keep memory cache size manageable
            if (this.geofenceCache.size > 1000) {
                const firstKey = this.geofenceCache.keys().next().value;
                this.geofenceCache.delete(firstKey);
            }

            // Cache in Redis
            await this.redis.setex(
                `geofence:${geofence.id}`,
                this.CACHE_TTL,
                JSON.stringify(geofence)
            );

        } catch (error) {
            logger.warn('Failed to cache geofence', { id: geofence.id, error });
        }
    }

    private async updateSpatialIndex(geofence: Geofence): Promise<void> {
        try {
            // Use geohash for spatial indexing
            const geohash = this.calculateGeohash(
                geofence.center.latitude,
                geofence.center.longitude,
                6
            );

            await this.redis.zadd(
                `geofence:spatial:${geohash}`,
                Date.now(),
                geofence.id
            );

            // Also store in a global index sorted by timestamp
            await this.redis.zadd(
                'geofence:spatial:index',
                Date.now(),
                geofence.id
            );

        } catch (error) {
            logger.warn('Failed to update spatial index', { id: geofence.id, error });
        }
    }

    private async getRelevantGeofences(
        lat: number,
        lng: number,
        accuracy: number
    ): Promise<Geofence[]> {
        const searchRadius = accuracy + 1000; // Add buffer

        // Get geohashes at different precisions for the search point
        const geohashes = [
            this.calculateGeohash(lat, lng, 4), // ~20km
            this.calculateGeohash(lat, lng, 5), // ~5km
            this.calculateGeohash(lat, lng, 6), // ~1km
        ];

        // Get geofence IDs from spatial indexes
        const geofenceIds = new Set<string>();

        for (const geohash of geohashes) {
            const ids = await this.redis.zrange(`geofence:spatial:${geohash}`, 0, -1);
            ids.forEach(id => geofenceIds.add(id));
        }

        // Also check recent geofences
        const recentIds = await this.redis.zrange(
            'geofence:spatial:index',
            -100,
            -1
        );
        recentIds.forEach(id => geofenceIds.add(id));

        // Fetch geofence data
        const geofences: Geofence[] = [];

        for (const id of Array.from(geofenceIds).slice(0, 50)) { // Limit to 50
            const geofence = await this.getGeofence(id);
            if (geofence && geofence.isActive) {
                // Quick distance check using center point
                const distance = this.calculateHaversineDistance(
                    lat, lng,
                    geofence.center.latitude,
                    geofence.center.longitude
                );

                if (distance <= searchRadius + geofence.radius) {
                    geofences.push(geofence);
                }
            }
        }

        return geofences;
    }

    private async checkGeofence(
        geofence: Geofence,
        request: GeofenceCheckRequest
    ): Promise<{
        events: GeofenceEvent[];
        triggeredActions: string[];
        isInside: boolean;
    }> {
        const events: GeofenceEvent[] = [];
        const triggeredActions: string[] = [];

        // Check if location is inside geofence
        const isInside = await this.isPointInPolygon(
            request.location.latitude,
            request.location.longitude,
            geofence.geometry
        );

        // Check if previous location exists
        let wasInside = false;
        if (request.previousLocation) {
            wasInside = await this.isPointInPolygon(
                request.previousLocation.latitude,
                request.previousLocation.longitude,
                geofence.geometry
            );
        }

        // Check for entry event
        if (!wasInside && isInside && request.checkTypes.includes('entry')) {
            const event = await this.createGeofenceEvent(
                geofence.id,
                request,
                'entry'
            );
            events.push(event);

            if (geofence.rules?.notifyOnEntry) {
                triggeredActions.push('send_notification:entry');
            }

            if (geofence.rules?.actions) {
                triggeredActions.push(...geofence.rules.actions);
            }
        }

        // Check for exit event
        if (wasInside && !isInside && request.checkTypes.includes('exit')) {
            const event = await this.createGeofenceEvent(
                geofence.id,
                request,
                'exit'
            );
            events.push(event);

            if (geofence.rules?.notifyOnExit) {
                triggeredActions.push('send_notification:exit');
            }
        }

        // Check for speed violations
        if (geofence.rules?.speedLimit && request.speed && request.speed > geofence.rules.speedLimit) {
            const event = await this.createGeofenceEvent(
                geofence.id,
                request,
                'violation'
            );
            events.push(event);
            triggeredActions.push('send_notification:speed_violation');
        }

        // Check operating hours
        if (geofence.rules?.operatingHours && isInside) {
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            const currentTime = `${currentHour}:${currentMinute}`;
            const currentDay = now.getDay();

            const { start, end, days } = geofence.rules.operatingHours;

            if ((!days || days.includes(currentDay)) &&
                (currentTime < start || currentTime > end)) {
                const event = await this.createGeofenceEvent(
                    geofence.id,
                    request,
                    'violation'
                );
                events.push(event);
                triggeredActions.push('restrict_access');
            }
        }

        return { events, triggeredActions, isInside };
    }

    private async isPointInPolygon(
        lat: number,
        lng: number,
        polygon: Geofence['geometry']
    ): Promise<boolean> {
        // Use PostGIS for accurate polygon containment check
        const client = await this.pgPool.connect();

        try {
            const point = `POINT(${lng} ${lat})`;
            const polygonWKT = this.geometryToWKT(polygon);

            const result = await client.query(`
        SELECT ST_Contains(
          ST_GeomFromText($1, 4326),
          ST_GeomFromText($2, 4326)
        ) as contains
      `, [polygonWKT, point]);

            return result.rows[0].contains;

        } finally {
            client.release();
        }
    }

    private geometryToWKT(geometry: Geofence['geometry']): string {
        const coordinates = geometry.coordinates[0];
        const points = coordinates.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
        return `POLYGON((${points}))`;
    }

    private async createGeofenceEvent(
        geofenceId: string,
        request: GeofenceCheckRequest,
        eventType: GeofenceEvent['eventType']
    ): Promise<GeofenceEvent> {
        const distance = request.previousLocation ?
            this.calculateHaversineDistance(
                request.location.latitude,
                request.location.longitude,
                request.previousLocation.latitude,
                request.previousLocation.longitude
            ) : undefined;

        return {
            id: randomUUID(),
            geofenceId,
            userId: request.userId,
            entityId: request.entityId,
            entityType: request.entityType,
            eventType,
            location: request.location,
            previousLocation: request.previousLocation,
            distance,
            speed: request.speed,
            heading: request.heading,
            accuracy: request.accuracy,
            timestamp: new Date()
        };
    }

    private async logGeofenceEvents(events: GeofenceEvent[]): Promise<void> {
        if (events.length === 0) return;

        const client = await this.pgPool.connect();

        try {
            // Batch insert events
            const values = events.map((event, index) => {
                const base = index * 13;
                return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, 
                ST_GeomFromText($${base + 6}, 4326), $${base + 7}, $${base + 8}, $${base + 9}, 
                $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13})`;
            }).join(',');

            const params = events.flatMap(event => [
                event.id,
                event.geofenceId,
                event.userId,
                event.entityId,
                event.entityType,
                event.eventType,
                `POINT(${event.location.longitude} ${event.location.latitude})`,
                event.previousLocation ? `POINT(${event.previousLocation.longitude} ${event.previousLocation.latitude})` : null,
                event.distance,
                event.speed,
                event.heading,
                event.accuracy,
                event.timestamp
            ]);

            await client.query(`
        INSERT INTO geofence_events (
          id, geofence_id, user_id, entity_id, entity_type, event_type,
          location, previous_location, distance, speed, heading, accuracy, timestamp
        ) VALUES ${values}
      `, params);

        } catch (error) {
            logger.error('Failed to log geofence events', { error, eventCount: events.length });
        } finally {
            client.release();
        }
    }

    private async triggerActions(actions: string[], events: GeofenceEvent[]): Promise<void> {
        // This would integrate with your notification service, webhook system, etc.
        // For now, just log the actions
        logger.info('Geofence actions triggered', {
            actions,
            events: events.map(e => ({ id: e.id, type: e.eventType }))
        });
    }

    private calculateGeohash(lat: number, lng: number, precision: number): string {
        // Simplified geohash calculation - in production use a proper geohash library
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);
        return `${latStr.substring(0, precision)}:${lngStr.substring(0, precision)}`;
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

    // New 10x Methods
    async checkProximity(userId: string, lat: number, lng: number): Promise<any[]> {
        return this.checkLocation({
            userId,
            entityId: userId, // Assuming user entity
            entityType: 'user',
            location: { latitude: lat, longitude: lng },
            checkTypes: ['inside', 'violation']
        }).then(res => res.events);
    }

    async getGeofencesInArea(minLat: number, minLng: number, maxLat: number, maxLng: number): Promise<Geofence[]> {
        return this.getGeofencesByBounds({ minLat, minLng, maxLat, maxLng });
    }

    private toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
