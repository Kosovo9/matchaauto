import { Redis } from '@upstash/redis';

export const setupRedis = (env: any) => {
    return new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    });
};
