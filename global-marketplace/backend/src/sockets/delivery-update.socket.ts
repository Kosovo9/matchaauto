import { logger } from '../utils/logger';

export function handleDeliveryUpdateSocket(ws: any) {
    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'DELIVERY_STATUS_CHANGE') {
                logger.info(`Delivery ${data.payload.id} changed to ${data.payload.status}`);
                // Broadcast to relevant users (Customer/Dispatcher)
                ws.send(JSON.stringify({ type: 'STATUS_ACK' }));
            }
        } catch (error) {
            logger.error('Socket delivery update error:', error);
        }
    });
}
