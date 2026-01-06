import { Hono } from 'hono';
import { logger } from '../utils/logger';

export function setupWebhookRoutes(app: Hono) {
    const route = new Hono();

    /**
     * Recibe alertas de hardware externo (GPS Trackers)
     */
    route.post('/hardware/alert', async (c) => {
        const data = await c.req.json();
        logger.warn('[HARDWARE_ALERT]', data);
        // Logic to notify dispatchers or trigger emergency protocols
        return c.json({ received: true });
    });

    /**
     * Webhook para actualizaciones de tráfico (TomTom/HERE/etc)
     */
    route.post('/traffic/update', async (c) => {
        const data = await c.req.json();
        logger.info('[TRAFFIC_UPDATE] Regional traffic data updated');
        return c.json({ success: true });
    });

    app.route('/api/v1/webhooks/spatial', route);
}
