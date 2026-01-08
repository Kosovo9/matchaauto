
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
        amount: number;
        title: string;
    }) {
        const { userId, listingId, planId, amount, title } = params;

        // 1. Create order in DB (Pending)
        const orderRes = await this.pgPool.query(`
            INSERT INTO boost_orders (user_id, listing_id, plan_id, amount, provider, status)
            VALUES ($1, $2, $3, $4, 'paypal', 'pending')
            RETURNING id
        `, [userId, listingId, planId, amount]);
        const orderId = orderRes.rows[0].id;

        // 2. Create PayPal Order
        const token = await this.getAccessToken();
        const requestId = orderId; // Use our UUID as idempotency key for PayPal

        const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': requestId // 🛡️ PayPal-Idempotency
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: orderId,
                    amount: {
                        currency_code: 'MXN',
                        value: amount.toString()
                    },
                    description: `Boost: ${title}`,
                    custom_id: orderId // 🔗 Link to our DB record
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

        // 3. Update order with provider_ref
        await this.pgPool.query(
            'UPDATE boost_orders SET provider_ref = $1 WHERE id = $2',
            [paypalOrder.id, orderId]
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
                // No PayPal-Request-Id needed here as capture is usually the final step
            }
        });

        if (!response.ok) {
            const err = await response.text();
            logger.error('[PayPal] Capture Order failed:', err);
            return { success: false, error: 'Capture failed or already completed' };
        }

        const captureData: any = await response.json();
        // custom_id is where we stored our internal orderId
        const orderId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id;

        if (captureData.status === 'COMPLETED' && orderId) {
            await this.activateBoost(orderId, paypalOrderId);
            return { success: true };
        }

        return { success: false, status: captureData.status };
    }

    /**
     * 🔔 Webhook Handler (Source of Truth)
     */
    async handleWebhook(headers: Record<string, string>, body: any) {
        // 1. Verify Signature (Bulletproof)
        const isVerified = await this.verifySignature(headers, body);
        if (!isVerified) {
            logger.warn('[PayPal Webhook] Signature verification failed');
            return;
        }

        const eventType = body.event_type;
        logger.info(`[PayPal Webhook] Processing event: ${eventType}`);

        if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const capture = body.resource;
            const orderId = capture.custom_id; // Our internal UUID
            const paypalOrderId = body.resource.supplementary_data?.related_ids?.order_id || capture.id;

            if (orderId) {
                await this.activateBoost(orderId, paypalOrderId);
            }
        }
    }

    private async verifySignature(headers: Record<string, string>, body: any): Promise<boolean> {
        const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        if (!webhookId) {
            logger.error('PAYPAL_WEBHOOK_ID is missing - skipping verification');
            return false;
        }

        try {
            const token = await this.getAccessToken();
            const response = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
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
            logger.error('[PayPal Webhook] Verification error:', error);
            return false;
        }
    }

    private async activateBoost(orderId: string, providerRef: string) {
        const client = await this.pgPool.connect();
        try {
            await client.query('BEGIN');

            // 1. Get order details & check if already paid (Idempotency)
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
                SET status = 'paid', paid_at = NOW(), expires_at = $1, provider_ref = $2
                WHERE id = $3
            `, [expiresAt, providerRef, orderId]);

            // 3. Create/Update the active boost
            await client.query(`
                INSERT INTO boosts (listing_id, user_id, placement, expires_at, order_id)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (listing_id) DO UPDATE SET 
                    expires_at = EXCLUDED.expires_at,
                    status = 'active'
            `, [order.listing_id, order.user_id, 'featured', expiresAt, orderId]);

            await client.query('COMMIT');
            logger.info(`[BOOST] Activated (PayPal) for listing ${order.listing_id} until ${expiresAt.toISOString()}`);
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('[BOOST] Activation (PayPal) failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
