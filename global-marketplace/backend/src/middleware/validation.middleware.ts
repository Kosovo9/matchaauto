import { Context, Next } from 'hono';
import { z } from 'zod';

export const validate = (schema: z.ZodSchema) => {
    return async (c: Context, next: Next) => {
        try {
            const body = await c.req.json();
            schema.parse(body);
            return await next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return c.json({
                    success: false,
                    error: 'Validation Error',
                    details: error.errors
                }, 400);
            }
            return c.json({ success: false, error: 'Invalid Request Body' }, 400);
        }
    };
};
