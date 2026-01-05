import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { VisionOrchestrator } from '../services/ai/VisionOrchestrator';

const ai = new Hono<{ Bindings: Env }>();

ai.post('/analyze-auto', async (c) => {
    const body = await c.req.json();
    const { imageUrl } = body;

    if (!imageUrl) return c.json({ success: false, error: 'No image provided' }, 400);

    const orchestrator = new VisionOrchestrator(c.env);

    try {
        const result = await orchestrator.analyze(imageUrl);
        return c.json({
            success: true,
            data: result,
            message: `Quantum AI Analysis Complete (${result.provider})`
        });
    } catch (e: any) {
        console.error("Orchestrator Error:", e);
        return c.json({ success: false, error: e.message }, 500);
    }
});

export default ai;
