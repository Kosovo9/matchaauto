import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

// Internal Imports
import { sentinelMiddleware } from './middleware/security'
import { protectRoute } from './middleware/auth'
import { PaymentOrchestrator } from './services/payments/engine'
import { AIOrchestrator } from './services/ai/engine'
import { EdgeCacheSupercharger } from './features/01_performance/edge-cache-supercharger'
import { SelfHealingSystem } from './features/04_automation/self-healing-system'
import { Env, ApiResponse } from '../../shared/types'

// Advanced Middlewares
import { rateLimit, rateLimitConfigs, RateLimitStore } from './middleware/rateLimiter'
import { createMonitor } from './lib/monitoring'
import { compression } from './middleware/compression'
import { validateEnv } from './lib/env'

// Route Imports
import listings from './routes/listings'
import viral from './routes/viral'
import b2b from './routes/b2b'

// Secret & Specialized Services
import { PulseEngine } from './services/secret/Pulse'
import { HeatmapGenerator } from './services/secret/Heatmap'
import { HyperCrawler } from './services/secret/HyperCrawler'
import { DopamineEngine } from './services/secret/DopamineEngine'
import { GhostNegotiator } from './services/secret/GhostNegotiator'
import { OnChainReputation } from './services/secret/GlobalIntelligence'
import { createCryptoWallet } from './services/CryptoWallet'

// Exporting Durable Objects
export { ChatRoom } from './chat/durable'
export { RateLimitStore }

const app = new Hono<{ Bindings: Env & { RATE_LIMIT_STORE: DurableObjectNamespace } }>()

// 1. Core Security & Middleware
app.use('*', secureHeaders())
app.use('*', cors({
    origin: (origin) => {
        const allowedOrigins = [
            'https://match-auto.pages.dev',
            'https://match-auto.com',
            'http://localhost:3000'
        ]
        return allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
    },
    credentials: true,
}))

// Tracing & Monitoring Middleware
app.use('*', async (c, next) => {
    // Validate Environment first
    try {
        const validatedEnv = validateEnv(c.env);
        // We can optionally set it to the context, but for now we just want to ensure it's valid
    } catch (e: any) {
        return c.json({ success: false, error: e.message, code: 'ENV_CONFIG_ERROR' }, 500);
    }

    const traceId = `trace_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    c.set('traceId' as any, traceId);
    c.header('X-Trace-ID', traceId);

    const monitor = createMonitor(c);
    c.set('monitor' as any, monitor);

    const startTime = Date.now();
    await next();

    const duration = Date.now() - startTime;
    c.header('X-Response-Time', `${duration}ms`);
})

app.use('*', logger())
app.use('*', compression())
app.use('*', rateLimit(rateLimitConfigs.moderate))
app.use('*', sentinelMiddleware)

// 2. Systems Initializers
const cache = new EdgeCacheSupercharger()
const selfHealing = new SelfHealingSystem()

// 3. API Routes

// Health Check
app.get('/', (c) => {
    return c.json({
        message: 'Match-Auto API 10x Operational',
        status: 'online',
        timestamp: new Date().toISOString(),
        traceId: c.get('traceId' as any)
    })
})

// Search with Stratified Cache
app.get('/api/listings/search',
    zValidator('query', z.object({
        q: z.string().optional(),
        make: z.string().optional(),
        minPrice: z.string().transform(Number).optional(),
        maxPrice: z.string().transform(Number).optional()
    })),
    async (c) => {
        const query = c.req.valid('query')
        const cacheKey = `search:${JSON.stringify(query)}`

        return cache.getWithStratifiedCache(cacheKey, async () => {
            return {
                message: "Results from Edge Search",
                results: []
            }
        }, '30s')
    }
)

// Payments (Protected)
app.post('/api/payments/create-intent',
    protectRoute,
    zValidator('json', z.object({
        planId: z.enum(['featured', 'premium', 'agency']),
        userId: z.string(),
        userEmail: z.string().email()
    })),
    async (c) => {
        const { planId, userId, userEmail } = c.req.valid('json')
        const orchestrator = new PaymentOrchestrator(c.env)
        const result = await orchestrator.createPaymentIntent(planId, userId, userEmail)
        return c.json(result)
    }
)

// AI Moderation (Protected)
app.post('/api/ai/moderate',
    protectRoute,
    zValidator('json', z.object({
        text: z.string().min(1)
    })),
    async (c) => {
        const { text } = c.req.valid('json')
        const orchestrator = new AIOrchestrator(c.env)
        const result = await orchestrator.moderateText(text)
        return c.json(result)
    }
)

// B2B & Core Modules
app.route('/api/b2b', b2b)
app.route('/api/listings', listings)
app.route('/api/viral', viral)

// --- Secret & Intelligence Routes (Protected) ---
const secret = new Hono<{ Bindings: Env }>()
secret.use('*', protectRoute)

secret.get('/pulse', async (c) => c.json(await PulseEngine.getGlobalEvents(c.env)))
secret.get('/heatmap', async (c) => c.json(await HeatmapGenerator.getHeatEntries(c.env)))
secret.post('/crawl', async (c) => {
    const { isTurbo } = await c.req.json().catch(() => ({ isTurbo: false }))
    return c.json(await HyperCrawler.enqueueCrawl(c.env, isTurbo))
})
secret.get('/notification', async (c) => {
    const userId = c.req.query('userId') || 'anon'
    return c.json({ success: true, notification: await DopamineEngine.getIrresistibleNotification(userId) })
})
secret.get('/reputation/:userId', async (c) => {
    const userId = c.req.param('userId')
    return c.json(await OnChainReputation.getUserReputation(userId, c.env))
})

// Crypto Wallet Routes
secret.get('/crypto/balance', async (c) => {
    const address = c.req.query('address') || 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg'
    const monitor = c.get('monitor' as any)
    const wallet = createCryptoWallet(c.env, monitor)
    return c.json({ success: true, balance: await wallet.getBalance(address) })
})

app.route('/api/secret', secret)

// Negotiation (Test/Semi-Public)
app.post('/api/test/negotiate', async (c) => {
    const { offer, askingPrice } = await c.req.json()
    const result = GhostNegotiator.shouldFilter(offer, askingPrice)
    return c.json({
        success: !result.shouldReject,
        message: result.aiResponse,
        status: result.shouldReject ? 'BLOCKED_BY_GHOST' : 'ACCEPTED'
    }, result.shouldReject ? 403 : 200)
})

// 4. Global Error Handling
app.onError((err, c) => {
    const traceId = c.get('traceId' as any);
    const monitor = c.get('monitor' as any);

    if (monitor) {
        monitor.captureError(err, { path: c.req.path, traceId });
    } else {
        console.error(`[ERROR][${traceId}]`, err);
    }

    let status = 500;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_ERROR';

    if (err instanceof HTTPException) {
        status = err.status;
        message = err.message;
        code = 'HTTP_EXCEPTION';
    } else if (err instanceof z.ZodError) {
        status = 422;
        message = 'Validation Failed';
        code = 'VALIDATION_ERROR';
        return c.json({
            success: false,
            error: message,
            code,
            details: err.errors,
            traceId
        }, status);
    }

    const response: ApiResponse = {
        success: false,
        error: message,
        code,
        traceId,
        timestamp: new Date().toISOString()
    };

    return c.json(response, status as any);
})

export default app
