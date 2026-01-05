// backend/src/routes/admin.ts
import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { getRealMetrics } from '../services/metrics-service';
import { MexicoLaunchOrchestrator } from '../mission-control/orchestrator';

const router = new Hono<{ Bindings: Env }>();

// Security Middleware for Admin
router.use('*', async (c, next) => {
    const adminKey = c.req.header('X-Admin-Key');
    // Use environment variable for key validation
    if (!adminKey || adminKey !== c.env.ADMIN_API_KEY) {
        return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    await next();
});

// GET /metrics -> Real-time status
router.get('/metrics', async (c) => {
    try {
        const metrics = await getRealMetrics(c.env);
        return c.json({
            success: true,
            data: metrics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

// POST /controls/launch-mexico -> Start orchestration
router.post('/controls/launch-mexico', async (c) => {
    try {
        const { phase = 'day1' } = await c.req.json().catch(() => ({ phase: 'day1' }));

        const orchestrator = new MexicoLaunchOrchestrator();

        // Execute in background
        c.executionCtx.waitUntil(orchestrator.startLaunchSequence(phase));

        return c.json({
            success: true,
            message: `Launch sequence for phase ${phase} initiated.`,
            launchId: orchestrator.getLaunchId()
        });
    } catch (error: any) {
        console.error('Launch execution error:', error);
        return c.json({ success: false, error: error.message }, 500);
    }
});

// WebSocket Handler for Real-time Metrics
export const handleAdminWS = async (c: any) => {
    const upgradeHeader = c.req.header('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const [client, server] = Object.values(new WebSocketPair());

    (server as any).accept();

    // Send initial metrics
    const initialMetrics = await getRealMetrics(c.env);
    server.send(JSON.stringify({ type: 'metrics_update', data: initialMetrics }));

    // Set up interval for updates
    const intervalId = setInterval(async () => {
        try {
            const metrics = await getRealMetrics(c.env);
            server.send(JSON.stringify({ type: 'metrics_update', data: metrics }));
        } catch (e) {
            console.error('WS Refresh Error:', e);
        }
    }, 10000);

    server.addEventListener('close', () => {
        clearInterval(intervalId);
    });

    return new Response(null, {
        status: 101,
        webSocket: client,
    });
};

router.get('/ws', handleAdminWS);

export default router;
