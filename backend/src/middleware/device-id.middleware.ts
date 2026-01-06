import { Context, Next } from 'hono';

/**
 * Asegura que se identifique el dispositivo en operaciones de rastreo
 */
export const deviceIdMiddleware = async (c: Context, next: Next) => {
    const deviceId = c.req.header('X-Device-ID') || c.req.header('X-Vehicle-ID');

    if (c.req.path.includes('/tracking/') && !deviceId) {
        // Si es una ruta de tracking, el Device ID es obligatorio
        return c.json({ error: 'X-Device-ID header required for tracking operations' }, 401);
    }

    // Inject deviceId into context for easier access in controllers
    c.set('deviceId', deviceId);

    await next();
};
