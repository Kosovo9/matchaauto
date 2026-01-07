import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import WebSocket, { Server as WebSocketServer } from 'ws';

// ==================== ZOD SCHEMAS ====================
export const NotificationType = z.enum(['system', 'alert', 'match_found', 'payment_success', 'payment_failed', 'ad_approved']);
export const NotificationChannel = z.enum(['in_app', 'email', 'push', 'sms', 'all']);

export const NotificationSchema = z.object({
    userId: z.string().uuid(),
    type: NotificationType,
    title: z.string().max(100),
    body: z.string().max(500),
    metadata: z.record(z.string(), z.any()).optional(),
    channels: z.array(NotificationChannel).default(['in_app']),
    priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal')
});

// ==================== NOTIFICATION SERVICE ====================
export class NotificationService {
    private redis: Redis;
    private pgPool: Pool;
    private wss: WebSocketServer;

    // Connection Map: userId -> Set<WebSocket> (One user can have multiple devices)
    private connections: Map<string, Set<WebSocket>> = new Map();

    constructor(redis: Redis, pgPool: Pool, wss: WebSocketServer) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.wss = wss;

        // Handle Socket Connections
        this.wss.on('connection', (ws: WebSocket & { userId?: string }, req) => {
            // Auth Logic (simplified) - Extracts userId from URL/Token
            // In real impl, check JWT here
            const userId = this.extractUserId(req);
            if (userId) {
                ws.userId = userId;
                this.addConnection(userId, ws);
                logger.info(`User ${userId} connected to notifications`);
            }

            ws.on('close', () => {
                if (ws.userId) this.removeConnection(ws.userId, ws);
            });
        });
    }

    // PUBLIC: Send Notification
    async send(payload: z.infer<typeof NotificationSchema>) {
        const validated = NotificationSchema.parse(payload);

        // 1. Persist (Always save in-app notifications)
        const notificationId = await this.persistNotification(validated);

        // 2. Dispatch Channels in Parallel
        const promises: Promise<any>[] = [];

        if (validated.channels.includes('in_app') || validated.channels.includes('all')) {
            promises.push(this.sendInApp(validated.userId, { ...validated, id: notificationId }));
        }

        if (validated.channels.includes('push') || validated.channels.includes('all')) {
            promises.push(this.sendPush(validated));
        }

        if (validated.channels.includes('email') || validated.channels.includes('all')) {
            promises.push(this.sendEmail(validated));
        }

        await Promise.allSettled(promises);
        metrics.increment('notifications.sent', { type: validated.type });
    }

    // CHANNEL: In-App (WebSocket + Redis Pub/Sub for scale)
    private async sendInApp(userId: string, data: any) {
        // Direct Socket Send (if connected to THIS instance)
        const clients = this.connections.get(userId);
        if (clients && clients.size > 0) {
            const msg = JSON.stringify(data);
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) client.send(msg);
            });
        } else {
            // If user is not here, maybe they are on another server instance
            // Publish to Redis so other instances can deliver
            await this.redis.publish('notifications:dispatch', JSON.stringify({ userId, data }));
        }
    }

    // CHANNEL: Push Notification (Firebase / Expo)
    private async sendPush(data: any) {
        // Mock Integration
        // const tokens = await this.getUserPushTokens(data.userId);
        // await fcm.sendMulticast({ tokens, notification: { title: data.title, body: data.body } });
    }

    // CHANNEL: Email (SendGrid / AWS SES)
    private async sendEmail(data: any) {
        // Mock Integration
        // await resend.emails.send({ ... });
    }

    // Persistence
    private async persistNotification(data: any): Promise<string> {
        const client = await this.pgPool.connect();
        try {
            const res = await client.query(`
             INSERT INTO notifications (user_id, type, title, body, data, channels, read_at)
             VALUES ($1, $2, $3, $4, $5, $6, NULL)
             RETURNING id
          `, [data.userId, data.type, data.title, data.body, data.data, data.channels]);
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    // Socket Management
    private extractUserId(req: any): string | null {
        // Parse query string ?userId=... (Secure with JWT in headers normally)
        const url = req.url || '';
        const match = url.match(/userId=([^&]*)/);
        return match ? match[1] : null;
    }

    private addConnection(userId: string, ws: WebSocket) {
        if (!this.connections.has(userId)) {
            this.connections.set(userId, new Set());
        }
        this.connections.get(userId)!.add(ws);
    }

    private removeConnection(userId: string, ws: WebSocket) {
        const set = this.connections.get(userId);
        if (set) {
            set.delete(ws);
            if (set.size === 0) this.connections.delete(userId);
        }
    }
}
