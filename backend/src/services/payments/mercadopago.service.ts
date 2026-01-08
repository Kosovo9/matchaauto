
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { Pool } from 'pg';
import { logger } from '../../utils/logger';

export class MercadoPagoService {
    private client: MercadoPagoConfig;
    private pgPool: Pool;

    constructor(pgPool: Pool) {
        // Use test token from environment or fallback to user-provided one
        const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
        this.client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
        this.pgPool = pgPool;
    }

    /**
     * 🚀 Create a Checkout Preference
     */
    async createBoostPreference(params: {
        userId: string;
        listingId: string;
        planId: string;
        amount: number;
        title: string;
    }) {
        const { userId, listingId, planId, amount, title } = params;

        // 1. Create order in DB (Pending)
        const orderQuery = `
            INSERT INTO boost_orders (user_id, listing_id, plan_id, amount, provider, status)
            VALUES ($1, $2, $3, $4, 'mercadopago', 'pending')
            RETURNING id
        `;
        const orderRes = await this.pgPool.query(orderQuery, [userId, listingId, planId, amount]);
        const orderId = orderRes.rows[0].id;

        // 2. Build MP Preference
        const preference = new Preference(this.client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `Match-Auto Boost: ${title}`,
                        unit_price: amount,
                        quantity: 1,
                        currency_id: 'MXN'
                    }
                ],
                external_reference: orderId,
                notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/success`,
                    failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/failure`,
                    pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/pending`
                },
                auto_return: 'approved'
            }
        });

        // 3. Update order with preference ID (provider_ref)
        await this.pgPool.query(
            'UPDATE boost_orders SET provider_ref = $1 WHERE id = $2',
            [result.id, orderId]
        );

        return {
            preferenceId: result.id,
            initPoint: result.init_point,
            orderId
        };
    }

    /**
     * 🔔 Webhook Handler
     */
    async handleWebhook(topic: string, id: string) {
        if (topic !== 'payment') return;

        logger.info(`[MP Webhook] Processing payment ID: ${id}`);

        // 1. Verify Payment with MP API
        // In v2, we might need to use generic fetch or the Payment class
        // Let's use fetch for safety/clarity as the SQL logic is what matters most
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
            headers: {
                Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
            }
        });

        if (!mpRes.ok) {
            logger.error(`[MP Webhook] Failed to fetch payment ${id}`);
            return;
        }

        const payment = await mpRes.json();
        const externalReference = payment.external_reference; // This is our orderId
        const status = payment.status;

        if (status === 'approved') {
            await this.activateBoost(externalReference, id);
        } else {
            logger.warn(`[MP Webhook] Payment ${id} status: ${status}`);
            await this.pgPool.query(
                'UPDATE boost_orders SET status = $1 WHERE id = $2',
                [status, externalReference]
            );
        }
    }

    private async activateBoost(orderId: string, providerPaymentId: string) {
        const client = await this.pgPool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get order details
            const orderRes = await client.query('SELECT * FROM boost_orders WHERE id = $1', [orderId]);
            const order = orderRes.rows[0];

            if (!order || order.status === 'paid') {
                await client.query('ROLLBACK');
                return;
            }

            // 2. Mark order as paid
            const durationDays = order.plan_id === 'diamond' ? 30 : (order.plan_id === 'premium' ? 7 : 1);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + durationDays);

            await client.query(`
                UPDATE boost_orders 
                SET status = 'paid', paid_at = NOW(), expires_at = $1
                WHERE id = $2
            `, [expiresAt, orderId]);

            // 3. Create/Update the active boost
            await client.query(`
                INSERT INTO boosts (listing_id, user_id, placement, expires_at, order_id)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (listing_id) DO UPDATE SET 
                    expires_at = EXCLUDED.expires_at,
                    status = 'active'
            `, [order.listing_id, order.user_id, 'featured', expiresAt, orderId]);

            await client.query('COMMIT');
            logger.info(`[BOOST] Activated for listing ${order.listing_id} until ${expiresAt.toISOString()}`);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('[BOOST] Activation failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
