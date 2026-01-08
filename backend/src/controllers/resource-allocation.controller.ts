import { Context } from 'hono';
import { z } from 'zod';
import { Redis } from 'ioredis';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

const AllocateSchema = z.object({
    userId: z.string(),
    resource: z.enum(['water', 'medicine', 'ice', 'generator', 'food']),
    quantity: z.number().positive(),
    location: z.object({ lat: z.number(), lng: z.number() })
});

const NeedSchema = z.object({
    priority: z.enum(['high', 'medium', 'low']).default('medium')
});

const FulfillSchema = z.object({
    allocationId: z.string(),
    deliveredBy: z.string(),
    deliveredAt: z.string().datetime()
});

export class ResourceAllocationController {
    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
    }

    allocate = async (c: Context) => {
        try {
            const payload = AllocateSchema.parse(await c.req.json());
            const allocationId = `alloc:${Date.now()}:${payload.userId}`;
            const record = {
                ...payload,
                status: 'offered',
                createdAt: new Date().toISOString()
            };
            const pipe = this.redis.pipeline();
            pipe.hmset(allocationId, record as any);
            pipe.sadd('resource:needs', allocationId);
            await pipe.exec();
            return c.json({ success: true, allocationId });
        } catch (error) {
            return handleError(error, c);
        }
    };

    needs = async (c: Context) => {
        try {
            const { priority } = NeedSchema.parse(c.req.query());
            const scores = { high: 1, medium: 2, low: 3 };
            const ids = await this.redis.zrangebyscore(
                'resource:needs',
                scores[priority],
                scores[priority]
            );
            const pipe = this.redis.pipeline();
            ids.forEach(id => pipe.hgetall(id));
            const results = await pipe.exec() || [];
            const needs = results.map(r => r[1]);
            return c.json({ success: true, data: needs });
        } catch (error) {
            return handleError(error, c);
        }
    };

    fulfill = async (c: Context) => {
        try {
            const payload = FulfillSchema.parse(await c.req.json());
            const exists = await this.redis.exists(payload.allocationId);
            if (!exists) {
                return c.json({ success: false, error: 'Allocation not found' }, 404);
            }
            const pipe = this.redis.pipeline();
            pipe.hset(payload.allocationId, 'status', 'fulfilled');
            pipe.hset(payload.allocationId, 'deliveredBy', payload.deliveredBy);
            pipe.hset(payload.allocationId, 'deliveredAt', payload.deliveredAt);
            await pipe.exec();
            await this.redis.zrem('resource:needs', payload.allocationId);
            return c.json({ success: true, message: 'Resource fulfilled' });
        } catch (error) {
            return handleError(error, c);
        }
    };
}
