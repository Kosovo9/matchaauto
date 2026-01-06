import { Context } from 'hono';
import { logger } from '../utils/logger';

export const errorMiddleware = (err: Error, c: Context) => {
    logger.error('Unhandled Exception:', {
        message: err.message,
        stack: err.stack,
        path: c.req.path,
        method: c.req.method,
    });

    if (err.name === 'ZodError') {
        return c.json({
            success: false,
            error: 'Validation failed',
            details: JSON.parse(err.message)
        }, 400);
    }

    return c.json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    }, 500);
};
