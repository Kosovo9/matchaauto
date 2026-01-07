import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

// Schema for an Ad Campaign booking
export const AdBookingSchema = z.object({
    userId: z.string().uuid(),
    slotId: z.string(),
    startDate: z.string().datetime(), // ISO date
    duration: z.enum(['daily', 'weekly', 'monthly']),
    contentUrl: z.string().url(),
    redirectUrl: z.string().url()
});

export interface AdSlot {
    id: string;
    name: string;
    page: string; // 'home', 'search', 'details', etc.
    position: 'hero_top' | 'sidebar_right' | 'sidebar_left' | 'content_mid' | 'footer_top' | 'modal_popup' | 'sticky_bottom';
    size: '728x90' | '300x250' | '160x600' | '970x250' | 'fluid';
    basePriceDaily: number;
}

// 7 Defined Spots across the platform (extendable)
export const DEFAULT_SLOTS: AdSlot[] = [
    { id: 'home_hero_1', name: 'Home Hero Premium', page: 'home', position: 'hero_top', size: '970x250', basePriceDaily: 2 },
    { id: 'search_sidebar_1', name: 'Search Sidebar Top', page: 'search', position: 'sidebar_right', size: '300x250', basePriceDaily: 2 },
    { id: 'search_mid_1', name: 'Search Feed Interstitial', page: 'search', position: 'content_mid', size: '728x90', basePriceDaily: 2 },
    { id: 'listing_sidebar_1', name: 'Listing Detail Sidebar', page: 'details', position: 'sidebar_right', size: '300x250', basePriceDaily: 2 },
    { id: 'global_footer', name: 'Global Footer Banner', page: 'global', position: 'footer_top', size: '728x90', basePriceDaily: 2 },
    { id: 'mobile_sticky', name: 'Mobile Bottom Sticky', page: 'global', position: 'sticky_bottom', size: 'fluid', basePriceDaily: 2 },
    { id: 'search_hero_slim', name: 'Search Header Slim', page: 'search', position: 'hero_top', size: '970x250', basePriceDaily: 2 }
];

export class AdManagerService {
    private redis: Redis;
    private pgPool: Pool;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
    }

    // PUBLIC: Get active ads for a specific page to render
    async getActiveAdsForPage(page: string): Promise<Record<string, any>> {
        const cacheKey = `ads:active:${page}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const client = await this.pgPool.connect();
        try {
            // Fetch active campaigns for this page (or global)
            // Optimised query: Join slots and active campaigns
            const res = await client.query(`
            SELECT s.position, s.size, c.content_url, c.redirect_url, c.id as campaign_id
            FROM ad_slots s
            JOIN ad_campaigns c ON s.id = c.slot_id
            WHERE (s.page = $1 OR s.page = 'global')
              AND c.status = 'active'
              AND c.start_date <= NOW() 
              AND c.end_date >= NOW()
            ORDER BY s.base_price_daily DESC
          `, [page]);

            const ads: Record<string, any> = {};
            res.rows.forEach(r => {
                // Group by position so frontend can just do ads['hero_top']
                ads[r.position] = {
                    imageUrl: r.content_url,
                    link: r.redirect_url,
                    size: r.size,
                    campaignId: r.campaign_id
                };
            });

            // Cache for 5 minutes (ads don't change second-by-second)
            await this.redis.setex(cacheKey, 300, JSON.stringify(ads));
            return ads;
        } finally {
            client.release();
        }
    }

    // BOOKING: Rent a spot
    async bookAdSpace(booking: z.infer<typeof AdBookingSchema>) {
        const start = Date.now();
        const validated = AdBookingSchema.parse(booking);

        const client = await this.pgPool.connect();
        try {
            await client.query('BEGIN');

            // 1. Calculate dates and price
            const startDate = new Date(validated.startDate);
            let days = 1;
            if (validated.duration === 'weekly') days = 7;
            if (validated.duration === 'monthly') days = 30;

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + days);

            // 2. Check Availability (Overlap Check)
            const conflict = await client.query(`
             SELECT id FROM ad_campaigns 
             WHERE slot_id = $1 
               AND status = 'active'
               AND (start_date, end_date) OVERLAPS ($2::timestamptz, $3::timestamptz)
             FOR UPDATE
          `, [validated.slotId, startDate, endDate]);

            if (conflict.rows.length > 0) {
                throw new Error('Slot is already booked for these dates.');
            }

            // 3. Create Booking
            const res = await client.query(`
             INSERT INTO ad_campaigns (user_id, slot_id, start_date, end_date, content_url, redirect_url, status, total_price)
             SELECT $1, $2, $3, $4, $5, $6, 'pending_payment', (base_price_daily * $7)
             FROM ad_slots WHERE id = $2
             RETURNING id, total_price
          `, [validated.userId, validated.slotId, startDate, endDate, validated.contentUrl, validated.redirectUrl, days]);

            const campaign = res.rows[0];

            await client.query('COMMIT');

            metrics.increment('ads.bookings.created');
            return { campaignId: campaign.id, price: parseFloat(campaign.total_price), status: 'pending_payment' };

        } catch (e: any) {
            await client.query('ROLLBACK');
            logger.error('Ad booking failed', e);
            throw e; // Controller will catch
        } finally {
            client.release();
        }
    }

    // ANALYTICS: Track impressions/clicks
    async trackEvent(campaignId: string, type: 'impression' | 'click') {
        // High-speed write to Redis HyperLogLog or Counter
        const key = `ads:stats:${campaignId}:${type}:${new Date().toISOString().split('T')[0]}`;
        await this.redis.incr(key);

        // If click, we could also log deeper analytics
    }
}
