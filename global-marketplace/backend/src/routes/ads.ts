import { Hono } from 'hono';
import { IntentShardingEngine, UserIntent } from '../services/ads/intent-sharding';

const router = new Hono();
const engine = new IntentShardingEngine();

router.post('/get', async (c) => {
    const body = await c.req.json();
    const intent: UserIntent = {
        id: crypto.randomUUID(),
        userId: body.userId || 'anon',
        searchQuery: body.searchQuery || '',
        category: body.category || 'general',
        timestamp: Date.now(),
        intensity: 50
    };

    const shards = await engine.processUserIntent(intent);
    const ads = await engine.getAdsForShard(shards[0].id);

    return c.json({
        success: true,
        ads,
        meta: { shardsUsed: shards.map(s => s.name) }
    });
});

export default router;
