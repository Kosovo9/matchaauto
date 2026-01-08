
import { Context, Next } from 'hono';
import { Pool } from 'pg';
import { getUserId } from '../auth/getUserId';

/**
 * 🛡️ 10x Guard: Only Verified Sellers can access monetization features
 */
export function requireVerifiedSeller(pool: Pool) {
    return async (c: Context, next: Next) => {
        const userId = getUserId(c);

        if (!userId) {
            return c.json({ error: "Unauthorized - User ID required" }, 401);
        }

        try {
            const result = await pool.query(
                'SELECT trust_badge FROM users WHERE id = $1',
                [userId]
            );

            const userRow = result.rows[0];
            const badge = userRow?.trust_badge;

            if (badge !== 'VERIFIED') {
                return c.json({
                    code: "NOT_VERIFIED",
                    error: "Identity verification required to access this feature.",
                    action: "/dashboard/identity"
                }, 403);
            }

            await next();
        } catch (error) {
            console.error('Verification guard error:', error);
            return c.json({ error: "Internal Server Error during verification check" }, 500);
        }
    };
}
