import { Hono } from 'hono';
import { PhilanthropyLedger } from '../services/philanthropy/ledger';
import { migrateToSupabase } from '../scripts/migrate-to-supabase';
import { Env } from '../../../shared/types';

const router = new Hono<{ Bindings: Env }>();

router.get('/report', async (c) => {
    const ledger = new PhilanthropyLedger({
        SUPABASE_URL: c.env.SUPABASE_URL,
        SUPABASE_KEY: c.env.SUPABASE_KEY
    });
    const report = await ledger.getImpactReport();
    return c.json({ success: true, data: report });
});

router.post('/migrate', async (c) => {
    const result = await migrateToSupabase(c.env);
    return c.json(result);
});

export default router;
