import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { GeoPoint } from '../types';

export const ToolShareSchema = z.object({
    userId: z.string(),
    toolType: z.string(), // "Tractor", "Soldadora", "Dron"
    description: z.string(),
    availability: z.object({
        days: z.array(z.number()), // 0=Sun, 1=Mon
        hours: z.string() // "09:00-17:00"
    }),
    terms: z.string(), // "Trueque por mano de obra", "Combustible"
    location: z.object({
        lat: z.number(),
        lng: z.number()
    })
});

/**
 * Service for Shared Tools
 * "Maximizar el uso de recursos escasos."
 */
export class ToolShareService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async registerTool(tool: z.infer<typeof ToolShareSchema>): Promise<string> {
        const validated = ToolShareSchema.parse(tool);

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, created_at
        ) VALUES ($1, 'offer', 'shared_tool', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 'active', $6, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.toolType,
                `${validated.description}. Condiciones: ${validated.terms}`,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify({ availability: validated.availability })
            ]);

            this.metrics.increment('tool_share.registered', { type: validated.toolType });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }
}
