import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sentinelMiddleware } from './middleware/security'
import { PaymentOrchestrator } from './services/payments/engine'
import { AIOrchestrator } from './services/ai/engine'
import { EdgeCacheSupercharger } from './features/01_performance/edge-cache-supercharger'
import { SelfHealingSystem } from './features/04_automation/self-healing-system'
import listings from './routes/listings'
import viral from './routes/viral'

// Exporting ChatRoom for Durable Objects
export { ChatRoom } from './chat/durable'

type Bindings = {
    DB: D1Database;
    VIRAL_DATA: KVNamespace;
    HF_TOKEN: string;
    STRIPE_SECRET_KEY: string;
    CHAT_ROOM: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>()

// Inicialización de Sistemas 10x
const cache = new EdgeCacheSupercharger()
const selfHealing = new SelfHealingSystem()

app.use('*', logger())
app.use('*', cors({
    origin: '*', // Adjust for production
    credentials: true,
}))

// Apply Security Shield
app.use('*', sentinelMiddleware)

app.get('/', (c) => {
    return c.json({
        message: 'Match-Auto API 10x Operational',
        status: 'online',
        engine: 'Billion Dollar Cloudflare Stack',
        performance: 'Edge Cache Active',
        automation: 'Self-Healing Active'
    })
})

// Rutas de Listings con Optimización 10x (Cache Estratificado)
app.get('/api/listings/search', async (c) => {
    const query = c.req.query()
    const cacheKey = `search:${JSON.stringify(query)}`

    return cache.getWithStratifiedCache(cacheKey, async () => {
        // En un escenario real, esto llamaría al servicio de listings
        return {
            message: "Cache Miss - Result fetched from DB",
            timestamp: Date.now(),
            results: []
        }
    }, '30s')
})

// Payments Routes
app.post('/api/payments/create-intent', async (c) => {
    const { planId, userId, userEmail } = await c.req.json()
    const orchestrator = new PaymentOrchestrator(c.env)
    const result = await orchestrator.createPaymentIntent(planId, userId, userEmail)
    return c.json(result)
})

// AI Routes
app.post('/api/ai/moderate', async (c) => {
    const { text } = await c.req.json()
    const orchestrator = new AIOrchestrator(c.env)
    const result = await orchestrator.moderateText(text)
    return c.json(result)
})

// Chat Routing (WebSocket to Durable Object)
app.get('/api/chat/ws/:roomId', async (c) => {
    const roomId = c.req.param('roomId')
    const id = c.env.CHAT_ROOM.idFromName(roomId)
    const obj = c.env.CHAT_ROOM.get(id)
    return obj.fetch(c.req.raw)
})

import { honeypotTrap } from './services/secret/Honeypot'

// ... (existing imports)

// Honeypot Traps for Scrapers
app.get('/wp-admin', honeypotTrap)
app.get('/.env', honeypotTrap)
app.get('/config.php', honeypotTrap)

// Pulse & Heatmap endpoints
app.get('/api/secret/pulse', async (c) => {
    const { PulseEngine } = await import('./services/secret/Pulse')
    return c.json(await PulseEngine.getGlobalEvents(c.env))
})

app.get('/api/secret/heatmap', async (c) => {
    const { HeatmapGenerator } = await import('./services/secret/Heatmap')
    return c.json(await HeatmapGenerator.getHeatEntries(c.env))
})

import { GhostNegotiator } from './services/secret/GhostNegotiator'
import { HyperCrawler } from './services/secret/HyperCrawler'
import { DopamineEngine } from './services/secret/DopamineEngine'

// Antigravity 20x Hyper-Crawler (Turbo Mode)
app.post('/api/secret/crawl', async (c) => {
    const { isTurbo } = await c.req.json().catch(() => ({ isTurbo: false }))
    const result = await HyperCrawler.initiateGlobalCrawl(c.env, isTurbo)
    return c.json(result)
})

// Antigravity 20x Dopamine Notification
app.get('/api/secret/notification', async (c) => {
    const userId = c.req.query('userId') || 'anon'
    const notification = await DopamineEngine.getIrresistibleNotification(userId)
    return c.json({
        success: true,
        notification,
        engine: 'Dopamine-v2-Atomic'
    })
})

// Test Negotiation Endpoint
app.post('/api/test/negotiate', async (c) => {
    const { offer, askingPrice } = await c.req.json()
    const result = GhostNegotiator.shouldFilter(offer, askingPrice)

    if (result.shouldReject) {
        return c.json({
            success: false,
            message: result.aiResponse,
            status: 'BLOCKED_BY_GHOST'
        }, 403)
    }

    return c.json({
        success: true,
        message: 'Oferta enviada al vendedor exitosamente.',
        status: 'ACCEPTED'
    })
})

// Standard Routes
app.route('/listings', listings)
app.route('/viral', viral)

export default app
