import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { GeoPoint } from '../types';

// ==================== MEDICINAL PLANT TYPES ====================
export const MedicinalPlantSchema = z.object({
    userId: z.string(), // Guardian of knowledge
    commonName: z.string(), // "Gobernadora"
    scientificName: z.string().optional(), // "Larrea tridentata"
    region: z.string(), // "Chihuahua"
    uses: z.array(z.object({
        ailment: z.string(),
        preparation: z.string(),
        dosage: z.string().optional()
    })),
    conservationStatus: z.enum(['abundant', 'regulated', 'endangered', 'cultivated']),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    availableForExchange: z.boolean().default(true) // Seeds or dried leaves
});

export type MedicinalPlant = z.infer<typeof MedicinalPlantSchema>;

/**
 * Service for Medicinal Plants Catalog
 * "Ancestral wisdom healing communities."
 */
export class MedicinalPlantsService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async registerPlant(plant: MedicinalPlant): Promise<string> {
        const validated = MedicinalPlantSchema.parse(plant);

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, metadata, created_at
        ) VALUES ($1, 'knowledge', 'medicinal_plants', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 'active', $6, $7, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.commonName,
                validated.scientificName || 'Unknown Scientific Name',
                validated.location.lng,
                validated.location.lat,
                JSON.stringify(validated.uses),
                JSON.stringify({ region: validated.region, conservation: validated.conservationStatus })
            ]);

            this.metrics.increment('medicinal_plants.registered', { region: validated.region });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    async findPlantsByAilment(region: string, ailmentKeyword: string): Promise<any[]> {
        // Search within the JSONB array of uses
        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        SELECT * FROM community_offers
        WHERE category = 'medicinal_plants'
        AND metadata->>'region' = $1
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(details) AS use
          WHERE use->>'ailment' ILIKE $2
        )
      `, [region, `%${ailmentKeyword}%`]);
            return res.rows;
        } finally {
            client.release();
        }
    }
}
