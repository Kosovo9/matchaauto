import { Context } from 'hono';
import { z } from 'zod';
import Redis from 'ioredis';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

// 10x: Redis stream for high-throughput ingestion (10K+ events/sec). Decouples write from DB.
const USER_BEHAVIOR_STREAM = 'user_behavior_events';
const USER_BEHAVIOR_GROUP = 'behavior_processor';

const TrackEventSchema = z.object({
    userId: z.string().uuid(),
    event: z.enum(['view_vehicle', 'search', 'dwell', 'click_listing', 'contact_seller']),
    metadata: z.record(z.string(), z.any()).optional(),
    timestamp: z.number().default(() => Date.now())
});

export class UserBehaviorAnalyticsController {
    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
        // Ensure consumer group exists (fire and forget)
        this.redis.xgroup('CREATE', USER_BEHAVIOR_STREAM, USER_BEHAVIOR_GROUP, '$', 'MKSTREAM')
            .catch(err => {
                // Ignore "BUSYGROUP Consumer Group name already exists"
                if (!err.message.includes('BUSYGROUP')) {
                    logger.error('Failed to create Redis consumer group', err);
                }
            });
    }

    /**
     * POST /track
     * Ingest user events into highly scalable Redis Stream
     */
    trackEvent = async (c: Context) => {
        try {
            const body = await c.req.json();
            const validated = TrackEventSchema.parse(body);

            // 10x: XADD is O(1) and extremely fast. 
            // We store the payload as a JSON string to keep the stream schema flexible.
            await this.redis.xadd(
                USER_BEHAVIOR_STREAM,
                '*', // Auto-generate ID
                'userId', validated.userId,
                'event', validated.event,
                'payload', JSON.stringify(validated)
            );

            // Only for demo/dev: Update a simple counter for immediate feedback
            await this.redis.hincrby(`user_profile:${validated.userId}:counts`, validated.event, 1);

            return c.json({ success: true, message: 'Event tracked' }, 202);
        } catch (error) {
            return handleError(error, c);
        }
    };

    /**
     * GET /profile/:userId
     * Returns inferred preferences based on immediate cache
     */
    getUserProfile = async (c: Context) => {
        try {
            const userId = c.req.param('userId');

            // Fetch aggregated counts
            const counts = await this.redis.hgetall(`user_profile:${userId}:counts`);
            if (Object.keys(counts).length === 0) {
                return c.json({ success: true, data: { status: 'New User', traits: [] } });
            }

            // Simple inference logic (10x stub)
            const traits: string[] = [];
            const views = parseInt(counts['view_vehicle'] || '0');
            const searches = parseInt(counts['search'] || '0');

            if (views > 10) traits.push('Active Shopper');
            if (searches > 20) traits.push('Researcher');
            if (parseInt(counts['contact_seller'] || '0') > 0) traits.push('High Intent');

            return c.json({
                success: true,
                data: {
                    userId,
                    interactionSummary: counts,
                    inferredTraits: traits,
                    lastActive: new Date().toISOString()
                }
            });

        } catch (error) {
            return handleError(error, c);
        }
    };
}
