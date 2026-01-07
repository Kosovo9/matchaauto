import { logger } from '../utils/logger';
import Redis from 'ioredis';

export function handleDriverAvailabilitySocket(ws: any, redis: Redis) {
    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'SET_AVAILABILITY') {
                const { driverId, status } = data.payload;
                await redis.set(`driver:${driverId}:available`, status);
                ws.send(JSON.stringify({ type: 'AVAILABILITY_SET', status }));
            }
        } catch (error) {
            logger.error('Socket driver availability error:', error);
        }
    });
}
