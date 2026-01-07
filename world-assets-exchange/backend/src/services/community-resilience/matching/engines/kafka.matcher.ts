import { logger } from '../../../../utils/logger';

export class KafkaMatcher {
    constructor() { }

    async match(signal: any): Promise<any> {
        const start = Date.now();
        logger.info(`[Matching] Engine 3 (Kafka Offline) starting for signal: ${signal.id}`);

        // Simulation of Kafka persistent log lookup
        // In a real environment, this would query a compacted topic or a state store
        logger.warn('[Matching] Engine 3 used as EMERGENCY FALLBACK');

        return {
            matches: [],
            engine: 'kafka-offline',
            latency: Date.now() - start,
            status: 'simulated'
        };
    }
}
