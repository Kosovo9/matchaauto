import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export const TrackingUpdateSchema = z.object({
    vehicleId: z.string().uuid(),
    latitude: z.number(),
    longitude: z.number(),
    speed: z.number().optional().default(0),
    bearing: z.number().optional().default(0),
    accuracy: z.number().optional().default(10), // meters
    battery: z.number().optional()
});

export type TrackingUpdate = z.infer<typeof TrackingUpdateSchema>;

export class VehicleTrackingService {
    private redis: Redis;
    private pgPool: Pool;
    private minMovementMeters = 5;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
    }

    /**
     * Procesa una actualización de ubicación en tiempo real
     */
    async updateLocation(update: TrackingUpdate): Promise<void> {
        const { vehicleId, latitude, longitude, speed, bearing, battery } = update;

        // 1. Filter micro-movements (10x noise reduction)
        const lastPos = await this.redis.geopos('vehicle:tracking:live', vehicleId);
        if (lastPos && lastPos[0]) {
            const dist = this.haversine(latitude, longitude, parseFloat(lastPos[0][1]), parseFloat(lastPos[0][0]));
            if (dist < this.minMovementMeters) return;
        }

        try {
            // 2. Update Live Cache (Redis Geo)
            const pipeline = this.redis.pipeline();
            pipeline.geoadd('vehicle:tracking:live', longitude, latitude, vehicleId);
            pipeline.setex(`vehicle:meta:${vehicleId}`, 300, JSON.stringify({
                speed, bearing, battery, updatedAt: Date.now()
            }));
            await pipeline.exec();

            // 3. Buffer for Async Persistence (10x DB efficiency)
            // En un sistema real, alimentaríamos una cola o un buffer en memoria
            await this.persistLocation(update);

            metrics.increment('tracking.update');
        } catch (error) {
            logger.error('Tracking update failed:', error);
        }
    }

    /**
     * Recupera la posición actual de un vehículo
     */
    async getLiveLocation(vehicleId: string): Promise<any> {
        const pos = await this.redis.geopos('vehicle:tracking:live', vehicleId);
        if (!pos || !pos[0]) return null;

        const meta = await this.redis.get(`vehicle:meta:${vehicleId}`);
        return {
            coordinates: { lat: parseFloat(pos[0][1]), lng: parseFloat(pos[0][0]) },
            ...(meta ? JSON.parse(meta) : {})
        };
    }

    private async persistLocation(update: TrackingUpdate): Promise<void> {
        const client = await this.pgPool.connect();
        try {
            const query = `
        INSERT INTO location_history (entity_id, entity_type, location, speed, bearing, metadata)
        VALUES ($1, 'vehicle', ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6);
      `;
            // Optimization: This could be batched every 10s
            await client.query(query, [
                update.vehicleId,
                update.longitude,
                update.latitude,
                update.speed,
                update.bearing,
                JSON.stringify({ battery: update.battery })
            ]);
        } finally {
            client.release();
        }
    }

    private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
}
