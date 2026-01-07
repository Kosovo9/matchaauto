import { Hono } from 'hono';
import { QuantumSearchProtocol } from '../features/quantum-search/protocol';
import { Env } from '../../../shared/types';

const router = new Hono<{ Bindings: Env }>();

router.post('/', async (c) => {
    const body = await c.req.json();
    const protocol = new QuantumSearchProtocol({
        SUPABASE_URL: c.env.SUPABASE_URL,
        SUPABASE_KEY: c.env.SUPABASE_KEY,
        DB: (c.env as any).DB
    });

    const result = await protocol.search(body);

    c.header('X-Quantum-Search', 'enabled');
    c.header('X-Cache-Hit', result.cached ? 'true' : 'false');

    return c.json({
        success: true,
        data: result
    });
});

export default router;
