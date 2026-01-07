import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

export const setupRedis = (env: any) => {
    if (env.REDIS_URL) {
        return new IORedis(env.REDIS_URL);
    }
    return new UpstashRedis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    });
};
