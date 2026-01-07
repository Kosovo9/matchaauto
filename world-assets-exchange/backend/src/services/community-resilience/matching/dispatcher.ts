import { SqliteMatcher } from './engines/sqlite.matcher';
import { RedisMatcher } from './engines/redis.matcher';
import { KafkaMatcher } from './engines/kafka.matcher';
import { logger } from '../../../utils/logger';

export class MatchingDispatcher {
    private sqlite: SqliteMatcher;
    private redis: RedisMatcher;
    private kafka: KafkaMatcher;

    constructor(sqlite: SqliteMatcher, redis: RedisMatcher, kafka: KafkaMatcher) {
        this.sqlite = sqlite;
        this.redis = redis;
        this.kafka = kafka;
    }

    async matchSignal(signal: any): Promise<any> {
        const start = Date.now();

        // 1. Primary Engine: SQLite (Local/PostGIS)
        let result = await this.sqlite.match(signal);
        if (result.matches && result.matches.length > 0) {
            return result;
        }

        // 2. Secondary Engine: Redis (Fast Distributed)
        logger.info('[Matching] Falling back to Redis Engine...');
        result = await this.redis.match(signal);
        if (result.matches && result.matches.length > 0) {
            return result;
        }

        // 3. Tertiary Engine: Kafka (Emergency Persistent)
        logger.warn('[Matching] Critical! Falling back to Kafka Engine...');
        result = await this.kafka.match(signal);

        return result;
    }
}
