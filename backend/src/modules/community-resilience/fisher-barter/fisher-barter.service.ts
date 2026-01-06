import { Pool } from 'pg';
import Redis from 'ioredis';
import { z } from 'zod';
import { logger } from '../../../utils/logger';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { BaseOffer, BaseOfferSchema, GeoPoint } from '../types';

// ==================== FISH TYPES ====================
// Based on real coastal needs and Veda seasons (CONAPESCA)
export const FishOfferSchema = BaseOfferSchema.extend({
    category: z.literal('fishing'),
    details: z.object({
        species: z.string(), // "Totoaba" (regulada), "Sierra", "Camarón"
        quantityKg: z.number(),
        preservation: z.enum(['fresh', 'frozen', 'dried', 'salted']),
        catchDate: z.string(),
        port: z.string(), // "Puerto Peñasco", "San Felipe", "Veracruz"
        exchangeNeeds: z.array(z.string()) // ["Hielo", "Gasolina", "Red 3 pulgadas"]
    })
});

export type FishOffer = z.infer<typeof FishOfferSchema>;

// Simple Season Calendar for Ports
const PORT_CALENDAR: Record<string, Record<string, boolean>> = {
    'Puerto Peñasco': { 'camaron': true, 'sierra': true, 'totoaba': false }, // False = Veda
    'Veracruz': { 'huachinango': true, 'robalo': true }
};

/**
 * Service for Fisher Barter
 * "Del mar a la comunidad, sin intermediarios."
 */
export class FisherBarterService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async createOffer(offer: FishOffer): Promise<string> {
        const validated = FishOfferSchema.parse(offer);

        // Check Veda (Ban)
        const isAllowed = this.checkVeda(validated.details.port, validated.details.species);
        if (!isAllowed) {
            throw new Error(`VEDA_ACTIVE: Captura de ${validated.details.species} prohibida en ${validated.details.port}`);
        }

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, $10, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.type,
                'fishing',
                validated.title,
                validated.description,
                validated.location.lng,
                validated.location.lat,
                'active',
                JSON.stringify(validated.details),
                JSON.stringify(validated.metadata || {})
            ]);

            const offerId = res.rows[0].id;
            this.metrics.increment('fisher_barter.offer_created', { port: validated.details.port });

            // Match with needs (e.g., someone offering Ice or Fuel nearby)
            return offerId;

        } finally {
            client.release();
        }
    }

    private checkVeda(port: string, species: string): boolean {
        // True if allowed, False if Veda
        // Normalize string
        const s = species.toLowerCase();
        // Default to true if unknown for MVP, but in prod default to false/strict
        if (PORT_CALENDAR[port]) {
            // If specifically listed as false, it is banned.
            if (PORT_CALENDAR[port][s] === false) return false;
        }
        return true;
    }
}
