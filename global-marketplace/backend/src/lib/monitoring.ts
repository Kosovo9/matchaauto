import { Toucan } from 'toucan-js';
import { Context } from 'hono';

export interface MonitoringConfig {
    dsn: string;
    environment: string;
    release: string;
}

export class Monitor {
    private sentry: Toucan | null = null;

    constructor(config: MonitoringConfig, c: Context) {
        if (config.dsn) {
            this.sentry = new Toucan({
                dsn: config.dsn,
                context: c.executionCtx,
                environment: config.environment,
                release: config.release,
                request: c.req.raw,
            });
        }
    }

    captureError(error: Error, extra?: any): void {
        console.error(`[MONITOR] Error captured:`, error, extra);
        this.sentry?.captureException(error, { extra });
    }

    captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: any): void {
        console.log(`[MONITOR] ${level.toUpperCase()}: ${message}`, extra);
        this.sentry?.captureMessage(message, { level, extra });
    }
}

export const createMonitor = (c: Context): Monitor => {
    const env = c.env as any;
    return new Monitor({
        dsn: env.SENTRY_DSN || '',
        environment: env.NODE_ENV || 'production',
        release: env.VERSION || '1.0.0',
    }, c);
};
