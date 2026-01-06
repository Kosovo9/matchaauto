import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { NotificationService, NotificationSchema } from '../services/notification.service';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { WebSocketServer } from 'ws';

/**
 * @controller NotificationController
 * @description Controller for sending and managing notifications
 */

export class NotificationController {
    private notificationService: NotificationService;

    constructor(redisClient: Redis, pgPool: Pool, wss: WebSocketServer) {
        this.notificationService = new NotificationService(redisClient, pgPool, wss);
    }

    // POST /api/v1/notifications/send
    // (Usually Admin or System internal use, but exposed for testing/dev)
    async sendNotification(req: Request, res: Response) {
        try {
            const validated = NotificationSchema.parse(req.body);

            await this.notificationService.send(validated);

            res.json({ success: true, message: 'Notification dispatched' });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // GET /api/v1/notifications/history
    async getHistory(req: Request, res: Response) {
        // Implementation pending (fetching from DB table 'notifications')
        // For now, return stub
        res.json({ success: true, data: [] });
    }

    private handleError(error: any, res: Response) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
        } else {
            logger.error('Notification Controller Error', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}
