import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { GeoPoint } from '../types';

// ==================== EMERGENCY TYPES ====================
// Simplified for rapid parsing in crisis
export const EmergencyAlertSchema = z.object({
    userId: z.string(),
    type: z.enum(['water', 'food', 'medical', 'shelter', 'rescue', 'power']),
    description: z.string(),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    contact: z.string()
});

export const EmergencyOfferSchema = z.object({
    userId: z.string(),
    resources: z.array(z.string()), // ["Generator", "4x4 Truck", "First Aid"]
    capacity: z.number().optional(), // How many people can help/host
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    availableRadiusKm: z.number().default(5)
});

/**
 * Service for Emergency Response
 * "Immediate local response when infrastructure fails."
 */
export class EmergencyService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async broadcastAlert(alert: z.infer<typeof EmergencyAlertSchema>): Promise<string> {
        const validated = EmergencyAlertSchema.parse(alert);

        // 1. Save alert
        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, metadata, created_at
        ) VALUES ($1, 'request', 'emergency', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 'critical', $6, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.type.toUpperCase(),
                validated.description,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify({ contact: validated.contact })
            ]);
            const alertId = res.rows[0].id;

            this.metrics.increment('emergency.alert_broadcast', { type: validated.type });

            // 2. Find nearby offers (The logic for "Power Bank", "4x4", etc.)
            await this.matchAlertToOffers(alertId, validated);

            return alertId;
        } finally {
            client.release();
        }
    }

    async registerResource(offer: z.infer<typeof EmergencyOfferSchema>): Promise<string> {
        const validated = EmergencyOfferSchema.parse(offer);

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, created_at
        ) VALUES ($1, 'offer', 'emergency_resource', 'Emergency Resource', $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), 'active', $5, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.resources.join(', '),
                validated.location.lng,
                validated.location.lat,
                JSON.stringify({ radius: validated.availableRadiusKm, capacity: validated.capacity })
            ]);
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    private async matchAlertToOffers(alertId: string, alert: z.infer<typeof EmergencyAlertSchema>): Promise<void> {
        // Find nearby operational resources using PostGIS
        const client = await this.pg.connect();
        try {
            const res = await client.query(`
            SELECT id, user_id, description, details 
            FROM community_offers
            WHERE category = 'emergency_resource'
            AND status = 'active'
            AND ST_DWithin(
                location_geom, 
                ST_SetSRID(ST_MakePoint($1, $2), 4326), 
                (details->>'radius')::int * 1000
            ) 
        `, [alert.location.lng, alert.location.lat]);

            // In a real system, this would dispatch distinct Notifications/SMS to these users
            logger.info(`Found ${res.rowCount} potential helpers for Alert ${alertId}`);
        } finally {
            client.release();
        }
    }
}
