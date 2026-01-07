import { Context } from 'hono';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { PaymentService, PaymentIntentSchema } from '../services/payment.service';
import Redis from 'ioredis';
import { Pool } from 'pg';

/**
 * @controller PaymentController
 * @description Controller for Payment Processing (Stripe, PayPal, etc.)
 */

export class PaymentController {
    private paymentService: PaymentService;

    constructor(redisClient: Redis, pgPool: Pool) {
        this.paymentService = new PaymentService(redisClient, pgPool);
    }

    // POST /api/v1/payments/intent
    async createPaymentIntent(c: Context) {
        const start = Date.now();
        try {
            const body = await c.req.json();
            const validated = PaymentIntentSchema.parse(body);

            const result = await this.paymentService.createPaymentIntent(validated);

            metrics.timing('payment.intent_creation_latency', Date.now() - start);
            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    // POST /api/v1/payments/webhook/:provider
    async handleWebhook(c: Context) {
        try {
            const provider = c.req.param('provider');
            const signature = c.req.header('stripe-signature') || c.req.header('x-paypal-signature') || '';

            // Note: Hono's req.json() works async. For Webhooks, usually raw body is needed for signature verification
            // Assuming service handles parsing or we pass raw body if needed.
            // For now, passing parsed JSON.
            const body = await c.req.json();

            await this.paymentService.handleWebhook(provider, body, signature);

            return c.json({ received: true });
        } catch (error) {
            logger.error(`Webhook Handling Error (${c.req.param('provider')})`, error);
            return c.json({ error: 'Webhook processing failed' }, 400);
        }
    }

    private handleError(error: any, c: Context) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: (error as z.ZodError).errors }, 400);
        } else {
            logger.error('Payment Controller Error', error);
            return c.json({ success: false, error: 'Payment Processing Failed' }, 500);
        }
    }
}
