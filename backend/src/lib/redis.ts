import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

let redisInstance: Redis;

export const getRedis = (): Redis => {
    if (!redisInstance) {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        logger.info(`🔌 Connecting to Redis at ${redisUrl}`);
        redisInstance = new Redis(redisUrl, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 3
        });

        redisInstance.on('error', (err) => {
            logger.error('Redis Error:', err);
        });

        redisInstance.on('connect', () => {
            logger.info('✅ Redis Connected');
        });
    }
    return redisInstance;
};
