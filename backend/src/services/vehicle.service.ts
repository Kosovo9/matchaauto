import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const VehicleSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2),
    description: z.string().optional(),
    type: z.enum(['AUTO', 'AUTOBUS', 'LANCHA', 'AVION', 'MOTO', 'BLINDADO', 'CAMION', 'BICICLETA', 'CUATRIMOTO', 'TRACTOR']),
    subtype: z.string().optional(),
    brand: z.string(),
    model: z.string(),
    year: z.number().min(1900).max(2100),
    price: z.number().min(0),
    currency: z.string().default('COP'),
    status: z.enum(['DISPONIBLE', 'VENDIDO', 'ALQUILADO', 'REPARACION', 'RESERVADO']).default('DISPONIBLE'),
    sellerId: z.string().uuid(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string()
    })
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export class VehicleService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async createVehicle(data: Vehicle): Promise<any> {
        const validated = VehicleSchema.parse(data);
        const client = await this.pool.connect();

        try {
            const query = `
        INSERT INTO vehicles (
          name, description, type, subtype, brand, model, year, price, price_currency,
          status, seller_id, latitude, longitude, address, city, state_province, country
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id;
      `;

            const params = [
                validated.name, validated.description, validated.type, validated.subtype,
                validated.brand, validated.model, validated.year, validated.price, validated.currency,
                validated.status, validated.sellerId, validated.location.latitude, validated.location.longitude,
                validated.location.address, validated.location.city, validated.location.state, validated.location.country
            ];

            const result = await client.query(query, params);
            logger.info(`Vehicle created with ID: ${result.rows[0].id}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Failed to create vehicle:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getVehicleById(id: string): Promise<any> {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM vehicles WHERE id = $1', [id]);
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }

    async listVehicles(filters: any = {}, pagination = { limit: 20, offset: 0 }): Promise<any> {
        const client = await this.pool.connect();
        try {
            let query = 'SELECT * FROM vehicles WHERE 1=1';
            const params: any[] = [];
            let paramIndex = 1;

            if (filters.type) {
                query += ` AND type = $${paramIndex++}`;
                params.push(filters.type);
            }

            if (filters.brand) {
                query += ` AND brand = $${paramIndex++}`;
                params.push(filters.brand);
            }

            if (filters.maxPrice) {
                query += ` AND price <= $${paramIndex++}`;
                params.push(filters.maxPrice);
            }

            query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
            params.push(pagination.limit, pagination.offset);

            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    }
}
