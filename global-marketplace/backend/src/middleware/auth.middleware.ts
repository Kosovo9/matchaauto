import { Context, Next } from 'hono';
import { logger } from '../utils/logger';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        // Aquí iría la validación real (JWT o Clerk)
        // Para 1000x usaremos una verificación ultra-rápida
        if (token === process.env.INTERNAL_API_KEY) {
            return await next();
        }

        // Simulación de usuario para desarrollo
        if (process.env.NODE_ENV === 'development') {
            c.set('user', { id: 'dev-user', role: 'admin' });
            return await next();
        }

        return c.json({ success: false, error: 'Forbidden' }, 403);
    } catch (error) {
        logger.error('Auth middleware error:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
};
