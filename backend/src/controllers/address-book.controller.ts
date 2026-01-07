import { Context } from 'hono';
import { AddressValidationService } from '../services/address-validation.service';
import { Pool } from 'pg';
import { logger } from '../utils/logger';

export class AddressBookController {
    private validationService: AddressValidationService;
    private pgPool: Pool;

    constructor(validationService: AddressValidationService, pgPool: Pool) {
        this.validationService = validationService;
        this.pgPool = pgPool;
    }

    /**
     * Guarda una dirección verificada en la libreta del usuario
     */
    saveAddress = async (c: Context) => {
        try {
            const { userId, label, address } = await c.req.json();

            // 1. Validate and Normalize
            const validation = await this.validationService.validateAddress({
                address: {
                    street: typeof address === 'string' ? address : (address.street || ''),
                    city: address.city || '',
                    state: address.state || '',
                    postalCode: address.postalCode || '',
                    country: address.country || 'MX'
                }
            });

            if (!validation.valid) return c.json({ success: false, error: 'Invalid address', issues: validation.issues }, 400);

            // 2. Save to DB
            const client = await this.pgPool.connect();
            try {
                const query = `
          INSERT INTO user_addresses (user_id, label, full_address, lat, lng, is_reliable)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id;
        `;
                const result = await client.query(query, [
                    userId,
                    label,
                    validation.address.formattedAddress || validation.address.street,
                    validation.address.latitude,
                    validation.address.longitude,
                    validation.score > 0.8
                ]);
                return c.json({ success: true, id: result.rows[0].id });
            } finally {
                client.release();
            }
        } catch (error) {
            logger.error('Save address failed:', error);
            return c.json({ success: false, error: 'Failed to save address' }, 500);
        }
    };

    /**
     * Lista direcciones guardadas
     */
    list = async (c: Context) => {
        const userId = c.req.query('userId');
        const client = await this.pgPool.connect();
        try {
            const result = await client.query('SELECT * FROM user_addresses WHERE user_id = $1', [userId]);
            return c.json({ success: true, data: result.rows });
        } finally {
            client.release();
        }
    };
}
