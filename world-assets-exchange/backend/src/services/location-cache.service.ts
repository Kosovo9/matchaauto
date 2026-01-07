import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export const LocationDataSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    entityId: z.string().uuid(),
    entityType: z.enum(['user', 'vehicle', 'service', 'asset']),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]) // [lng, lat]
    }),
    accuracy: z.number().min(0).max(100).optional(),
    altitude: z.number().optional(),
    speed: z.number().min(0).optional(),
    heading: z.number().min(0).max(360).optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    timestamp: z.date().default(() => new Date()),
    ttl: z.number().min(0).default(300) // seconds
});

export const LocationQuerySchema = z.object({
    entityIds: z.array(z.string().uuid()).optional(),
    entityType: z.enum(['user', 'vehicle', 'service', 'asset']).optional(),
    bounds: z.object({
        minLng: z.number().min(-180).max(180),
        minLat: z.number().min(-90).max(90),
        maxLng: z.number().min(-180).max(180),
        maxLat: z.number().min(-90).max(90)
    }).optional(),
    center: z.object({
        lng: z.number(),
        lat: z.number()
    }).optional(),
    radius: z.number().min(10).max(50000).optional(),
    minAccuracy: z.number().min(0).max(100).optional(),
    maxAge: z.number().min(0).default(300), // seconds
    limit: z.number().min(1).max(1000).default(100),
    orderBy: z.enum(['timestamp', 'distance', 'accuracy']).default('timestamp'),
    order: z.enum(['asc', 'desc']).default('desc')
});

export const LocationUpdateSchema = z.object({
    userId: z.string().uuid(),
    entityId: z.string().uuid(),
    entityType: z.enum(['user', 'vehicle', 'service', 'asset']),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),
    accuracy: z.number().min(0).max(100).optional(),
    speed: z.number().min(0).optional(),
    heading: z.number().min(0).max(360).optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    metadata: z.record(z.any()).optional()
});

export type LocationData = z.infer<typeof LocationDataSchema>;
export type LocationQuery = z.infer<typeof LocationQuerySchema>;
export type LocationUpdate = z.infer<typeof LocationUpdateSchema>;

interface CacheLayer {
    name: string;
    priority: number;
    get(key: string): Promise<LocationData | null>;
    set(key: string, data: LocationData, ttl: number): Promise<void>;
    delete(key: string): Promise<void>;
    search(query: LocationQuery): Promise<LocationData[]>;
    clear(): Promise<void>;
}

export class LocationCacheService {
    private redis: Redis;
    private pgPool: Pool;
    private cacheLayers: CacheLayer[] = [];
    private defaultTTL = 300; // 5 minutes

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.initializeCacheLayers();
    }

    private initializeCacheLayers(): void {
        // Layer 1: Memory cache (LRU) - fastest but limited capacity
        this.cacheLayers.push({
            name: 'memory',
            priority: 0,
            get: async (key: string) => {
                // Implementation using a simple Map (in production, use lru-cache)
                return null; // Simplified for example
            },
            set: async (key: string, data: LocationData, ttl: number) => {
                // Memory cache implementation
            },
            delete: async (key: string) => {
                // Memory cache implementation
            },
            search: async (query: LocationQuery) => {
                // Memory cache doesn't support complex searches
                return [];
            },
            clear: async () => {
                // Memory cache implementation
            }
        });

        // Layer 2: Redis cache - fast with good capacity
        this.cacheLayers.push({
            name: 'redis',
            priority: 1,
            get: async (key: string) => {
                try {
                    const cached = await this.redis.get(key);
                    if (cached) {
                        const data = JSON.parse(cached);
                        return LocationDataSchema.parse(data);
                    }
                } catch (error) {
                    logger.warn('Redis cache read failed', { key, error });
                }
                return null;
            },
            set: async (key: string, data: LocationData, ttl: number) => {
                try {
                    await this.redis.setex(key, ttl, JSON.stringify(data));
                } catch (error) {
                    logger.warn('Redis cache write failed', { key, error });
                }
            },
            delete: async (key: string) => {
                try {
                    await this.redis.del(key);
                } catch (error) {
                    logger.warn('Redis cache delete failed', { key, error });
                }
            },
            search: async (query: LocationQuery) => {
                // Redis can handle simple key pattern searches
                if (query.entityIds && query.entityIds.length === 1) {
                    const key = this.getLocationKey(query.entityIds[0]);
                    const data = await this.get(key);
                    return data ? [data] : [];
                }
                return [];
            },
            clear: async () => {
                try {
                    const keys = await this.redis.keys('location:*');
                    if (keys.length > 0) {
                        await this.redis.del(...keys);
                    }
                } catch (error) {
                    logger.error('Redis cache clear failed', { error });
                }
            }
        });

        // Layer 3: PostgreSQL with PostGIS - slowest but supports complex queries
        this.cacheLayers.push({
            name: 'postgres',
            priority: 2,
            get: async (key: string) => {
                const entityId = key.split(':')[1];
                return this.getFromDatabase(entityId);
            },
            set: async (key: string, data: LocationData, ttl: number) => {
                await this.saveToDatabase(data);
            },
            delete: async (key: string) => {
                const entityId = key.split(':')[1];
                await this.deleteFromDatabase(entityId);
            },
            search: async (query: LocationQuery) => {
                return this.searchInDatabase(query);
            },
            clear: async () => {
                // Don't clear database - it's persistent storage
            }
        });

        // Sort by priority
        this.cacheLayers.sort((a, b) => a.priority - b.priority);
    }

    private getLocationKey(entityId: string): string {
        return `location:${entityId}`;
    }

    private getGeohashKey(lat: number, lng: number, precision: number = 6): string {
        // Simplified geohash implementation
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);
        return `geohash:${precision}:${latStr.substring(0, precision)}:${lngStr.substring(0, precision)}`;
    }

    async updateLocation(update: LocationUpdate): Promise<LocationData> {
        const startTime = Date.now();
        metrics.increment('location_cache.updates_total');

        try {
            // Validate update
            const validatedUpdate = LocationUpdateSchema.parse(update);

            // Create location data
            const locationData: LocationData = {
                id: crypto.randomUUID(),
                userId: validatedUpdate.userId,
                entityId: validatedUpdate.entityId,
                entityType: validatedUpdate.entityType,
                location: {
                    type: 'Point',
                    coordinates: [validatedUpdate.location.longitude, validatedUpdate.location.latitude]
                },
                accuracy: validatedUpdate.accuracy,
                speed: validatedUpdate.speed,
                heading: validatedUpdate.heading,
                batteryLevel: validatedUpdate.batteryLevel,
                metadata: validatedUpdate.metadata,
                timestamp: new Date(),
                ttl: this.defaultTTL
            };

            // Validate full data
            const validatedData = LocationDataSchema.parse(locationData);

            // Update all cache layers in parallel
            const cacheKey = this.getLocationKey(validatedUpdate.entityId);
            const updatePromises = this.cacheLayers.map(layer =>
                layer.set(cacheKey, validatedData, this.defaultTTL).catch(error => {
                    logger.warn(`Cache layer ${layer.name} update failed`, { error });
                })
            );

            await Promise.all(updatePromises);

            // Update geohash index
            await this.updateGeohashIndex(
                validatedUpdate.entityId,
                validatedUpdate.location.latitude,
                validatedUpdate.location.longitude,
                validatedData
            );

            // Log to database for analytics
            await this.logLocationUpdate(validatedData);

            logger.info('Location updated', {
                entityId: validatedUpdate.entityId,
                entityType: validatedUpdate.entityType,
                latitude: validatedUpdate.location.latitude,
                longitude: validatedUpdate.location.longitude,
                accuracy: validatedUpdate.accuracy
            });

            metrics.timing('location_cache.update_time_ms', Date.now() - startTime);
            metrics.gauge('location_cache.active_locations', await this.getActiveLocationCount());

            return validatedData;

        } catch (error: any) {
            metrics.increment('location_cache.update_errors_total');
            logger.error('Location update failed', {
                error: error.message,
                stack: error.stack,
                update
            });

            throw new Error(`Location update failed: ${error.message}`);
        }
    }

    async getLocation(entityId: string): Promise<LocationData | null> {
        const startTime = Date.now();
        metrics.increment('location_cache.gets_total');

        try {
            const cacheKey = this.getLocationKey(entityId);

            // Try cache layers in order
            for (const layer of this.cacheLayers) {
                try {
                    const data = await layer.get(cacheKey);
                    if (data) {
                        // Check if data is expired
                        const age = Date.now() - new Date(data.timestamp).getTime();
                        if (age > data.ttl * 1000) {
                            await this.deleteLocation(entityId);
                            return null;
                        }

                        // Update metrics for cache hit
                        if (layer.name === 'memory') {
                            metrics.increment('location_cache.memory_hits_total');
                        } else if (layer.name === 'redis') {
                            metrics.increment('location_cache.redis_hits_total');
                        }

                        logger.debug('Location retrieved from cache', {
                            entityId,
                            layer: layer.name,
                            age: `${age}ms`
                        });

                        metrics.timing('location_cache.get_time_ms', Date.now() - startTime);
                        return data;
                    }
                } catch (error) {
                    logger.warn(`Cache layer ${layer.name} get failed`, { entityId, error });
                }
            }

            metrics.increment('location_cache.misses_total');
            logger.debug('Location not found in cache', { entityId });

            return null;

        } catch (error: any) {
            metrics.increment('location_cache.get_errors_total');
            logger.error('Location retrieval failed', {
                error: error.message,
                entityId
            });

            return null;
        }
    }

    async searchLocations(query: LocationQuery): Promise<LocationData[]> {
        const startTime = Date.now();
        metrics.increment('location_cache.searches_total');

        try {
            const validatedQuery = LocationQuerySchema.parse(query);

            // Try to get from faster cache layers first
            for (const layer of this.cacheLayers) {
                if (layer.name !== 'postgres') { // Skip database for initial search
                    try {
                        const results = await layer.search(validatedQuery);
                        if (results.length > 0) {
                            logger.debug('Locations found in cache layer', {
                                layer: layer.name,
                                count: results.length
                            });

                            metrics.timing('location_cache.search_time_ms', Date.now() - startTime);
                            return this.filterAndSortResults(results, validatedQuery);
                        }
                    } catch (error) {
                        logger.warn(`Cache layer ${layer.name} search failed`, { error });
                    }
                }
            }

            // Fall back to database
            const dbResults = await this.searchInDatabase(validatedQuery);

            // Cache the results
            await this.cacheSearchResults(validatedQuery, dbResults);

            logger.info('Locations searched in database', {
                query: validatedQuery,
                results: dbResults.length
            });

            metrics.timing('location_cache.search_time_ms', Date.now() - startTime);
            return dbResults;

        } catch (error: any) {
            metrics.increment('location_cache.search_errors_total');
            logger.error('Location search failed', {
                error: error.message,
                query
            });

            return [];
        }
    }

    async deleteLocation(entityId: string): Promise<void> {
        try {
            const cacheKey = this.getLocationKey(entityId);

            // Delete from all cache layers in parallel
            const deletePromises = this.cacheLayers.map(layer =>
                layer.delete(cacheKey).catch(error => {
                    logger.warn(`Cache layer ${layer.name} delete failed`, { entityId, error });
                })
            );

            await Promise.all(deletePromises);

            // Delete from geohash index
            await this.deleteFromGeohashIndex(entityId);

            logger.info('Location deleted from cache', { entityId });
            metrics.increment('location_cache.deletes_total');

        } catch (error: any) {
            metrics.increment('location_cache.delete_errors_total');
            logger.error('Location deletion failed', {
                error: error.message,
                entityId
            });
        }
    }

    async bulkUpdate(locations: LocationUpdate[]): Promise<LocationData[]> {
        const batchSize = 100;
        const results: LocationData[] = [];

        for (let i = 0; i < locations.length; i += batchSize) {
            const batch = locations.slice(i, i + batchSize);
            const batchPromises = batch.map(update =>
                this.updateLocation(update).catch(error => {
                    logger.error('Bulk location update failed for item', {
                        entityId: update.entityId,
                        error: error.message
                    });
                    return null;
                })
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter((r): r is LocationData => r !== null));

            // Small delay between batches
            if (i + batchSize < locations.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        logger.info('Bulk location update completed', {
            total: locations.length,
            successful: results.length
        });

        return results;
    }

    async getNearbyEntities(
        centerLat: number,
        centerLng: number,
        radius: number,
        entityType?: string,
        limit: number = 50
    ): Promise<LocationData[]> {
        const query: LocationQuery = {
            center: { lat: centerLat, lng: centerLng },
            radius,
            entityType,
            maxAge: 300,
            limit,
            orderBy: 'distance',
            order: 'asc'
        };

        return this.searchLocations(query);
    }

    async getActiveLocationCount(): Promise<number> {
        try {
            const client = await this.pgPool.connect();

            try {
                const result = await client.query(`
          SELECT COUNT(*) as count 
          FROM location_cache 
          WHERE expires_at > NOW()
        `);

                return parseInt(result.rows[0].count);
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Failed to get active location count', { error });
            return 0;
        }
    }

    async getCacheStats(): Promise<any> {
        try {
            const redisInfo = await this.redis.info();
            const memoryMatch = redisInfo.match(/used_memory_human:(\S+)/);
            const keysMatch = redisInfo.match(/db\d+:keys=(\d+)/);

            const client = await this.pgPool.connect();

            try {
                const [dbStats, entityStats, recentActivity] = await Promise.all([
                    client.query(`
            SELECT 
              COUNT(*) as total,
              COUNT(CASE WHEN expires_at > NOW() THEN 1 END) as active,
              COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as expired,
              AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_ttl_seconds
            FROM location_cache
          `),

                    client.query(`
            SELECT 
              entity_type,
              COUNT(*) as count,
              AVG(accuracy) as avg_accuracy
            FROM location_cache
            WHERE expires_at > NOW()
            GROUP BY entity_type
            ORDER BY count DESC
          `),

                    client.query(`
            SELECT 
              DATE_TRUNC('minute', updated_at) as minute,
              COUNT(*) as updates
            FROM location_cache
            WHERE updated_at > NOW() - INTERVAL '1 hour'
            GROUP BY DATE_TRUNC('minute', updated_at)
            ORDER BY minute DESC
            LIMIT 10
          `)
                ]);

                return {
                    redis: {
                        memoryUsage: memoryMatch ? memoryMatch[1] : 'unknown',
                        keys: keysMatch ? parseInt(keysMatch[1]) : 0
                    },
                    database: {
                        total: parseInt(dbStats.rows[0]?.total || '0'),
                        active: parseInt(dbStats.rows[0]?.active || '0'),
                        expired: parseInt(dbStats.rows[0]?.expired || '0'),
                        avgTtl: parseFloat(dbStats.rows[0]?.avg_ttl_seconds || '0')
                    },
                    byEntityType: entityStats.rows,
                    recentActivity: recentActivity.rows,
                    metrics: {
                        hits: metrics.get('location_cache.redis_hits_total') || 0,
                        misses: metrics.get('location_cache.misses_total') || 0,
                        updates: metrics.get('location_cache.updates_total') || 0
                    }
                };
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Failed to get cache stats', { error });
            throw error;
        }
    }

    async clearExpiredLocations(): Promise<{ deleted: number }> {
        const client = await this.pgPool.connect();

        try {
            // Delete expired locations from database
            const result = await client.query(`
        DELETE FROM location_cache 
        WHERE expires_at <= NOW() 
        RETURNING COUNT(*) as deleted_count
      `);

            const deletedCount = parseInt(result.rows[0]?.deleted_count || '0');

            // Also clear expired from Redis
            try {
                // This is simplified - in production, use Redis TTL and let it expire automatically
                const keys = await this.redis.keys('location:*');
                if (keys.length > 0) {
                    // Check TTL for each key and delete if expired
                    for (const key of keys) {
                        const ttl = await this.redis.ttl(key);
                        if (ttl <= 0) {
                            await this.redis.del(key);
                        }
                    }
                }
            } catch (redisError) {
                logger.warn('Failed to clear expired Redis keys', { error: redisError });
            }

            logger.info('Expired locations cleared', { deleted: deletedCount });
            metrics.gauge('location_cache.expired_cleared', deletedCount);

            return { deleted: deletedCount };
        } finally {
            client.release();
        }
    }

    async clearAll(): Promise<void> {
        try {
            // Clear all cache layers
            for (const layer of this.cacheLayers) {
                await layer.clear().catch(error => {
                    logger.warn(`Cache layer ${layer.name} clear failed`, { error });
                });
            }

            logger.info('All location caches cleared');
            metrics.increment('location_cache.clears_total');
        } catch (error) {
            logger.error('Failed to clear all caches', { error });
            throw error;
        }
    }

    private async getFromDatabase(entityId: string): Promise<LocationData | null> {
        const client = await this.pgPool.connect();

        try {
            const result = await client.query(`
        SELECT 
          id, user_id, entity_id, entity_type, 
          ST_AsGeoJSON(location) as location,
          accuracy, altitude, speed, heading, battery_level,
          metadata, created_at, updated_at, expires_at
        FROM location_cache
        WHERE entity_id = $1 AND expires_at > NOW()
        ORDER BY updated_at DESC
        LIMIT 1
      `, [entityId]);

            if (result.rows.length === 0) {
                return null;
            }

            const row = result.rows[0];
            const location = JSON.parse(row.location);

            return {
                id: row.id,
                userId: row.user_id,
                entityId: row.entity_id,
                entityType: row.entity_type,
                location: {
                    type: 'Point',
                    coordinates: location.coordinates
                },
                accuracy: row.accuracy,
                altitude: row.altitude,
                speed: row.speed,
                heading: row.heading,
                batteryLevel: row.battery_level,
                metadata: row.metadata,
                timestamp: row.updated_at,
                ttl: Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000)
            };
        } finally {
            client.release();
        }
    }

    private async saveToDatabase(data: LocationData): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            const expiresAt = new Date(Date.now() + (data.ttl * 1000));

            await client.query(`
        INSERT INTO location_cache (
          id, user_id, entity_id, entity_type, location,
          accuracy, altitude, speed, heading, battery_level,
          metadata, expires_at
        ) VALUES ($1, $2, $3, $4, 
          ST_SetSRID(ST_MakePoint($5, $6), 4326),
          $7, $8, $9, $10, $11, $12, $13
        ) ON CONFLICT (entity_id) 
        DO UPDATE SET
          user_id = EXCLUDED.user_id,
          entity_type = EXCLUDED.entity_type,
          location = EXCLUDED.location,
          accuracy = EXCLUDED.accuracy,
          altitude = EXCLUDED.altitude,
          speed = EXCLUDED.speed,
          heading = EXCLUDED.heading,
          battery_level = EXCLUDED.battery_level,
          metadata = EXCLUDED.metadata,
          updated_at = NOW(),
          expires_at = EXCLUDED.expires_at
      `, [
                data.id,
                data.userId,
                data.entityId,
                data.entityType,
                data.location.coordinates[0], // longitude
                data.location.coordinates[1], // latitude
                data.accuracy,
                data.altitude,
                data.speed,
                data.heading,
                data.batteryLevel,
                data.metadata,
                expiresAt
            ]);
        } finally {
            client.release();
        }
    }

    private async deleteFromDatabase(entityId: string): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            await client.query(
                'DELETE FROM location_cache WHERE entity_id = $1',
                [entityId]
            );
        } finally {
            client.release();
        }
    }

    private async searchInDatabase(query: LocationQuery): Promise<LocationData[]> {
        const client = await this.pgPool.connect();

        try {
            let sqlQuery = `
        SELECT 
          id, user_id, entity_id, entity_type, 
          ST_AsGeoJSON(location) as location,
          accuracy, altitude, speed, heading, battery_level,
          metadata, created_at, updated_at, expires_at
        FROM location_cache
        WHERE expires_at > NOW()
          AND updated_at > NOW() - INTERVAL '${query.maxAge} seconds'
      `;

            const params: any[] = [];
            let paramIndex = 1;

            if (query.entityIds && query.entityIds.length > 0) {
                sqlQuery += ` AND entity_id = ANY($${paramIndex})`;
                params.push(query.entityIds);
                paramIndex++;
            }

            if (query.entityType) {
                sqlQuery += ` AND entity_type = $${paramIndex}`;
                params.push(query.entityType);
                paramIndex++;
            }

            if (query.center && query.radius) {
                sqlQuery += ` AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          $${paramIndex + 2}
        )`;
                params.push(query.center.lng, query.center.lat, query.radius);
                paramIndex += 3;
            }

            if (query.bounds) {
                sqlQuery += ` AND ST_Within(
          location::geometry,
          ST_MakeEnvelope($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, 4326)
        )`;
                params.push(
                    query.bounds.minLng,
                    query.bounds.minLat,
                    query.bounds.maxLng,
                    query.bounds.maxLat
                );
                paramIndex += 4;
            }

            if (query.minAccuracy !== undefined) {
                sqlQuery += ` AND accuracy <= $${paramIndex}`;
                params.push(query.minAccuracy);
                paramIndex++;
            }

            // Add distance calculation if ordering by distance
            if (query.orderBy === 'distance' && query.center) {
                sqlQuery += `, ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography
        ) as distance`;
                params.push(query.center.lng, query.center.lat);
                paramIndex += 2;
            }

            // Ordering
            if (query.orderBy === 'distance' && query.center) {
                sqlQuery += ` ORDER BY distance ${query.order}`;
            } else if (query.orderBy === 'timestamp') {
                sqlQuery += ` ORDER BY updated_at ${query.order}`;
            } else if (query.orderBy === 'accuracy') {
                sqlQuery += ` ORDER BY accuracy ${query.order}`;
            }

            sqlQuery += ` LIMIT $${paramIndex}`;
            params.push(query.limit);

            const result = await client.query(sqlQuery, params);

            return result.rows.map(row => {
                const location = JSON.parse(row.location);

                return {
                    id: row.id,
                    userId: row.user_id,
                    entityId: row.entity_id,
                    entityType: row.entity_type,
                    location: {
                        type: 'Point',
                        coordinates: location.coordinates
                    },
                    accuracy: row.accuracy,
                    altitude: row.altitude,
                    speed: row.speed,
                    heading: row.heading,
                    batteryLevel: row.battery_level,
                    metadata: row.metadata,
                    timestamp: row.updated_at,
                    ttl: Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000)
                };
            });
        } finally {
            client.release();
        }
    }

    private async logLocationUpdate(data: LocationData): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            await client.query(`
        INSERT INTO location_history (
          id, user_id, entity_id, entity_type, location,
          accuracy, speed, heading, battery_level, metadata
        ) VALUES ($1, $2, $3, $4, 
          ST_SetSRID(ST_MakePoint($5, $6), 4326),
          $7, $8, $9, $10, $11
        )
      `, [
                data.id,
                data.userId,
                data.entityId,
                data.entityType,
                data.location.coordinates[0], // longitude
                data.location.coordinates[1], // latitude
                data.accuracy,
                data.speed,
                data.heading,
                data.batteryLevel,
                data.metadata
            ]);
        } catch (error) {
            logger.warn('Failed to log location history', { error });
        } finally {
            client.release();
        }
    }

    private async updateGeohashIndex(
        entityId: string,
        lat: number,
        lng: number,
        data: LocationData
    ): Promise<void> {
        try {
            // Update multiple geohash precisions
            const precisions = [3, 4, 5, 6, 7];

            for (const precision of precisions) {
                const geohashKey = this.getGeohashKey(lat, lng, precision);
                await this.redis.zadd(geohashKey, Date.now(), entityId);
                await this.redis.expire(geohashKey, this.defaultTTL);
            }
        } catch (error) {
            logger.warn('Failed to update geohash index', { error });
        }
    }

    private async deleteFromGeohashIndex(entityId: string): Promise<void> {
        try {
            // This is simplified - in production, track which geohash keys contain this entity
            const pattern = 'geohash:*';
            const keys = await this.redis.keys(pattern);

            for (const key of keys) {
                await this.redis.zrem(key, entityId);
            }
        } catch (error) {
            logger.warn('Failed to delete from geohash index', { error });
        }
    }

    private async cacheSearchResults(query: LocationQuery, results: LocationData[]): Promise<void> {
        try {
            // Create a cache key for the search query
            const queryKey = this.getSearchQueryKey(query);

            // Store results with a shorter TTL
            await this.redis.setex(
                queryKey,
                60, // 1 minute for search results
                JSON.stringify(results.map(r => r.entityId))
            );

            // Also cache each individual result
            for (const result of results) {
                const entityKey = this.getLocationKey(result.entityId);
                await this.redis.setex(
                    entityKey,
                    result.ttl,
                    JSON.stringify(result)
                );
            }
        } catch (error) {
            logger.warn('Failed to cache search results', { error });
        }
    }

    private getSearchQueryKey(query: LocationQuery): string {
        const queryString = JSON.stringify(query);
        const hash = Buffer.from(queryString).toString('base64').substring(0, 32);
        return `search:${hash}`;
    }

    private filterAndSortResults(results: LocationData[], query: LocationQuery): LocationData[] {
        let filtered = results.filter(data => {
            // Filter by max age
            const age = Date.now() - new Date(data.timestamp).getTime();
            if (age > query.maxAge * 1000) {
                return false;
            }

            // Filter by accuracy
            if (query.minAccuracy !== undefined &&
                (data.accuracy === undefined || data.accuracy > query.minAccuracy)) {
                return false;
            }

            // Filter by bounds if specified
            if (query.bounds && data.location.coordinates) {
                const [lng, lat] = data.location.coordinates;
                if (lng < query.bounds.minLng || lng > query.bounds.maxLng ||
                    lat < query.bounds.minLat || lat > query.bounds.maxLat) {
                    return false;
                }
            }

            // Filter by radius if specified
            if (query.center && query.radius && data.location.coordinates) {
                const [lng, lat] = data.location.coordinates;
                const distance = this.calculateHaversineDistance(
                    lat, lng, query.center.lat, query.center.lng
                );

                if (distance > query.radius) {
                    return false;
                }
            }

            return true;
        });

        // Sort results
        if (query.orderBy === 'timestamp') {
            filtered.sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return query.order === 'asc' ? timeA - timeB : timeB - timeA;
            });
        } else if (query.orderBy === 'accuracy' && query.order === 'asc') {
            filtered.sort((a, b) => (a.accuracy || 100) - (b.accuracy || 100));
        } else if (query.orderBy === 'accuracy' && query.order === 'desc') {
            filtered.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));
        }

        // Apply limit
        return filtered.slice(0, query.limit);
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
}
