import { logger } from './logger';

export const metrics = {
    increment: (name: string, value: number | Record<string, any> = 1, tags?: Record<string, any>) => {
        const val = typeof value === 'number' ? value : 1;
        const actualTags = typeof value === 'object' ? value : tags;
        // In a real 1000x app, this would send to Prometheus/StatsD
        // logger.debug(`[METRIC] ${name} +${val}`, actualTags);
    },
    timing: (name: string, durationMs: number, tags?: Record<string, any>) => {
        // logger.debug(`[METRIC] ${name} took ${durationMs}ms`, tags);
    },
    gauge: (name: string, value: number, tags?: Record<string, any>) => {
        // logger.debug(`[METRIC] ${name} set to ${value}`, tags);
    }
};
