import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { metrics } from '../utils/metrics';

export const GeofenceSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    geometry: z.object({
        type: z.literal('Polygon'),
        coordinates: z.array(z.array(z.tuple([z.number(), z.number()])))
    }),
    center: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),
    radius: z.number().min(10).max(50000), // meters
    isActive: z.boolean().default(true),
    rules: z.object({
        notifyOnEntry: z.boolean().default(true),
        notifyOnExit: z.boolean().default(true),
        autoMatch: z.boolean().default(false),
        restrictions: z.array(z.string()).optional(),
        speedLimit: z.number().min(0).optional(), // km/h
        operatingHours: z.array(z.object({
            dayOfWeek: z.number().min(0).max(6),
            startHour: z.number().min(0).max(23),
            endHour: z.number().min(0).max(23)
        })).optional()
    }).default({}),
    metadata: z.record(z.any()).optional()
});

export const GeofenceEventSchema = z.object({
    userId: z.string().uuid(),
    geofenceId: z.string().uuid(),
    eventType: z.enum(['entry', 'exit', 'inside', 'nearby']),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    }),
    distance: z.number().optional(), // meters from center
    speed: z.number().optional(), // km/h
    heading: z.number().min(0).max(360).optional(),
    timestamp: z.date().default(() => new Date())
});

export const GeofenceCheckRequestSchema = z.object({
    userId: z.string().uuid(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number()
    }),
    previousLocation: z.object({
        latitude: z.number(),
        longitude: z.number()
    }).optional(),
    speed: z.number().optional(),
    heading: z.number().optional(),
    sessionId: z.string().optional()
});

export const GeofenceCheckResponseSchema = z.object({
    events: z.array(GeofenceEventSchema),
    currentGeofences: z.array(z.string().uuid()),
    metadata: z.object({
        executionTimeMs: z.number(),
        geofencesChecked: z.number(),
        cacheHit: z.boolean()
    })
});

export type Geofence = z.infer<typeof GeofenceSchema>;
export type GeofenceEvent = z.infer<typeof GeofenceEventSchema>;
export type GeofenceCheckRequest = z.infer<typeof GeofenceCheckRequestSchema>;
export type GeofenceCheckResponse = z.infer<typeof GeofenceCheckResponseSchema>;

export class GeoFencingService {
    private redis: Redis;
    private pgPool: Pool;
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 300; // 5 minutes for active geofences

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;

        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 30000,
            timeout: 10000
        });
    }

    private async getActiveGeofences(): Promise<Geofence[]> {
        const cacheKey = 'geofences:active';

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.warn('Failed to read geofences from cache', { error });
        }

        const client = await this.pgPool.connect();

        try {
            const result = await client.query(`
        SELECT 
          id,
          name,
          description,
          ST_AsGeoJSON(geometry) as geometry,
          ST_AsGeoJSON(center) as center,
          radius,
          is_active,
          rules,
          metadata
        FROM geofences
        WHERE is_active = TRUE
        ORDER BY created_at DESC
      `);

            const geofences = result.rows.map(row => ({
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
                metadata: row.metadata
            }));

            // Cache for 5 minutes
            await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(geofences));

            return geofences;
        } finally {
            client.release();
        }
    }

    private async getUserGeofences(userId: string): Promise<string[]> {
        const cacheKey = `user:${userId}:geofences`;

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.warn('Failed to read user geofences from cache', { error });
        }

        const client = await this.pgPool.connect();

        try {
            const result = await client.query(
                `SELECT geofence_id FROM user_geofences WHERE user_id = $1`,
                [userId]
            );

            const geofenceIds = result.rows.map(row => row.geofence_id);

            // Cache for 1 minute (user geofences may change)
            await this.redis.setex(cacheKey, 60, JSON.stringify(geofenceIds));

            return geofenceIds;
        } finally {
            client.release();
        }
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

    private isPointInPolygon(point: [number, number], polygon: number[][][]): boolean {
        // Ray casting algorithm
        const x = point[0];
        const y = point[1];

        let inside = false;
        for (let i = 0, j = polygon[0].length - 1; i < polygon[0].length; j = i++) {
            const xi = polygon[0][i][0];
            const yi = polygon[0][i][1];
            const xj = polygon[0][j][0];
            const yj = polygon[0][j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }

    private async checkGeofenceRules(
        geofence: Geofence,
        eventType: 'entry' | 'exit' | 'inside' | 'nearby',
        request: GeofenceCheckRequest
    ): Promise<boolean> {
        const rules = geofence.rules || {};

        // Check operating hours
        if (rules.operatingHours && rules.operatingHours.length > 0) {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const currentHour = now.getHours();

            const isOperating = rules.operatingHours.some(hour =>
                hour.dayOfWeek === dayOfWeek &&
                hour.startHour <= currentHour &&
                currentHour <= hour.endHour
            );

            if (!isOperating) {
                return false;
            }
        }

        // Check speed limit
        if (rules.speedLimit && request.speed && request.speed > rules.speedLimit) {
            logger.debug('Speed limit exceeded', {
                geofenceId: geofence.id,
                speed: request.speed,
                limit: rules.speedLimit
            });
            return false;
        }

        // Check restrictions
        if (rules.restrictions && rules.restrictions.length > 0) {
            // Implement restriction logic based on user attributes
            // For now, just log
            logger.debug('Geofence has restrictions', {
                geofenceId: geofence.id,
                restrictions: rules.restrictions
            });
        }

        return true;
    }

    async checkLocation(request: GeofenceCheckRequest): Promise<GeofenceCheckResponse> {
        const startTime = Date.now();
        metrics.increment('geofence.checks_total');

        try {
            const validatedRequest = GeofenceCheckRequestSchema.parse(request);

            const [activeGeofences, userGeofences] = await Promise.all([
                this.getActiveGeofences(),
                this.getUserGeofences(validatedRequest.userId)
            ]);

            const events: GeofenceEvent[] = [];
            const currentGeofences: string[] = [];

            for (const geofence of activeGeofences) {
                if (!geofence.id) continue;

                const distance = this.calculateDistance(
                    validatedRequest.location.latitude,
                    validatedRequest.location.longitude,
                    geofence.center.latitude,
                    geofence.center.longitude
                );

                const isInside = distance <= geofence.radius;
                const wasInside = validatedRequest.previousLocation ?
                    this.calculateDistance(
                        validatedRequest.previousLocation.latitude,
                        validatedRequest.previousLocation.longitude,
                        geofence.center.latitude,
                        geofence.center.longitude
                    ) <= geofence.radius : false;

                let eventType: GeofenceEvent['eventType'] | null = null;

                if (isInside && !wasInside) {
                    eventType = 'entry';
                    currentGeofences.push(geofence.id);
                } else if (!isInside && wasInside) {
                    eventType = 'exit';
                } else if (isInside) {
                    eventType = 'inside';
                    currentGeofences.push(geofence.id);
                } else if (distance <= geofence.radius * 1.5) { // Nearby threshold
                    eventType = 'nearby';
                }

                if (eventType && await this.checkGeofenceRules(geofence, eventType, validatedRequest)) {
                    events.push({
                        userId: validatedRequest.userId,
                        geofenceId: geofence.id,
                        eventType,
                        location: validatedRequest.location,
                        distance: distance,
                        speed: validatedRequest.speed,
                        heading: validatedRequest.heading,
                        timestamp: new Date()
                    });
                }
            }

            // Update user's current geofences in cache
            await this.redis.setex(
                `user:${validatedRequest.userId}:current_geofences`,
                300, // 5 minutes
                JSON.stringify(currentGeofences)
            );

            // Log events to database (async)
            if (events.length > 0) {
                this.logGeofenceEvents(events).catch(error => {
                    logger.error('Failed to log geofence events', { error });
                });
            }

            const response: GeofenceCheckResponse = {
                events,
                currentGeofences,
                metadata: {
                    executionTimeMs: Date.now() - startTime,
                    geofencesChecked: activeGeofences.length,
                    cacheHit: false // TODO: Implement cache for check results
                }
            };

            logger.info('Geofence check completed', {
                userId: validatedRequest.userId,
                events: events.length,
                currentGeofences: currentGeofences.length,
                executionTime: response.metadata.executionTimeMs
            });

            metrics.timing('geofence.check_time_ms', response.metadata.executionTimeMs);
            metrics.gauge('geofence.events_detected', events.length);

            return response;

        } catch (error: any) {
            metrics.increment('geofence.errors_total');
            logger.error('Geofence check failed', {
                error: error.message,
                stack: error.stack,
                userId: request.userId
            });

            throw new Error(`Geofence check failed: ${error.message}`);
        }
    }

    private async logGeofenceEvents(events: GeofenceEvent[]): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            const values = events.map(event =>
                `('${event.userId}', '${event.geofenceId}', '${event.eventType}', 
          ST_SetSRID(ST_MakePoint(${event.location.longitude}, ${event.location.latitude}), 4326),
          ${event.distance || 'NULL'}, ${event.speed || 'NULL'}, 
          ${event.heading || 'NULL'}, '${event.timestamp.toISOString()}')`
            ).join(',');

            await client.query(`
        INSERT INTO geofence_events 
          (user_id, geofence_id, event_type, location, distance, speed, heading, created_at)
        VALUES ${values}
      `);
        } catch (error) {
            // Don't throw - this is a non-critical operation
            logger.error('Failed to insert geofence events', { error });
        } finally {
            client.release();
        }
    }

    async createGeofence(geofence: Omit<Geofence, 'id'>): Promise<Geofence> {
        const validatedGeofence = GeofenceSchema.parse(geofence);

        const client = await this.pgPool.connect();

        try {
            const result = await client.query(`
        INSERT INTO geofences 
          (name, description, geometry, center, radius, is_active, rules, metadata)
        VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), 
                ST_SetSRID(ST_MakePoint($5, $4), 4326), $6, $7, $8, $9)
        RETURNING id, name, description, 
                  ST_AsGeoJSON(geometry) as geometry,
                  ST_AsGeoJSON(center) as center,
                  radius, is_active, rules, metadata
      `, [
                validatedGeofence.name,
                validatedGeofence.description,
                JSON.stringify(validatedGeofence.geometry),
                validatedGeofence.center.latitude,
                validatedGeofence.center.longitude,
                validatedGeofence.radius,
                validatedGeofence.isActive,
                validatedGeofence.rules,
                validatedGeofence.metadata
            ]);

            const createdGeofence = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                description: result.rows[0].description,
                geometry: JSON.parse(result.rows[0].geometry),
                center: {
                    latitude: JSON.parse(result.rows[0].center).coordinates[1],
                    longitude: JSON.parse(result.rows[0].center).coordinates[0]
                },
                radius: result.rows[0].radius,
                isActive: result.rows[0].is_active,
                rules: result.rows[0].rules,
                metadata: result.rows[0].metadata
            };

            // Invalidate cache
            await this.redis.del('geofences:active');

            logger.info('Geofence created', { geofenceId: createdGeofence.id });
            metrics.increment('geofence.created_total');

            return createdGeofence;
        } finally {
            client.release();
        }
    }

    async updateGeofence(id: string, updates: Partial<Geofence>): Promise<Geofence> {
        const client = await this.pgPool.connect();

        try {
            const updateFields: string[] = [];
            const values: any[] = [id];
            let paramIndex = 2;

            if (updates.name !== undefined) {
                updateFields.push(`name = $${paramIndex}`);
                values.push(updates.name);
                paramIndex++;
            }

            if (updates.description !== undefined) {
                updateFields.push(`description = $${paramIndex}`);
                values.push(updates.description);
                paramIndex++;
            }

            if (updates.geometry !== undefined) {
                updateFields.push(`geometry = ST_SetSRID(ST_GeomFromGeoJSON($${paramIndex}), 4326)`);
                values.push(JSON.stringify(updates.geometry));
                paramIndex++;
            }

            if (updates.center !== undefined) {
                updateFields.push(`center = ST_SetSRID(ST_MakePoint($${paramIndex + 1}, $${paramIndex}), 4326)`);
                values.push(updates.center.latitude, updates.center.longitude);
                paramIndex += 2;
            }

            if (updates.radius !== undefined) {
                updateFields.push(`radius = $${paramIndex}`);
                values.push(updates.radius);
                paramIndex++;
            }

            if (updates.isActive !== undefined) {
                updateFields.push(`is_active = $${paramIndex}`);
                values.push(updates.isActive);
                paramIndex++;
            }

            if (updates.rules !== undefined) {
                updateFields.push(`rules = $${paramIndex}`);
                values.push(updates.rules);
                paramIndex++;
            }

            if (updates.metadata !== undefined) {
                updateFields.push(`metadata = $${paramIndex}`);
                values.push(updates.metadata);
                paramIndex++;
            }

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            updateFields.push(`updated_at = NOW()`);

            const result = await client.query(`
        UPDATE geofences 
        SET ${updateFields.join(', ')}
        WHERE id = $1
        RETURNING id, name, description, 
                  ST_AsGeoJSON(geometry) as geometry,
                  ST_AsGeoJSON(center) as center,
                  radius, is_active, rules, metadata
      `, values);

            if (result.rows.length === 0) {
                throw new Error('Geofence not found');
            }

            const updatedGeofence = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                description: result.rows[0].description,
                geometry: JSON.parse(result.rows[0].geometry),
                center: {
                    latitude: JSON.parse(result.rows[0].center).coordinates[1],
                    longitude: JSON.parse(result.rows[0].center).coordinates[0]
                },
                radius: result.rows[0].radius,
                isActive: result.rows[0].is_active,
                rules: result.rows[0].rules,
                metadata: result.rows[0].metadata
            };

            // Invalidate cache
            await this.redis.del('geofences:active');

            logger.info('Geofence updated', { geofenceId: id });
            metrics.increment('geofence.updated_total');

            return updatedGeofence;
        } finally {
            client.release();
        }
    }

    async deleteGeofence(id: string): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            await client.query('DELETE FROM geofences WHERE id = $1', [id]);

            // Invalidate cache
            await this.redis.del('geofences:active');

            logger.info('Geofence deleted', { geofenceId: id });
            metrics.increment('geofence.deleted_total');
        } finally {
            client.release();
        }
    }

    async getGeofenceEvents(
        geofenceId?: string,
        userId?: string,
        startDate?: Date,
        endDate?: Date,
        limit: number = 100
    ): Promise<GeofenceEvent[]> {
        const client = await this.pgPool.connect();

        try {
            let query = `
        SELECT 
          user_id,
          geofence_id,
          event_type,
          ST_AsGeoJSON(location) as location,
          distance,
          speed,
          heading,
          created_at
        FROM geofence_events
        WHERE 1=1
      `;

            const params: any[] = [];
            let paramIndex = 1;

            if (geofenceId) {
                query += ` AND geofence_id = $${paramIndex}`;
                params.push(geofenceId);
                paramIndex++;
            }

            if (userId) {
                query += ` AND user_id = $${paramIndex}`;
                params.push(userId);
                paramIndex++;
            }

            if (startDate) {
                query += ` AND created_at >= $${paramIndex}`;
                params.push(startDate);
                paramIndex++;
            }

            if (endDate) {
                query += ` AND created_at <= $${paramIndex}`;
                params.push(endDate);
                paramIndex++;
            }

            query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await client.query(query, params);

            return result.rows.map(row => ({
                userId: row.user_id,
                geofenceId: row.geofence_id,
                eventType: row.event_type,
                location: {
                    latitude: JSON.parse(row.location).coordinates[1],
                    longitude: JSON.parse(row.location).coordinates[0]
                },
                distance: row.distance,
                speed: row.speed,
                heading: row.heading,
                timestamp: row.created_at
            }));
        } finally {
            client.release();
        }
    }

    async getGeofenceStats(geofenceId: string): Promise<any> {
        const client = await this.pgPool.connect();

        try {
            const [eventStats, userStats, hourlyStats] = await Promise.all([
                client.query(`
          SELECT 
            event_type,
            COUNT(*) as count,
            AVG(distance) as avg_distance,
            AVG(speed) as avg_speed
          FROM geofence_events
          WHERE geofence_id = $1
            AND created_at > NOW() - INTERVAL '7 days'
          GROUP BY event_type
        `, [geofenceId]),

                client.query(`
          SELECT 
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(*) as total_events
          FROM geofence_events
          WHERE geofence_id = $1
            AND created_at > NOW() - INTERVAL '7 days'
        `, [geofenceId]),

                client.query(`
          SELECT 
            EXTRACT(HOUR FROM created_at) as hour,
            COUNT(*) as events
          FROM geofence_events
          WHERE geofence_id = $1
            AND created_at > NOW() - INTERVAL '7 days'
          GROUP BY EXTRACT(HOUR FROM created_at)
          ORDER BY hour
        `, [geofenceId])
            ]);

            return {
                eventTypes: eventStats.rows,
                users: userStats.rows[0],
                hourlyDistribution: hourlyStats.rows
            };
        } finally {
            client.release();
        }
    }

    async clearCache(): Promise<void> {
        try {
            const keys = await this.redis.keys('geofences:*');
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }

            const userKeys = await this.redis.keys('user:*:geofences');
            if (userKeys.length > 0) {
                await this.redis.del(...userKeys);
            }

            logger.info('Geofence cache cleared');
        } catch (error) {
            logger.error('Failed to clear geofence cache', { error });
        }
    }
}
