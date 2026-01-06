import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { Mutex } from 'async-mutex';
import axios from 'axios';

// ==================== ZOD SCHEMAS ====================
export const PaymentIntentSchema = z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'MXN', 'GBP']),
    provider: z.enum(['stripe', 'paypal', 'mercadopago']),
    metadata: z.record(z.any()).optional(),
    idempotencyKey: z.string().min(10)
});

export const TransactionSchema = z.object({
    id: z.string(),
    status: z.enum(['pending', 'completed', 'failed', 'refunded']),
    gatewayId: z.string().optional(),
    amount: z.number(),
    currency: z.string(),
    createdAt: z.date()
});

// ==================== PAYMENT SERVICE ====================
export class PaymentService {
    private redis: Redis;
    private pgPool: Pool;
    private circuitBreakers: Map<string, CircuitBreaker>;
    private mutex: Mutex;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.mutex = new Mutex();
        this.circuitBreakers = new Map();

        // Circuit Breakers for each provider
        ['stripe', 'paypal', 'mercadopago'].forEach(p => {
            this.circuitBreakers.set(p, new CircuitBreaker({
                failureThreshold: 5,
                timeout: 10000
            }));
        });
    }

    // CORE: Create a Payment Intent (Request to pay)
    async createPaymentIntent(data: z.infer<typeof PaymentIntentSchema>): Promise<{ clientSecret: string; transactionId: string }> {
        const release = await this.mutex.acquire(); // Lock critical section
        try {
            const validated = PaymentIntentSchema.parse(data);

            // 1. Idempotency Check (Redis)
            const seenKey = `payment:idempotency:${validated.idempotencyKey}`;
            const cached = await this.redis.get(seenKey);
            if (cached) {
                logger.info(`Idempotency hit for ${validated.idempotencyKey}`);
                return JSON.parse(cached);
            }

            // 2. DB Record Creation (Pending)
            const client = await this.pgPool.connect();
            let transactionId = '';
            try {
                const res = await client.query(`
                  INSERT INTO transactions (user_id, amount, currency, provider, status, idempotency_key, metadata)
                  VALUES ($1, $2, $3, $4, 'pending', $5, $6)
                  RETURNING id
              `, [validated.userId, validated.amount, validated.currency, validated.provider, validated.idempotencyKey, validated.metadata]);
                transactionId = res.rows[0].id;
            } finally {
                client.release();
            }

            // 3. Call Provider Gateways (Mocked implementation for different providers)
            const response = await this.circuitBreakers.get(validated.provider)!.execute(async () => {
                if (validated.provider === 'stripe') {
                    // Mock Stripe Intent Creation
                    // await stripe.paymentIntents.create({...})
                    return { clientSecret: `pi_mock_${transactionId}_secret`, gatewayId: `pi_mock_${transactionId}` };
                } else if (validated.provider === 'mercadopago') {
                    // Mock MercadoPago
                    return { clientSecret: `pref_mock_${transactionId}`, gatewayId: `mp_mock_${transactionId}` };
                }
                return { clientSecret: 'mock_secret', gatewayId: 'mock_gateway_id' };
            });

            // 4. Update Gateway ID
            await this.pgPool.query('UPDATE transactions SET gateway_id = $1 WHERE id = $2', [response.gatewayId, transactionId]);

            const result = { clientSecret: response.clientSecret, transactionId };

            // 5. Cache for Idempotency (24 hours)
            await this.redis.setex(seenKey, 86400, JSON.stringify(result));

            metrics.increment('payments.created', { provider: validated.provider });
            return result;

        } catch (e: any) {
            logger.error('Payment intent creation failed', e);
            metrics.increment('payments.failed', { reason: 'creation_error' });
            throw e;
        } finally {
            release();
        }
    }

    // WEBHOOK: Handle provider callbacks
    async handleWebhook(provider: string, payload: any, signature: string) {
        // 1. Verify Signature (Crucial Security)
        if (!this.verifySignature(provider, payload, signature)) {
            throw new Error('Invalid signature');
        }

        // 2. Extract Status
        let status: 'completed' | 'failed' = 'failed';
        let gatewayId = '';

        if (provider === 'stripe') {
            if (payload.type === 'payment_intent.succeeded') status = 'completed';
            gatewayId = payload.data.object.id;
        }

        // 3. Update Transaction & Trigger Post-Payment Actions
        if (gatewayId) {
            await this.updateTransactionStatus(gatewayId, status);
            if (status === 'completed') {
                await this.triggerFulfillment(gatewayId);
            }
        }
    }

    private async updateTransactionStatus(gatewayId: string, status: string) {
        await this.pgPool.query(`UPDATE transactions SET status = $1, updated_at = NOW() WHERE gateway_id = $2`, [status, gatewayId]);
    }

    private async triggerFulfillment(gatewayId: string) {
        // Logic to unlock the car booking, activate the ad, etc.
        // This usually publishes an event to Redis/EventBus
        // await this.eventBus.publish('payment.succeeded', { gatewayId });
        logger.info(`Fulfilling order for payment ${gatewayId}`);

        // Example: Check if it was an Ad Booking
        const res = await this.pgPool.query('SELECT metadata FROM transactions WHERE gateway_id = $1', [gatewayId]);
        const meta = res.rows[0]?.metadata;

        if (meta?.type === 'ad_booking') {
            await this.pgPool.query("UPDATE ad_campaigns SET status = 'active' WHERE id = $1", [meta.campaignId]);
            // Invalidate Ad Cache
            await this.redis.del('ads:active:home'); // simplified invalidation
        }
    }

    private verifySignature(provider: string, payload: any, signature: string): boolean {
        // Real verify logic here using crypto and provider SDKs
        return true;
    }
}
