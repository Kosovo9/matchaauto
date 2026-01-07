import { Request, Response, NextFunction } from 'express';
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
    async createPaymentIntent(req: Request, res: Response) {
        const start = Date.now();
        try {
            const validated = PaymentIntentSchema.parse(req.body);

            const result = await this.paymentService.createPaymentIntent(validated);

            metrics.timing('payment.intent_creation_latency', Date.now() - start);
            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/payments/webhook/:provider
    async handleWebhook(req: Request, res: Response) {
        try {
            const { provider } = req.params;
            const signature = req.headers['stripe-signature'] || req.headers['x-paypal-signature'] || '';

            await this.paymentService.handleWebhook(provider, req.body, signature as string);

            res.json({ received: true });
        } catch (error) {
            logger.error(`Webhook Handling Error (${req.params.provider})`, error);
            res.status(400).json({ error: 'Webhook processing failed' });
        }
    }

    private handleError(error: any, res: Response) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
        } else {
            logger.error('Payment Controller Error', error);
            res.status(500).json({ success: false, error: 'Payment Processing Failed' });
        }
    }
}
