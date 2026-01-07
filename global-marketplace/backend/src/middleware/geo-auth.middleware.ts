import { Context, Next } from 'hono';
import { logger } from '../utils/logger';

/**
 * Middleware para autorizar acceso basado en cercanía o roles espaciales
 */
export const geoAuthMiddleware = async (c: Context, next: Next) => {
    const userRole = c.req.header('X-User-Role');
    const path = c.req.path;

    // Solo ADMIN puede ver analíticas globales
    if (path.includes('/analytics/') && userRole !== 'ADMIN') {
        logger.warn(`Unauthorized analytics access attempt by role: ${userRole}`);
        return c.json({ error: 'Admin role required for spatial analytics' }, 403);
    }

    // Los drivers solo pueden sincronizar su Propio Tracking
    if (path.includes('/tracking/sync')) {
        const body = await c.req.json();
        const tokenUserId = c.req.header('X-User-Id');
        const updateUserId = Array.isArray(body) ? body[0].vehicleId : body.vehicleId;

        if (userRole === 'DRIVER' && tokenUserId !== updateUserId) {
            return c.json({ error: 'Drivers can only sync their own location' }, 403);
        }
    }

    await next();
};
