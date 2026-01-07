import { Context } from 'hono';
import { z } from 'zod';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

const OpenDisputeSchema = z.object({
    reporterId: z.string(),
    targetId: z.string(),
    barterId: z.string(),
    reason: z.string()
});

const EvidenceSchema = z.object({
    disputeId: z.string(),
    type: z.enum(['photo', 'text', 'video']),
    payload: z.string() // base64 or URL
});

const ResolutionSchema = z.object({
    disputeId: z.string()
});

export class DisputeResolutionController {
    private redis: Redis;
    private pg: Pool;

    constructor(redis: Redis, pg: Pool) {
        this.redis = redis;
        this.pg = pg;
    }

    // POST /open-dispute
    openDispute = async (c: Context) => {
        try {
            const data = OpenDisputeSchema.parse(await c.req.json());
            const disputeId = `dispute:${Date.now()}:${data.reporterId}`;
            const record = {
                ...data,
                status: 'open',
                createdAt: new Date().toISOString()
            };
            const pipe = this.redis.pipeline();
            pipe.hmset(disputeId, record as any);
            pipe.sadd('dispute:open', disputeId);
            await pipe.exec();

            const client = await this.pg.connect();
            await client.query(
                `INSERT INTO disputes (id, reporter_id, target_id, barter_id, reason, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,now())`,
                [disputeId, data.reporterId, data.targetId, data.barterId, data.reason, 'open']
            );
            client.release();

            return c.json({ success: true, disputeId });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // POST /submit-evidence
    submitEvidence = async (c: Context) => {
        try {
            const data = EvidenceSchema.parse(await c.req.json());
            const key = `evidence:${data.disputeId}`;
            await this.redis.rpush(key, JSON.stringify(data));

            const client = await this.pg.connect();
            await client.query(
                `INSERT INTO dispute_evidence (dispute_id, type, payload)
         VALUES ($1,$2,$3)`,
                [data.disputeId, data.type, data.payload]
            );
            client.release();

            return c.json({ success: true, message: 'Evidence stored' });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // GET /resolution/:id
    resolution = async (c: Context) => {
        try {
            const { disputeId } = ResolutionSchema.parse(c.req.params);
            const votesKey = `dispute:${disputeId}:votes`;
            const votes = await this.redis.smembers(votesKey);
            const accept = votes.filter(v => v === 'accept').length;
            const reject = votes.filter(v => v === 'reject').length;
            const verdict = accept > reject ? 'accepted' : 'rejected';

            const pipe = this.redis.pipeline();
            pipe.hset(disputeId, 'status', verdict);
            pipe.srem('dispute:open', disputeId);
            pipe.sadd('dispute:closed', disputeId);
            await pipe.exec();

            const client = await this.pg.connect();
            await client.query(
                `UPDATE disputes SET status=$1, resolved_at=now() WHERE id=$2`,
                [verdict, disputeId]
            );
            client.release();

            return c.json({ success: true, disputeId, verdict });
        } catch (error) {
            return handleError(error, c);
        }
    };
}
