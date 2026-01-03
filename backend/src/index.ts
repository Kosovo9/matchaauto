import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { sentinelMiddleware } from './middleware/security'
import { PaymentOrchestrator } from './services/payments/engine'
import { AIOrchestrator } from './services/ai/engine'
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

app.use('*', logger())
app.use('*', cors({
    origin: '*', // Adjust for production
    credentials: true,
}))

// Apply Security Shield
app.use('*', sentinelMiddleware)

app.get('/', (c) => {
    return c.json({
        message: 'Match-Auto API 3.0 Operational',
        status: 'online',
        engine: 'Billion Dollar Cloudflare Stack'
    })
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

// Standard Routes
app.route('/listings', listings)
app.route('/viral', viral)

export default app
