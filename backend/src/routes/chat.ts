import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { SalesCloserAI } from '../services/sales-ai';

const chat = new Hono<{ Bindings: Env }>();

chat.post('/ai-close', async (c) => {
    const { message, carDetails, history } = await c.req.json();

    if (!c.env.GOOGLE_AI_API_KEY) {
        return c.json({ error: "API Key missing" }, 500);
    }

    const salesAI = new SalesCloserAI(c.env.GOOGLE_AI_API_KEY);

    try {
        const response = await salesAI.generateResponse(message, carDetails, history || []);
        return c.json({
            success: true,
            reply: response,
            agent: 'Quantum Sales AI'
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default chat;
