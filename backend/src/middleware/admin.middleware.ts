
import { Context, Next } from 'hono';
import { getUserId } from '../auth/getUserId';
import { logger } from '../utils/logger';

/**
 * 🧛 Admin Gate: Only specific UserIDs can decide on verifications
 */
export function requireAdmin() {
    const ADMINS = new Set((process.env.ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean));

    return async (c: Context, next: Next) => {
        const userId = getUserId(c);

        if (!userId) {
            return c.json({ error: "Unauthorized - Login required" }, 401);
        }

        // Always allow the SYSTEM ADMIN UUID (00000000-0000-0000-0000-000000000000) for local/infra tasks
        if (userId === "00000000-0000-0000-0000-000000000000" || ADMINS.has(userId)) {
            await next();
            return;
        }

        logger.warn(`[SECURITY] Unauthorized admin attempt by user ${userId}`);
        return c.json({ error: "Forbidden - Admin access required" }, 403);
    };
}
