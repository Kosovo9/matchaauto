import { Hono } from 'hono';

const router = new Hono();

router.get('/ping', (c) => c.text('pong'));

router.get('/db-check', async (c) => {
    const db = (c.env as any).DB;
    if (!db) return c.json({ error: 'DB NOT BOUND' });
    try {
        const tables = await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        return c.json({ success: true, tables: tables.results });
    } catch (e: any) {
        return c.json({ success: false, error: e.message });
    }
});

export default router;
