import { Context } from 'hono';
import { z } from 'zod';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

const IssueSchema = z.object({
    issuerId: z.string(),
    userId: z.string(),
    amount: z.number().positive(),
    reason: z.string().optional()
});

const TransferSchema = z.object({
    fromUserId: z.string(),
    toUserId: z.string(),
    amount: z.number().positive(),
    memo: z.string().optional()
});

const BalanceSchema = z.object({
    userId: z.string()
});

export class LocalCurrencyController {
    private redis: Redis;
    private pg: Pool;

    constructor(redis: Redis, pg: Pool) {
        this.redis = redis;
        this.pg = pg;
    }

    // POST /issue
    issue = async (c: Context) => {
        try {
            const payload = IssueSchema.parse(await c.req.json());
            const key = `currency:${payload.userId}`;
            const pipe = this.redis.pipeline();
            pipe.incrby(key, payload.amount);
            pipe.expire(key, 60 * 60 * 24 * 365);
            await pipe.exec();

            const client = await this.pg.connect();
            await client.query(
                `INSERT INTO currency_audit (user_id, amount, reason, created_at)
         VALUES ($1, $2, $3, now())`,
                [payload.userId, payload.amount, payload.reason ?? 'issue']
            );
            client.release();

            const bal = await this.redis.get(key);
            return c.json({ success: true, balance: Number(bal) });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // POST /transfer
    transfer = async (c: Context) => {
        try {
            const payload = TransferSchema.parse(await c.req.json());
            const fromKey = `currency:${payload.fromUserId}`;
            const toKey = `currency:${payload.toUserId}`;

            const lua = `
        local from = KEYS[1]
        local to = KEYS[2]
        local amount = tonumber(ARGV[1])
        local bal = tonumber(redis.call('GET', from) or '0')
        if bal < amount then return 0 end
        redis.call('DECRBY', from, amount)
        redis.call('INCRBY', to, amount)
        return 1`;
            const result = await this.redis.eval(lua, 2, fromKey, toKey, payload.amount);
            if (result === 0) {
                return c.json({ success: false, error: 'Insufficient balance' }, 400);
            }

            const client = await this.pg.connect();
            await client.query(
                `INSERT INTO currency_audit (user_id, amount, reason, created_at)
         VALUES ($1, $2, $3, now())`,
                [payload.fromUserId, -payload.amount, payload.memo ?? 'transfer']
            );
            await client.query(
                `INSERT INTO currency_audit (user_id, amount, reason, created_at)
         VALUES ($1, $2, $3, now())`,
                [payload.toUserId, payload.amount, payload.memo ?? 'transfer']
            );
            client.release();

            const fromBal = await this.redis.get(fromKey);
            const toBal = await this.redis.get(toKey);
            return c.json({
                success: true,
                fromBalance: Number(fromBal),
                toBalance: Number(toBal)
            });
        } catch (error) {
            return handleError(error, c);
        }
    };

    // GET /balance/:userId
    balance = async (c: Context) => {
        try {
            const { userId } = BalanceSchema.parse(c.req.params);
            const key = `currency:${userId}`;
            const bal = await this.redis.get(key);
            return c.json({ success: true, userId, balance: Number(bal ?? 0) });
        } catch (error) {
            return handleError(error, c);
        }
    };
}
