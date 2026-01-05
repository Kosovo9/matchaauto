import { Context, Next } from 'hono';

export interface ThreatIntensityIndex {
    score: number;
    threats: any[];
    recommendedAction: 'normal' | 'reinforce' | 'lockdown';
    timestamp: number;
}

export const sentinelXMiddleware = () => {
    let currentTII: ThreatIntensityIndex = {
        score: 12,
        threats: [],
        recommendedAction: 'normal',
        timestamp: Date.now()
    };

    // Mocking TII updates - in prod this fetches from Sentinel-X TII service
    setInterval(() => {
        currentTII.score = Math.floor(Math.random() * 20) + 5;
        currentTII.timestamp = Date.now();
    }, 60000);

    return async (c: Context, next: Next) => {
        c.header('X-Threat-Level', currentTII.score.toString());
        c.header('X-Threat-Action', currentTII.recommendedAction);

        if (currentTII.score > 80 || currentTII.recommendedAction === 'lockdown') {
            const path = c.req.path;
            if (!path.startsWith('/api/auth')) {
                return c.json({ error: 'System in lockdown mode for security reinforcement' }, 503);
            }
        }

        await next();
    };
};
