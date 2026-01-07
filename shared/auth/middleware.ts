import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export const authMiddleware = async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: 'No token provided' }, 401);

    const token = authHeader.split(' ')[1];
    try {
        const payload = await verify(token, process.env.JWT_SECRET || 'secret-1000x');
        c.set('jwtPayload', payload);
        await next();
    } catch (e) {
        return c.json({ error: 'Invalid token' }, 401);
    }
};

export const roleGuard = (roles: string[]) => {
    return async (c: Context, next: Next) => {
        const payload = c.get('jwtPayload');
        if (!roles.includes(payload.role)) {
            return c.json({ error: 'Unauthorized: Role missing' }, 403);
        }
        await next();
    };
};
