import { Context, Next } from 'hono';
import { sha256 } from 'crypto-hash';

export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skip?: (c: Context) => boolean | Promise<boolean>;
    keyGenerator?: (c: Context) => string | Promise<string>;
    handler?: (c: Context) => Response | Promise<Response>;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
}

// Durable Object para Rate Limiting distribuido
export class RateLimitStore {
    private state: DurableObjectState;

    constructor(state: DurableObjectState) {
        this.state = state;
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/check' && request.method === 'POST') {
            const { windowMs, maxRequests } = await request.json() as any;
            return this.handleCheck(windowMs, maxRequests);
        }

        return new Response('Not found', { status: 404 });
    }

    private async handleCheck(windowMs: number, maxRequests: number): Promise<Response> {
        const now = Date.now();
        const windowStart = now - windowMs;

        // Obtener historial de requests
        let history = await this.state.storage.get<number[]>('history') || [];

        // Filtrar requests fuera de la ventana
        history = history.filter(timestamp => timestamp > windowStart);

        // Verificar límite
        if (history.length >= maxRequests) {
            const oldestRequest = history[0];
            const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);

            return Response.json({
                success: false,
                limit: maxRequests,
                remaining: 0,
                reset: oldestRequest + windowMs,
                retryAfter
            });
        }

        // Agregar request actual
        history.push(now);
        await this.state.storage.put('history', history);

        return Response.json({
            success: true,
            limit: maxRequests,
            remaining: maxRequests - history.length,
            reset: now + windowMs
        });
    }
}

// Middleware de rate limiting
export const rateLimit = (config: RateLimitConfig) => {
    return async (c: Context, next: Next) => {
        if (config.skip && (await config.skip(c))) {
            return next();
        }

        const keyGenerator = config.keyGenerator || defaultKeyGenerator;
        const key = await keyGenerator(c);

        const store = (c.env as any).RATE_LIMIT_STORE as DurableObjectNamespace;
        if (!store) {
            console.warn('RATE_LIMIT_STORE DO not configured, skipping rate limit');
            return next();
        }

        const id = store.idFromName(key);
        const stub = store.get(id);

        const res = await stub.fetch('https://internal/check', {
            method: 'POST',
            body: JSON.stringify({ windowMs: config.windowMs, maxRequests: config.maxRequests })
        });

        const result = await res.json() as any;

        if (!result.success) {
            if (config.handler) return config.handler(c);

            return c.json({
                success: false,
                error: 'Too many requests',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: result.retryAfter
            }, 429);
        }

        await next();
    };
};

const defaultKeyGenerator = async (c: Context): Promise<string> => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    const path = c.req.path;
    const key = `${ip}:${path}`;
    return sha256(key);
};

export const rateLimitConfigs = {
    moderate: {
        windowMs: 60000,
        maxRequests: 100,
    }
};
