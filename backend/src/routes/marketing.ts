import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { ViralOrchestrator } from '../services/marketing';

const marketing = new Hono<{ Bindings: Env }>();

marketing.post('/generate-blast', async (c) => {
    const details = await c.req.json();
    const orchestrator = new ViralOrchestrator(c.env);

    try {
        const pack = await orchestrator.generatePackage(details);
        return c.json({
            success: true,
            data: pack,
            message: 'Marketing Blast Generated 🚀'
        });
    } catch (e: any) {
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default marketing;
