import { Context } from 'hono';
import { z } from 'zod';
import { logger } from './logger';

export function handleError(error: unknown, c: Context) {
    if (error instanceof z.ZodError) {
        return c.json({ success: false, error: 'Validation Error', details: error.issues }, 400);
    }

    logger.error('Unhandled Error:', error);

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return c.json({ success: false, error: message }, 500);
}
