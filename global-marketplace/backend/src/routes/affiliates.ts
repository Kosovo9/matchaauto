import { Hono } from 'hono';
import { Env } from '../../../shared/types';
import { getAffiliateMargin, setAffiliateMargin } from '../lib/affiliates';

const affiliates = new Hono<{ Bindings: Env }>();

affiliates.get('/:id/margin', async (c) => {
    const margin = await getAffiliateMargin(c.env, c.req.param('id'));
    return c.json({ success: true, margin });
});

affiliates.post('/set-margin', async (c) => {
    const { id, rate } = await c.req.json();
    const success = await setAffiliateMargin(c.env, id, rate);
    return c.json({ success });
});

export default affiliates;
