import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../utils/metrics-collector';
import { GeoPoint } from '../types';

export const LivestockBreedSchema = z.object({
    userId: z.string(),
    species: z.string(), // "Cabra", "Cerdo", "Gallina"
    breedName: z.string(), // "Criolla Chihuahuense", "Pelón Mexicano"
    traits: z.array(z.string()), // ["Resistente sequía", "Pone todo el año"]
    availableFor: z.enum(['sale', 'barter', 'breeding_loan']),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    })
});

/**
 * Service for Native Livestock Catalog
 * "Genética resiliente para tiempos difíciles."
 */
export class NativeLivestockService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    async registerBreed(breed: z.infer<typeof LivestockBreedSchema>): Promise<string> {
        const validated = LivestockBreedSchema.parse(breed);

        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        INSERT INTO community_offers (
          user_id, type, category, title, description, location_geom, status, details, created_at
        ) VALUES ($1, 'offer', 'native_livestock', $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), 'active', $6, NOW())
        RETURNING id
      `, [
                validated.userId,
                `${validated.breedName} (${validated.species})`,
                `Rasgos: ${validated.traits.join(', ')}`,
                validated.location.lng,
                validated.location.lat,
                JSON.stringify({ availableFor: validated.availableFor })
            ]);

            this.metrics.increment('livestock.registered', { species: validated.species });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }
}
