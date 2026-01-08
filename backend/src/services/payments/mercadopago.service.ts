
import { MercadoPagoConfig, Preference } from 'mercadopago';
import type { Pool } from 'pg';
import { logger } from '../../utils/logger';

export class MercadoPagoService {
    private client: MercadoPagoConfig;
    private pgPool: Pool;

    constructor(pgPool: Pool) {
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
        amountCents: number;
        title: string;
        domain: 'auto' | 'marketplace' | 'assets';
        city?: string;
    }) {
        const { userId, listingId, planId, amountCents, title, domain, city } = params;

        // 1. Create order in DB (Using our internal UUID for idempotency)
        const providerReference = crypto.randomUUID();

        const orderRes = await this.pgPool.query(`
            INSERT INTO boost_orders (
                provider, provider_reference, user_id, listing_id, domain, city, 
                boost_type, amount_cents, status
            )
            VALUES ('mercadopago', $1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING id
        `, [providerReference, userId, listingId, domain, city, planId, amountCents]);

        const orderId = orderRes.rows[0].id;

        const preference = new Preference(this.client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planId,
                        title: `Match-Auto Boost: ${title}`,
                        unit_price: amountCents / 100,
                        quantity: 1,
                        currency_id: 'MXN'
                    }
                ],
                external_reference: orderId, // Link back to our DB
                notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/success`,
                    failure: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/failure`,
                    pending: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/pending`
                },
                auto_return: 'approved'
            }
        });

        // 3. Update order with preference ID (provider_order_id)
        await this.pgPool.query(
            'UPDATE boost_orders SET provider_order_id = $1, checkout_url = $2 WHERE id = $3',
            [result.id, result.init_point, orderId]
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
        const externalReference = payment.external_reference; // This is our internal orderId
        const status = payment.status;

        if (status === 'approved') {
            await this.activateBoost(externalReference, id);
        } else {
            await this.pgPool.query(
                'UPDATE boost_orders SET status = $1 WHERE id = $2 AND status != $1',
                [status, externalReference]
            );
        }
    }

    private async activateBoost(orderId: string, providerPaymentId: string) {
        const client = await this.pgPool.connect();
        try {
            await client.query('BEGIN');

            const orderRes = await client.query('SELECT * FROM boost_orders WHERE id = $1', [orderId]);
            const order = orderRes.rows[0];

            if (!order || order.status === 'paid') {
                await client.query('ROLLBACK');
                return;
            }

            const durationDays = order.boost_type === 'diamond' ? 30 : (order.boost_type === 'premium' ? 7 : 1);
            const endsAt = new Date();
            endsAt.setDate(endsAt.getDate() + durationDays);

            await client.query(`
                UPDATE boost_orders 
                SET status = 'paid', paid_at = NOW(), provider_payment_id = $1
                WHERE id = $2
            `, [providerPaymentId, orderId]);

            await client.query(`
                INSERT INTO active_boosts (order_id, user_id, listing_id, domain, city, boost_type, ends_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (listing_id, boost_type) WHERE status = 'active'
                DO UPDATE SET ends_at = EXCLUDED.ends_at
            `, [orderId, order.user_id, order.listing_id, order.domain, order.city, order.boost_type, endsAt]);

            await client.query('COMMIT');
            logger.info(`[BOOST] Activated (MP) for ${order.listing_id}`);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('[BOOST] Activation (MP) failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
