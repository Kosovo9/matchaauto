import { Hono } from 'hono';
import { cors } from 'hono/cors';
import listings from './routes/listings';
import payments from './routes/payments';
// import search from './routes/search'; // Uncomment when search is fully ready or if we want to include it now

const app = new Hono();

// Global Middleware
app.use('/*', cors({
    origin: '*', // Allow all origins for now to prevent CORS issues during demo
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health Check
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// Mount Routes
app.route('/api/listings', listings);
app.route('/api/payments', payments);
// app.route('/api/search', search);

export default {
    fetch: app.fetch
};
