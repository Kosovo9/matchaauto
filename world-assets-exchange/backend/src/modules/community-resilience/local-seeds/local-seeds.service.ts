import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { BaseOfferSchema, GeoPoint } from '../types';

// ==================== SEED TYPES ====================
export const SeedVarietySchema = z.object({
    userId: z.string(),
    name: z.string(), // "Maíz Concho"
    species: z.string(), // "Zea mays"
    region: z.string(), // "Chihuahua"
    characteristics: z.object({
        droughtResistant: z.boolean(),
        frostResistant: z.boolean(),
        growthDays: z.number(),
        yieldPerHectare: z.number().optional()
    }),
    uses: z.array(z.string()), // ["tortilla", "forraje", "pozole"]
    quantityAvailable: z.string(), // "500 semillas", "2kg"
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    exchangeFor: z.string().optional() // What they want in return
});

export type SeedVariety = z.infer<typeof SeedVarietySchema>;

/**
 * Service for Local Seeds Catalog
 * "Preserving biodiversity and food sovereignty."
 */
export class LocalSeedsService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async registerSeed(seed: SeedVariety): Promise<string> {
        const validated = SeedVarietySchema.parse(seed);

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, metadata, created_at
        ) VALUES ($1, 'goods', 'local_seeds', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 'active', $6, $7, NOW())
        RETURNING id
      `, [
                validated.userId,
                validated.name,
                `Especies: ${validated.species}. Usos: ${validated.uses.join(', ')}`,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify(validated.characteristics),
                JSON.stringify({ region: validated.region, quantity: validated.quantityAvailable })
            ]);

            this.metrics.increment('local_seeds.registered', { species: validated.species });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    async findSeedsByCharacteristics(region: string, characteristics: Partial<SeedVariety['characteristics']>): Promise<any[]> {
        // Search logic using JSONB containment for characteristics
        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        SELECT * FROM community_offers 
        WHERE category = 'local_seeds' 
        AND metadata->>'region' = $1
        AND details @> $2
      `, [region, JSON.stringify(characteristics)]);

            return res.rows;
        } finally {
            client.release();
        }
    }
}
