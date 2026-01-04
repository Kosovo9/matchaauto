import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Env } from '../../../shared/types';
import { GlobalPriceNormalizer } from '../services/secret/GlobalIntelligence';

// Esquemas de validación
const ApiKeySchema = z.object({
    key: z.string().min(16)
});

const RateLimitSchema = z.object({
    requests: z.number().int().positive(),
    windowMs: z.number().int().positive(),
    remaining: z.number().int().nonnegative(),
    resetTime: z.string().datetime(),
});

// Tipos
type ApiKeyRecord = {
    id: string;
    name: string;
    isActive: boolean;
    permissions: string[];
    rateLimit: {
        requests: number;
        windowMs: number;
    };
};

type RateLimitState = {
    count: number;
    resetTime: number;
};

// Middleware de autenticación API Key
const apiKeyAuth = async (c: any, next: Function) => {
    const apiKey = c.req.header('X-Match-B2B-Key') || c.req.header('X-API-Key');

    if (!apiKey) {
        return c.json({
            success: false,
            error: 'API key required',
            code: 'MISSING_API_KEY',
        }, 401);
    }

    const env = c.env as Env;
    const kv = env.B2B_KEYS;

    if (!kv) {
        // Fallback para desarrollo si no hay KV configurado
        if (apiKey === 'LOCAL_DEBUG_KEY') {
            c.set('apiKey', { id: 'debug', name: 'Debug User', permissions: ['all'] });
            return await next();
        }
        return c.json({ error: 'B2B Service misconfigured' }, 500);
    }

    try {
        // 1. Buscar API key en KV
        const keyData = await kv.get(`key:${apiKey}`, 'json') as ApiKeyRecord | null;

        if (!keyData || !keyData.isActive) {
            return c.json({
                success: false,
                error: 'Invalid or inactive API key',
                code: 'INVALID_API_KEY',
            }, 401);
        }

        // 2. Verificar rate limiting (simplificado para Edge)
        const rateLimitKey = `ratelimit:${keyData.id}`;
        const now = Date.now();
        const state = await kv.get<RateLimitState>(rateLimitKey, 'json');

        if (state && now < state.resetTime) {
            if (state.count >= keyData.rateLimit.requests) {
                return c.json({ error: 'Rate limit exceeded' }, 429);
            }
            await kv.put(rateLimitKey, JSON.stringify({ count: state.count + 1, resetTime: state.resetTime }));
        } else {
            await kv.put(rateLimitKey, JSON.stringify({ count: 1, resetTime: now + keyData.rateLimit.windowMs }));
        }

        // 3. Setear contexto para la ruta
        c.set('apiKey', keyData);

        await next();
    } catch (error) {
        console.error('API key auth failed:', error);
        return c.json({ error: 'Authentication service unavailable' }, 503);
    }
};

const b2b = new Hono<{ Bindings: Env }>();

// Aplicar middleware de autenticación
b2b.use('*', apiKeyAuth);

// Endpoint para concesionarios y analistas
b2b.get('/market-data', async (c) => {
    return c.json({
        marketPulse: 'BULLISH',
        activeListings: 1250400,
        averagePriceSOL: 145.5,
        topGainsRegion: 'Global Edge',
        timestamp: new Date().toISOString()
    });
});

b2b.post('/normalize',
    zValidator('json', z.object({ price: z.number().positive() })),
    async (c) => {
        const { price } = c.req.valid('json');
        const normalized = await GlobalPriceNormalizer.normalize(price);
        return c.json(normalized);
    }
);

export default b2b;
