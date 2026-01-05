import { Context, Next } from 'hono';

export interface ThreatIntensityIndex {
    score: number;
    threats: any[];
    recommendedAction: 'normal' | 'reinforce' | 'lockdown';
    timestamp: number;
}

export const sentinelXMiddleware = () => {
    return async (c: Context, next: Next) => {
        // Simulated TII - In production this would come from a Durable Object or KV
        const score = Math.floor(Math.random() * 20) + 5;
        const action = 'normal';

        c.header('X-Threat-Level', score.toString());
        c.header('X-Threat-Action', action);

        if (score > 80 || action === 'lockdown') {
            const path = c.req.path;
            if (!path.startsWith('/api/auth')) {
                return c.json({ error: 'System in lockdown mode for security reinforcement' }, 503);
            }
        }

        await next();
    };
};
