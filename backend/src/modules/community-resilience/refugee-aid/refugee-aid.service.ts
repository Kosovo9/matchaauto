import { Pool } from 'pg';
import Redis from 'ioredis';
import { z } from 'zod';
import { logger } from '../../../utils/logger';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { BaseOffer, BaseOfferSchema, GeoPoint } from '../types';

// ==================== REFUGEE TYPES ====================
export const RefugeeRequestSchema = z.object({
    userId: z.string(), // Can be anonymous or ephemeral ID
    type: z.enum(['need', 'offer']),
    category: z.enum(['shelter', 'food', 'medical', 'clothing', 'transport', 'legal', 'skill']),
    description: z.string(),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    groupSize: z.number().default(1),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    contactInfo: z.string().optional() // SMS or WhatsApp, encrypted
});

export type RefugeeRequest = z.infer<typeof RefugeeRequestSchema>;

/**
 * Service for Refugee Aid
 * "Dignity in displacement."
 */
export class RefugeeAidService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    // Activate Refugee Mode: simplified verification, focuses on immediate needs
    async activateRefugeeMode(userId: string, location: GeoPoint): Promise<void> {
        const client = await this.pg.connect();
        try {
            await client.query(`
        UPDATE users 
        SET refugee_mode = true, 
            refugee_since = NOW(), 
            last_location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
        WHERE id = $3
      `, [location.lng, location.lat, userId]);

            this.metrics.increment('refugee_aid.mode_activated');
            logger.info(`Refugee mode activated for user ${userId}`);
        } finally {
            client.release();
        }
    }

    async submitRequest(request: RefugeeRequest): Promise<string> {
        const validated = RefugeeRequestSchema.parse(request);

        const client = await this.pg.connect();
        try {
            // Logic for anonymous/ephemeral users could be handled here
            // For now assume userId exists or is a device ID

            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, created_at
        ) VALUES ($1, $2, 'refugee_aid', $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), 'active', $7, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.type === 'need' ? 'request' : 'offer',
                validated.category, // Title
                validated.description,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify({ urgency: validated.urgency, groupSize: validated.groupSize })
            ]);

            const id = res.rows[0].id;
            this.metrics.increment('refugee_aid.request_submitted', { category: validated.category });

            // Auto-match critical needs with nearby aid
            if (validated.urgency === 'critical') {
                // Trigger SMS alerts to verified NGOs or Hosts in radius
                // this.alertNearbyHelpers(validated); // Placeholder
            }

            return id;
        } finally {
            client.release();
        }
    }
}
