import { Context, Next } from 'hono';

/**
 * Normaliza y valida coordenadas en parámetros de query o body
 */
export const coordNormalizationMiddleware = async (c: Context, next: Next) => {
    // 1. Check Query Params
    const lat = c.req.query('lat');
    const lng = c.req.query('lng');

    if (lat && lng) {
        const nLat = parseFloat(lat);
        const nLng = parseFloat(lng);

        if (isNaN(nLat) || isNaN(nLng) || nLat < -90 || nLat > 90 || nLng < -180 || nLng > 180) {
            return c.json({ error: 'Invalid coordinates range' }, 400);
        }
    }

    // 2. Body validation is usually handled by Zod in controllers, 
    // but we can do a quick sanity check here if needed.

    await next();
};
