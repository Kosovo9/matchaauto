import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from '../../shared/types';

import listings from './routes/listings';
import payments from './routes/payments';
import ai from './routes/ai';
import system from './routes/system';
import affiliates from './routes/affiliates';
import notifications from './routes/notifications';
import marketing from './routes/marketing';
import chat from './routes/chat';

const app = new Hono<{ Bindings: Env }>();

// Global Middleware
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Quantum-Latency'],
}));

// Global Latency & Geo Tracker
app.use('/*', async (c, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;

    // Cloudflare specific metadata
    const cf = (c.req.raw as any).cf;
    const geo = cf ? {
        country: cf.country,
        city: cf.city,
        region: cf.region,
        colo: cf.colo,
        latency: ms
    } : { country: 'LOCAL', latency: ms };

    console.log(`📡 [QUANTUM-TRAFFIC] ${c.req.method} ${c.req.path} | ${geo.country} (${geo.city || 'Dev'}) | ${ms}ms`);

    // Inject latency header for frontend monitoring
    c.header('X-Quantum-Latency', `${ms}ms`);
});

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0-quantum' }));

// Mount Routes
app.route('/api/listings', listings);
app.route('/api/payments', payments);
app.route('/api/ai', ai);
app.route('/api/system', system);
app.route('/api/affiliates', affiliates);
app.route('/api/notifications', notifications);
app.route('/api/marketing', marketing);
app.route('/api/chat', chat);

export default {
    fetch: app.fetch
};
