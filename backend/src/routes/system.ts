import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { seedListings } from '../lib/seed';

const system = new Hono<{ Bindings: Env }>();

system.get('/status', (c) => {
    return c.json({
        status: 'online',
        uptime: process.uptime(),
        region: 'Mexico-Queretaro-Edge',
        version: '1.0.0-quantum'
    });
});

system.post('/seed-inventory', async (c) => {
    const result = await seedListings(c.env);
    return c.json(result);
});

export default system;
