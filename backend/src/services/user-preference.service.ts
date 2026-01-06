import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { Vehicle } from './vehicle.service';

export const UserPreferenceSchema = z.object({
    id: z.string().uuid().optional(),
    userId: z.string().uuid(),
    brands: z.array(z.string()).optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    vehicleTypes: z.array(z.string()).optional(),
    yearMin: z.number().optional(),
    features: z.array(z.string()).optional(),
    maxDistanceKm: z.number().min(5).max(1000).default(100),
    notificationEnabled: z.boolean().default(true)
});

export type UserPreference = z.infer<typeof UserPreferenceSchema>;

export class UserPreferenceService {
    private redis: Redis;
    private pgPool: Pool;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
    }

    async savePreferences(userId: string, prefs: Omit<UserPreference, 'id' | 'userId'>): Promise<UserPreference> {
        const validated = UserPreferenceSchema.omit({ id: true, userId: true }).parse(prefs);

        const client = await this.pgPool.connect();
        try {
            // Upsert preferences
            const res = await client.query(`
            INSERT INTO user_preferences (
                user_id, brands, price_min, price_max, 
                vehicle_types, year_min, features, 
                max_distance_km, notification_enabled, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                brands = EXCLUDED.brands,
                price_min = EXCLUDED.price_min,
                price_max = EXCLUDED.price_max,
                vehicle_types = EXCLUDED.vehicle_types,
                year_min = EXCLUDED.year_min,
                features = EXCLUDED.features,
                max_distance_km = EXCLUDED.max_distance_km,
                notification_enabled = EXCLUDED.notification_enabled,
                updated_at = NOW()
            RETURNING *
        `, [
                userId,
                JSON.stringify(validated.brands),
                validated.priceMin,
                validated.priceMax,
                JSON.stringify(validated.vehicleTypes),
                validated.yearMin,
                JSON.stringify(validated.features),
                validated.maxDistanceKm,
                validated.notificationEnabled
            ]);

            const saved = res.rows[0];
            // Invalidate cache
            await this.redis.del(`user:prefs:${userId}`);

            return saved;
        } finally {
            client.release();
        }
    }

    async getPreferences(userId: string): Promise<UserPreference | null> {
        const cached = await this.redis.get(`user:prefs:${userId}`);
        if (cached) return JSON.parse(cached);

        const client = await this.pgPool.connect();
        try {
            const res = await client.query('SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
            if (res.rows.length === 0) return null;

            const prefs = res.rows[0];
            // map fields...
            return prefs as any;
        } finally {
            client.release();
        }
    }

    calculateMatchScore(vehicle: Vehicle, prefs: UserPreference): number {
        let score = 0;
        let maxScore = 0;

        // Brand Match (Weight: 30)
        maxScore += 30;
        if (prefs.brands && prefs.brands.length > 0) {
            if (prefs.brands.some(b => b.toLowerCase() === vehicle.make.toLowerCase())) {
                score += 30;
            }
        } else {
            score += 15; // Neutral
        }

        // Price Match (Weight: 40)
        maxScore += 40;
        if (vehicle.price) {
            const min = prefs.priceMin || 0;
            const max = prefs.priceMax || Infinity;
            if (vehicle.price >= min && vehicle.price <= max) {
                score += 40;
            } else {
                // Partial credit for being close (within 10%)
                if (vehicle.price >= min * 0.9 && vehicle.price <= max * 1.1) {
                    score += 20;
                }
            }
        }

        // Year Match (Weight: 10)
        maxScore += 10;
        if (prefs.yearMin) {
            if (vehicle.year >= prefs.yearMin) score += 10;
        } else {
            score += 10;
        }

        // Features Match (Weight: 20)
        maxScore += 20;
        if (prefs.features && prefs.features.length > 0 && vehicle.features.length > 0) {
            const matchCount = prefs.features.filter(f => vehicle.features.includes(f)).length;
            const ratio = matchCount / prefs.features.length;
            score += 20 * ratio;
        }

        return Math.round((score / maxScore) * 100);
    }
}
