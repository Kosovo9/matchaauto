import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from '../../shared/types';

import listings from './routes/listings';
import payments from './routes/payments';
import ai from './routes/ai';
import system from './routes/system';
import affiliates from './routes/affiliates';
import notifications from './routes/notifications';

const app = new Hono<{ Bindings: Env }>();

// Global Middleware
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0-quantum' }));

// Mount Routes
app.route('/api/listings', listings);
app.route('/api/payments', payments);
app.route('/api/ai', ai);
app.route('/api/system', system);
app.route('/api/affiliates', affiliates);
app.route('/api/notifications', notifications);

export default {
    fetch: app.fetch
};
