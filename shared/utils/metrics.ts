import { logger } from './logger';

export const metrics = {
    increment: (name: string, value = 1) => {
        // In a real 1000x app, this would send to Prometheus/StatsD
        // logger.debug(`[METRIC] ${name} +${value}`);
    },
    timing: (name: string, durationMs: number) => {
        // logger.debug(`[METRIC] ${name} took ${durationMs}ms`);
    },
    gauge: (name: string, value: number) => {
        // logger.debug(`[METRIC] ${name} set to ${value}`);
    }
};
