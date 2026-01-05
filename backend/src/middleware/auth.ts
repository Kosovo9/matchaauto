import { Context, Next } from 'hono'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'

export const protectRoute = async (c: Context, next: Next) => {
    const auth = getAuth(c)
    if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401)
    }
    await next()
}
