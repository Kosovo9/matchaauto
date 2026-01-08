
import { Context } from 'hono';
import { getAuth } from '@hono/clerk-auth';

/**
 * Helper quirúrgico para obtener el UserId.
 * Prioriza Clerk (Live) y permite fallback (Mock) solo si NO estamos en producción.
 */
export function getUserId(c: Context): string | null {
    // 1. Intentar obtener de Clerk (Live)
    const auth = getAuth(c);
    if (auth?.userId) {
        return auth.userId;
    }

    // 2. Fallback de desarrollo (Solo si APP_ENV no es production/staging)
    const appEnv = process.env.APP_ENV || 'development';
    if (appEnv !== 'production' && appEnv !== 'staging') {
        const mockId = c.req.header('x-user-id');
        if (mockId) return mockId;
    }

    return null;
}
