import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../../utils/metrics-collector';
import { CulturalOfferSchema, CulturalOffer } from '../../cultural-types';

export class CulturalBarterService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    // ==================== OFFERS MANAGEMENT ====================
    async createOffer(offer: CulturalOffer): Promise<string> {
        const validated = CulturalOfferSchema.parse(offer);
        const client = await this.pg.connect();

        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, metadata, created_at
        ) VALUES ($1, $2, 'cultural', $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), 'active', $7, $8, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.type,
                validated.title,
                validated.description,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify(validated.details),
                JSON.stringify(validated.metadata || {})
            ]);

            this.metrics.increment('cultural_barter.offer_created', { type: validated.details.type });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    // ==================== SMS HANDLER ====================
    async handleSMS(phone: string, message: string): Promise<string> {
        // "CULTURA OFREZCO TallerDanza Chihuahua"
        const parts = message.split(' ');
        const action = parts[1]?.toUpperCase();

        if (action === 'OFREZCO') {
            const offer = parts.slice(2, -1).join(' ');
            const location = parts[parts.length - 1];
            // Logic to create offer from SMS (simplified)
            return `REGISTRADO: Oferta cultural '${offer}' en ${location}. Gracias por compartir cultura.`;
        }

        if (action === 'NECESITO') {
            const need = parts.slice(2, -1).join(' ');
            const location = parts[parts.length - 1];
            return `REGISTRADO: Necesidad '${need}' en ${location}. Buscando apoyo comunitario...`;
        }

        return "COMANDO NO RECONOCIDO. Use: CULTURA OFREZCO [Servicio] [Lugar]";
    }
}
