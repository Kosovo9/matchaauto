
import type { Pool } from 'pg';
import { logger } from '../../utils/logger';

export class PayPalService {
    private clientId: string;
    private clientSecret: string;
    private baseUrl: string;
    private pgPool: Pool;

    constructor(pgPool: Pool) {
        this.clientId = process.env.PAYPAL_CLIENT_ID || '';
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
        this.baseUrl = process.env.PAYPAL_ENV === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
        this.pgPool = pgPool;
    }

    private async getAccessToken(): Promise<string> {
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to obtain PayPal access token');
        }

        const data: any = await response.json();
        return data.access_token;
    }

    /**
     * 🚀 Create PayPal Order (v2)
     */
    async createBoostOrder(params: {
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
            VALUES ('paypal', $1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING id
        `, [providerReference, userId, listingId, domain, city, planId, amountCents]);

        const orderId = orderRes.rows[0].id;

        // 2. Create PayPal Order
        const token = await this.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': orderId // 🛡️ Idempotency
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: orderId,
                    amount: {
                        currency_code: 'MXN',
                        value: (amountCents / 100).toFixed(2)
                    },
                    description: `Boost: ${title}`,
                    custom_id: orderId // 🔗 Link back to our DB
                }],
                application_context: {
                    return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/success?provider=paypal`,
                    cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/boosts/failure?provider=paypal`,
                    user_action: 'PAY_NOW'
                }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            logger.error('[PayPal] Create Order failed:', err);
            throw new Error('PayPal Order creation failed');
        }

        const paypalOrder: any = await response.json();
        const approveUrl = paypalOrder.links.find((l: any) => l.rel === 'payer_action' || l.rel === 'approve')?.href;

        // 3. Update order with provider_order_id
        await this.pgPool.query(
            'UPDATE boost_orders SET provider_order_id = $1, checkout_url = $2 WHERE id = $3',
            [paypalOrder.id, approveUrl, orderId]
        );

        return {
            orderId,
            paypalOrderId: paypalOrder.id,
            approveUrl
        };
    }

    /**
     * ✅ Capture PayPal Order (Instant UX)
     */
    async captureOrder(paypalOrderId: string) {
        const token = await this.getAccessToken();
        const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const err = await response.text();
            logger.error('[PayPal] Capture Order failed:', err);
            return { success: false, error: 'Capture failed or already completed' };
        }

        const captureData: any = await response.json();
        const orderId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;
        const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

        if (captureData.status === 'COMPLETED' && orderId) {
            await this.activateBoost(orderId, paypalOrderId, captureId);
            return { success: true };
        }

        return { success: false, status: captureData.status };
    }

    /**
     * 🔔 Webhook Handler (Source of Truth)
     */
    async handleWebhook(headers: Record<string, string>, body: any) {
        const isVerified = await this.verifySignature(headers, body);
        if (!isVerified) {
            logger.warn('[PayPal Webhook] Signature verification failed');
            return;
        }

        const eventType = body.event_type;
        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const capture = body.resource;
            const orderId = capture.custom_id;
            const paypalOrderId = body.resource.supplementary_data?.related_ids?.order_id || capture.id;
            const captureId = capture.id;

            if (orderId) {
                await this.activateBoost(orderId, paypalOrderId, captureId);
            }
        }
    }

    private async verifySignature(headers: Record<string, string>, body: any): Promise<boolean> {
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) return false;

        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transmission_id: headers['paypal-transmission-id'],
                    transmission_time: headers['paypal-transmission-time'],
                    cert_url: headers['paypal-cert-url'],
                    auth_algo: headers['paypal-auth-algo'],
                    transmission_sig: headers['paypal-transmission-sig'],
                    webhook_id: webhookId,
                    webhook_event: body
                })
            });

            const result: any = await response.json();
            return result.verification_status === 'SUCCESS';
        } catch (error) {
            return false;
        }
    }

    private async activateBoost(orderId: string, paypalOrderId: string, captureId: string) {
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
                SET status = 'paid', paid_at = NOW(), provider_payment_id = $1, provider_order_id = $2
                WHERE id = $3
            `, [captureId, paypalOrderId, orderId]);

            await client.query(`
                INSERT INTO active_boosts (order_id, user_id, listing_id, domain, city, boost_type, ends_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (listing_id, boost_type) WHERE status = 'active'
                DO UPDATE SET ends_at = EXCLUDED.ends_at
            `, [orderId, order.user_id, order.listing_id, order.domain, order.city, order.boost_type, endsAt]);

            await client.query('COMMIT');
            logger.info(`[BOOST] Activated (PayPal) for ${order.listing_id}`);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
