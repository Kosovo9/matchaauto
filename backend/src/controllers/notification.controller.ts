import { Context } from 'hono';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { NotificationService, NotificationSchema } from '../services/notification.service';
import Redis from 'ioredis';
import { Pool } from 'pg';

export class NotificationController {
    private notificationService: NotificationService;

    constructor(redisClient: Redis, pgPool: Pool, wss: any) {
        this.notificationService = new NotificationService(redisClient, pgPool, wss);
    }

    async sendNotification(c: Context) {
        try {
            const body = await c.req.json();
            const validated = NotificationSchema.parse(body);

            await this.notificationService.send(validated);

            metrics.increment('notifications.sent');
            return c.json({ success: true, message: 'Notification dispatched' });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    async getHistory(c: Context) {
        return c.json({ success: true, data: [] });
    }

    private handleError(error: any, c: Context) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: (error as z.ZodError).errors }, 400);
        } else {
            logger.error('Notification Controller Error', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    }
}
