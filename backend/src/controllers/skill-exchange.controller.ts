import { Context } from 'hono';
import { z } from 'zod';
import { Redis } from 'ioredis';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

const RequestSkillSchema = z.object({
    requesterId: z.string(),
    skill: z.string(), // e.g. "albañilería"
    location: z.object({ lat: z.number(), lng: z.number() }),
    description: z.string().optional()
});

const AvailableSkillsSchema = z.object({
    radiusKm: z.number().default(10)
});

const CompleteSkillSchema = z.object({
    requestId: z.string(),
    providerId: z.string(),
    completedAt: z.string().datetime(),
    rating: z.number().min(1).max(5).optional()
});

export class SkillExchangeController {
    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
    }

    // POST /request-skill
    requestSkill = async (c: Context) => {
        try {
            const payload = RequestSkillSchema.parse(await c.req.json());
            const requestId = `skill:${Date.now()}:${payload.requesterId}`;
            const record = {
                ...payload,
                status: 'open',
                createdAt: new Date().toISOString()
            };
            const pipe = this.redis.pipeline();
            pipe.hmset(requestId, record as any);
            pipe.sadd('skill:open', requestId);
            await pipe.exec();
            return c.json({ success: true, requestId });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // GET /available-skills
    availableSkills = async (c: Context) => {
        try {
            const { radiusKm } = AvailableSkillsSchema.parse(c.req.query());
            // Simple placeholder: return all open requests (real impl would use GEO)
            const ids = await this.redis.smembers('skill:open');
            const pipe = this.redis.pipeline();
            ids.forEach(id => pipe.hgetall(id));
            const results = await pipe.exec() || [];
            const skills = results.map(r => r[1]);
            return c.json({ success: true, data: skills.slice(0, radiusKm) });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // POST /complete-skill
    completeSkill = async (c: Context) => {
        try {
            const payload = CompleteSkillSchema.parse(await c.req.json());
            const exists = await this.redis.exists(payload.requestId);
            if (!exists) {
                return c.json({ success: false, error: 'Request not found' }, 404);
            }
            const pipe = this.redis.pipeline();
            pipe.hset(payload.requestId, 'status', 'completed');
            pipe.hset(payload.requestId, 'providerId', payload.providerId);
            pipe.hset(payload.requestId, 'completedAt', payload.completedAt);
            if (payload.rating) pipe.hset(payload.requestId, 'rating', payload.rating.toString());
            await pipe.exec();
            await this.redis.srem('skill:open', payload.requestId);
            return c.json({ success: true, message: 'Skill completed' });
        } catch (error) {
            return handleError(error, c);
        }
    };
}
