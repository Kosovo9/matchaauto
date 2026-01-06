import { Pool } from 'pg';
import Redis from 'ioredis';
import { z } from 'zod';
import { logger } from '../../../utils/logger';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { BaseOffer, BaseOfferSchema, GeoPoint } from '../types';

// ==================== AGRI TYPES ====================
// Based on real Mexican crop cycles ("temporal", "riego") and units
export const CropOfferSchema = BaseOfferSchema.extend({
    category: z.literal('agriculture'),
    details: z.object({
        cropName: z.string(), // "Maíz Blanco", "Frijol Negro"
        quantity: z.number(),
        unit: z.enum(['kg', 'ton', 'costal_50kg', 'arpilla']),
        harvestDate: z.string().optional(),
        isOrganic: z.boolean().default(false),
        exchangePreference: z.string() // "Fertilizante", "Reparación tractor"
    })
});

export type CropOffer = z.infer<typeof CropOfferSchema>;

// Current agricultural season logic (Simplified for MX regions)
type Season = 'siembra' | 'crecimiento' | 'cosecha' | 'barbecho';
const CROP_CALENDAR_MX: Record<string, Record<number, Season>> = {
    'Chihuahua': {
        0: 'barbecho', 1: 'barbecho', 2: 'siembra', 3: 'crecimiento',
        4: 'crecimiento', 5: 'crecimiento', 6: 'crecimiento', 7: 'crecimiento',
        8: 'cosecha', 9: 'cosecha', 10: 'barbecho', 11: 'barbecho'
    },
    // Add other states...
};

/**
 * Service for Agricultural Barter
 * "Sin dinero, sin intermediarios."
 */
export class AgriBarterService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async createOffer(offer: CropOffer): Promise<string> {
        const validated = CropOfferSchema.parse(offer);

        const client = await this.pg.connect();
        try {
            // 1. Store in DB
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, $10, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.type,
                'agriculture',
                validated.title,
                validated.description,
                validated.location.lng,
                validated.location.lat,
                'active',
                JSON.stringify(validated.details),
                JSON.stringify(validated.metadata || {})
            ]);

            const offerId = res.rows[0].id;
            this.metrics.increment('agri_barter.offer_created', { crop: validated.details.cropName });

            // 2. Trigger Matching immediately
            await this.findMatchesForOffer(offerId, validated);

            return offerId;

        } finally {
            client.release();
        }
    }

    async findMatchesForOffer(offerId: string, offer: CropOffer): Promise<void> {
        // Logic: If I offer "Maiz", I want "Fertilizer" or "Tractor Repair".
        // Find requests that match my 'exchangePreference' AND are in a compatible season/location.

        // This would invoke the Notification Service to alert users via SMS/Push
        logger.info(`Finding matches for Agri Offer ${offerId}: ${offer.title}`);

        // Simple placeholder for matching logic
        const state = this.getStateFromLocation(offer.location);
        const season = this.getCurrentSeason(state);

        logger.info(`Current season in ${state} is ${season}. Optimizing match...`);
    }

    // Helper to determine season
    private getCurrentSeason(state: string = 'Chihuahua'): Season {
        const month = new Date().getMonth();
        return CROP_CALENDAR_MX[state]?.[month] || 'barbecho';
    }

    private getStateFromLocation(loc: GeoPoint): string {
        // In a real implementation, use PostGIS to find state from lat/lng
        return 'Chihuahua'; // Default for now
    }
}
