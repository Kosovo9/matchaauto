import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { NotificationOrchestrator } from '../services/notifications';

const notifications = new Hono<{ Bindings: Env }>();

notifications.post('/send-match', async (c) => {
    const { userId, phone, model, price } = await c.req.json();
    const orchestrator = new NotificationOrchestrator(c.env);
    const result = await orchestrator.sendMatchAlert(userId, phone, model, price);
    return c.json({ success: true, result });
});

export default notifications;
