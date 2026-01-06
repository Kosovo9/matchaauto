import { Pool } from 'pg';
import Redis from 'ioredis';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { MetricsCollector } from '../../utils/metrics-collector';
import {
    UserNeed,
    UserNeedSchema,
    AdEngagementEvent,
    AdEngagementEventSchema,
    GeoPoint
} from '../../modules/community-resilience/types';

/**
 * TrueDemand Global™ - Advertising based on Real Needs, not algorithms.
 * "Not by Algorithm, but by Demand"
 */
export class TrueDemandAdsService {
    private pg: Pool;
    private redis: Redis;
    private metrics: MetricsCollector;

    constructor(pg: Pool, redis: Redis) {
        this.pg = pg;
        this.redis = redis;
        this.metrics = MetricsCollector.getInstance();
    }

    // ==================== MEMORY GRAPH (RECORD NEEDS) ====================

    /**
     * Records a user's need permanently in the Memory Graph.
     * "Meta forgets in 24h. We remember until fulfilled."
     */
    async recordUserNeed(need: UserNeed): Promise<void> {
        const validated = UserNeedSchema.parse(need);

        // 1. Offline-first / Local Storage Sync (Logic would be on client, receiving here)
        // 2. Store in Main DB (PostgreSQL)
        const client = await this.pg.connect();
        try {
            await client.query('BEGIN');

            const query = `
        INSERT INTO user_needs (
          user_id, category, query, explicit, confidence, status, created_at, last_seen_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, category, query) 
        DO UPDATE SET 
          last_seen_at = EXCLUDED.last_seen_at,
          confidence = LEAST(user_needs.confidence + 0.1, 1.0), -- Reinforce confidence
          status = 'active'
      `;

            await client.query(query, [
                validated.userId,
                validated.category,
                validated.query,
                validated.explicit,
                validated.confidence,
                'active',
                validated.createdAt,
                validated.lastSeenAt
            ]);

            await client.query('COMMIT');

            // Cache active need index for rapid matching
            await this.redis.sadd(`needs:${validated.category}:${validated.status}`, validated.userId);

            this.metrics.increment('true_demand.need_recorded', { category: validated.category });
            logger.info(`Recorded real need for User ${validated.userId}: ${validated.query}`);

        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Error recording User Need', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Tracks real-time intent to update the graph.
     */
    async trackRealNeed(userId: string, eventType: 'search' | 'post' | 'view', content: string): Promise<void> {
        // 1. Infer category from content (Basic inference for now, could be AI model)
        const category = this.inferCategory(content);

        let confidence = 0.5;
        if (eventType === 'post') confidence = 1.0; // Explicit
        if (eventType === 'search') confidence = 0.7; // Strong intent

        const need: UserNeed = {
            userId,
            category,
            query: content,
            explicit: eventType === 'post',
            confidence,
            status: 'active',
            createdAt: new Date(),
            lastSeenAt: new Date()
        };

        await this.recordUserNeed(need);
    }

    // ==================== HYPERLOCAL DEMAND MATCHING ====================

    /**
     * Matches an Ad Offer to users who have a documented REAL need.
     * Returns a list of User IDs to target.
     * Cost: 2000x cheaper/more effective than Meta Ads.
     */
    async matchOfferToRealDemand(offer: {
        id: string;
        category: string;
        keywords: string[];
        location: GeoPoint;
        radiusKm: number;
    }): Promise<string[]> {

        // 1. Find users with active needs in the category matching keywords
        // Using Postgres Full Text Search for best results
        const keywordQuery = offer.keywords.join(' & ');

        const sql = `
      SELECT n.user_id 
      FROM user_needs n
      JOIN users u ON n.user_id = u.id
      WHERE n.category = $1
        AND n.status = 'active'
        AND to_tsvector('spanish', n.query) @@ to_tsquery('spanish', $2)
        AND ST_DWithin(
          u.location_geom, 
          ST_SetSRID(ST_MakePoint($3, $4), 4326), 
          $5 * 1000 -- Convert km to meters
        )
    `;

        const result = await this.pg.query(sql, [
            offer.category,
            keywordQuery,
            offer.location.lng,
            offer.location.lat,
            offer.radiusKm
        ]);

        const targetUserIds = result.rows.map(r => r.user_id);

        logger.info(`TrueDemand Match: Offer ${offer.id} matched ${targetUserIds.length} users with REAL needs.`);

        return targetUserIds;
    }

    // ==================== ETHICAL BILLING ====================

    /**
     * Charges only for REAL engagement.
     * View: $0.10, Open: $0.20, Contact: $0.50, Completed: $1.00
     */
    async chargeForRealEngagement(event: AdEngagementEvent): Promise<void> {
        const validated = AdEngagementEventSchema.parse(event);

        const rates: Record<string, number> = {
            'view': 0.10,
            'open': 0.20,
            'contact': 0.50,
            'completed': 1.00
        };

        const amount = rates[validated.type] || 0;

        if (amount === 0) return;

        // Execute Transaction (Deduce balance from Advertiser)
        const client = await this.pg.connect();
        try {
            await client.query('BEGIN');

            // Find ad owner
            const adRes = await client.query('SELECT owner_id FROM ads WHERE id = $1', [validated.adId]);
            const ownerId = adRes.rows[0]?.owner_id;

            if (ownerId) {
                // Deduct balance
                await client.query(`
            UPDATE wallets 
            SET balance = balance - $1 
            WHERE user_id = $2 AND balance >= $1
         `, [amount, ownerId]);

                // Log Transaction
                await client.query(`
            INSERT INTO ad_transactions (ad_id, user_id, type, amount, created_at)
            VALUES ($1, $2, $3, $4, NOW())
         `, [validated.adId, ownerId, validated.type, amount]);
            }

            await client.query('COMMIT');
            this.metrics.increment('true_demand.revenue', { type: validated.type });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    private inferCategory(content: string): string {
        const lower = content.toLowerCase();
        if (lower.includes('batería') || lower.includes('arranque')) return 'auto_parts';
        if (lower.includes('llanta') || lower.includes('neumático')) return 'auto_parts';
        if (lower.includes('maíz') || lower.includes('siembra')) return 'agriculture';
        if (lower.includes('red') || lower.includes('pesca')) return 'fishing';
        return 'general';
    }
}
