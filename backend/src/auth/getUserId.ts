
import { Context } from 'hono';
import { getAuth } from '@hono/clerk-auth';

/**
 * 🔐 Extracts UserID from Clerk Session or Dev Mock
 */
export function getUserId(c: Context): string | null {
    // 1. Try Clerk Auth (Production Standard)
    try {
        const auth = getAuth(c);
        if (auth?.userId) return auth.userId;
    } catch (e) {
        // getAuth might throw if middleware is missing, fall through to dev mock
    }

    // 2. Dev Mock Fallback (Crucial for Smoke Tests & Local Dev)
    if (process.env.NODE_ENV !== "production") {
        const devId = c.req.header("x-user-id");
        if (devId) return String(devId);
    }

    return null;
}
