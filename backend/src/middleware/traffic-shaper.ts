import { Context, Next } from 'hono';

export const trafficShaperMiddleware = () => {
    return async (c: Context, next: Next) => {
        const tier = c.req.header('X-Listing-Tier') || 'standard';

        if (tier === 'platinum') {
            // Prioritize Platinum listings
            c.header('X-Traffic-Priority', 'platinum');
            c.header('X-Edge-Cache', 'hit-priority');
            c.header('CF-Priority', 'v=1, n=0'); // High priority for CF
        }

        await next();

        if (tier === 'platinum') {
            c.header('Cache-Control', 'public, max-age=60, s-maxage=3600');
        }
    };
};
