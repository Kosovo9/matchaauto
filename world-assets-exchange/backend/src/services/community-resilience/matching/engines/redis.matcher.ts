import Redis from 'ioredis';
import { logger } from '../../../../utils/logger';

export class RedisMatcher {
    private redis: Redis;

    constructor(redis: Redis) {
        this.redis = redis;
    }

    async match(signal: any): Promise<any> {
        const start = Date.now();
        logger.info(`[Matching] Engine 2 (Redis Streams) starting for signal: ${signal.id}`);

        try {
            // Logic: Read from a Redis Stream or Geo-index
            const results = await this.redis.georadius(
                'signals:geo',
                signal.lng,
                signal.lat,
                50,
                'km',
                'WITHDIST',
                'COUNT',
                10,
                'ASC'
            );

            // results is Array: [ [member, distance], ... ]
            const signalIds = results.map((r: any) => r[0]);
            const matches = [];

            if (signalIds.length > 0) {
                const pipe = this.redis.pipeline();
                signalIds.forEach((id: string) => pipe.hgetall(`signal:${id}`));
                const signalData = await pipe.exec();

                if (signalData) {
                    signalData.forEach((res: any, idx: number) => {
                        if (res[1]) {
                            matches.push({ ...res[1], distance: results[idx][1] });
                        }
                    });
                }
            }

            logger.info(`[Matching] Engine 2 found ${matches.length} matches in ${Date.now() - start}ms`);
            return { matches, engine: 'redis-streams', latency: Date.now() - start };
        } catch (e) {
            logger.warn('[Matching] Engine 2 failed or not configured', e);
            return { matches: [], error: e };
        }
    }
}
