import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../../utils/logger';

export const VisibilityTypeSchema = z.enum(['offer-top3', 'request-alert']);
export type VisibilityType = z.infer<typeof VisibilityTypeSchema>;

export const VisibilityTierSchema = z.object({
    id: z.string(),
    signalId: z.string(),
    type: VisibilityTypeSchema,
    durationDays: z.number().optional(), // 1, 3, 7 (solo para ofertas)
    region: z.string(),       // "MX", "US-CA", "BD"
    amountUSD: z.number(),    // $1.00 a $7.50
    status: z.enum(['active', 'expired', 'pending-payment']),
    activatedAt: z.number(),
    expiresAt: z.number()
});

export type VisibilityTier = z.infer<typeof VisibilityTierSchema>;

export class VisibilityService {
    private redis: Redis;
    private pgPool: Pool;

    private readonly priceTable: Record<string, any> = {
        // Precios en USD (United States Dollars)
        'MX': { alert: 2.50, '1-day': 1.50, '3-day': 4.00, '7-day': 9.00 },
        'US': { alert: 5.00, '1-day': 2.50, '3-day': 6.00, '7-day': 12.00 },
        'BD': { alert: 1.50, '1-day': 1.00, '3-day': 2.50, '7-day': 5.00 },
        'GLOBAL': { alert: 3.00, '1-day': 2.00, '3-day': 5.00, '7-day': 10.00 }
    };

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
    }

    async calculatePrice(region: string, type: VisibilityType, durationDays?: number): Promise<number> {
        const regionPrices = this.priceTable[region] || this.priceTable['MX'];
        if (type === 'request-alert') {
            return regionPrices.alert;
        }
        return regionPrices[`${durationDays}-day`] || 1.00;
    }

    async activateVisibility(signalId: string, type: VisibilityType, region: string, durationDays?: number): Promise<VisibilityTier> {
        const amount = await this.calculatePrice(region, type, durationDays);
        const now = Date.now();
        const expiresAt = durationDays ? now + (durationDays * 24 * 60 * 60 * 1000) : now + (30 * 24 * 60 * 60 * 1000); // Alert valid for 30 days or until fulfilled

        const tier: VisibilityTier = {
            id: Math.random().toString(36).substring(7),
            signalId,
            type,
            durationDays,
            region,
            amountUSD: amount,
            status: 'active',
            activatedAt: now,
            expiresAt
        };

        // Save to Postgres
        await this.pgPool.query(
            'INSERT INTO visibility_tiers (id, signal_id, type, duration_days, region, amount_usd, status, activated_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [tier.id, tier.signalId, tier.type, tier.durationDays, tier.region, tier.amountUSD, tier.status, new Date(tier.activatedAt), new Date(tier.expiresAt)]
        );

        // Cache in Redis for fast matching lookup
        await this.redis.set(`visibility:${signalId}`, JSON.stringify(tier), 'PX', expiresAt - now);

        logger.info(`[Visibility] Activated ${type} for signal ${signalId} in ${region}`);
        return tier;
    }

    async getActiveVisibility(signalId: string): Promise<VisibilityTier | null> {
        const cached = await this.redis.get(`visibility:${signalId}`);
        if (cached) return JSON.parse(cached);

        const result = await this.pgPool.query(
            'SELECT * FROM visibility_tiers WHERE signal_id = $1 AND status = \'active\' AND expires_at > NOW() LIMIT 1',
            [signalId]
        );

        if (result.rows.length > 0) {
            const row = result.rows[0];
            const tier: VisibilityTier = {
                id: row.id,
                signalId: row.signal_id,
                type: row.type,
                durationDays: row.duration_days,
                region: row.region,
                amountUSD: parseFloat(row.amount_usd),
                status: row.status,
                activatedAt: row.activated_at.getTime(),
                expiresAt: row.expires_at.getTime()
            };
            return tier;
        }

        return null;
    }
}
