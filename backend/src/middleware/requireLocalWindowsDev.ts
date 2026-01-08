import type { MiddlewareHandler } from 'hono';

/**
 * 🧛 Surgical Protection: Only allows access in local Windows development.
 * Returns 404 (Not Found) in Staging/Prod to remain invisible.
 */
export const requireLocalWindowsDev = (): MiddlewareHandler => async (c, next) => {
    const isWindows = process.platform === 'win32';
    const isLocalEnv = process.env.APP_ENV === 'local';
    const inCloudRun = !!process.env.K_SERVICE || !!process.env.K_REVISION; // Cloud Run always sets these

    if (!isWindows || !isLocalEnv || inCloudRun) {
        // Invisible in staging/prod: looks like it doesn't exist
        return c.notFound();
    }
    await next();
};
