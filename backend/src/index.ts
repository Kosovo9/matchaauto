import { Hono } from 'hono';
import { cors } from 'hono/cors';
import ai from './routes/ai';

const app = new Hono();

// Global Middleware
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// Mount Routes
app.route('/api/listings', listings);
app.route('/api/payments', payments);
app.route('/api/ai', ai);

export default {
    fetch: app.fetch
};
