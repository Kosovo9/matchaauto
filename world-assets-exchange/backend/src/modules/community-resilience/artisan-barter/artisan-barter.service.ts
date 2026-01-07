import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { GeoPoint } from '../types';

export const ArtisanOfferSchema = z.object({
    userId: z.string(),
    craftType: z.enum(['pottery', 'textile', 'woodwork', 'metalwork', 'jewelry', 'other']),
    items: z.array(z.string()), // "Ollas de barro", "Huipiles"
    needs: z.array(z.string()), // "Leña", "Transporte", "Pigmentos"
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    isBarterOnly: z.boolean().default(true)
});

/**
 * Service for Artisan Barter
 * "Valorando el trabajo manual y la identidad cultural."
 */
export class ArtisanBarterService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async createOffer(offer: z.infer<typeof ArtisanOfferSchema>): Promise<string> {
        const validated = ArtisanOfferSchema.parse(offer);

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, created_at
        ) VALUES ($1, 'offer', 'artisan', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 'active', $6, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.craftType,
                `Ofrece: ${validated.items.join(', ')}. Necesita: ${validated.needs.join(', ')}`,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify({ needs: validated.needs, barterOnly: validated.isBarterOnly })
            ]);

            this.metrics.increment('artisan.offer_created', { craft: validated.craftType });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }
}
