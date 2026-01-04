import { Hono } from 'hono';
import { createViralService } from '../services/ViralService';
import { Env } from '../../../shared/types';

const app = new Hono<{ Bindings: Env }>();

app.get('/metrics/:userId', async (c) => {
    const userId = c.req.param('userId');
    const period = (c.req.query('period') as any) || '30d';

    try {
        const viralService = createViralService(c.env);
        const metrics = await viralService.calculateKFactor(userId, period);

        return c.json({
            success: true,
            data: metrics,
            period
        });
    } catch (error: any) {
        return c.json({
            success: false,
            error: 'Failed to fetch viral metrics',
            message: error.message
        }, 500);
    }
});

app.post('/event', async (c) => {
    const { userId, type, metadata } = await c.req.json();

    try {
        const viralService = createViralService(c.env);
        await viralService.recordEvent({
            userId,
            type,
            metadata
        });

        return c.json({ success: true, message: 'Viral event recorded' });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 400);
    }
});

export default app;
