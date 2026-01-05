import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const payments = new Hono<{ Bindings: Env }>();

const paymentSchema = z.object({
    itemId: z.string(),
    provider: z.enum(['PayPal', 'MercadoPago', 'Solana']),
    amount: z.number(),
    currency: z.string().default('USD')
});

payments.post('/create-preference', zValidator('json', paymentSchema), async (c) => {
    const { itemId, provider, amount } = c.req.valid('json');

    const transactionId = crypto.randomUUID();

    // Simulating Real Gateway Response
    const SUCCESS_URL = `https://match-auto.netlify.app/checkout/success?tx=${transactionId}`;

    let redirectUrl = SUCCESS_URL;
    if (provider === 'PayPal') {
        redirectUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${transactionId}`;
    } else if (provider === 'MercadoPago') {
        redirectUrl = `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${transactionId}`;
    } else {
        // Solana doesn't need a redirectUrl if handled frontend, but we track it.
        redirectUrl = `/checkout/solana?item=${itemId}`;
    }

    return c.json({
        success: true,
        data: {
            transactionId,
            status: 'PENDING',
            redirectUrl,
            provider,
            amount,
            timestamp: new Date().toISOString()
        }
    });
});

payments.post('/verify-solana', async (c) => {
    const { signature } = await c.req.json();
    // Here we would use @solana/web3.js on the backend to verify the signature
    // For now we trust the client (demo mode) but provide the endpoint.
    return c.json({
        success: true,
        status: 'CONFIRMED',
        signature
    });
});

export default payments;
