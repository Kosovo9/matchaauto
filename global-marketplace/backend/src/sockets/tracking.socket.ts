import { logger } from '../utils/logger';
import { VehicleTrackingService } from '../services/vehicle-tracking.service';

export function handleTrackingSocket(ws: any, vehicleTrackingService: VehicleTrackingService) {
    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'UPDATE_LOCATION') {
                await vehicleTrackingService.updateLocation(data.payload);
                ws.send(JSON.stringify({ type: 'ACK', status: 'UPDATED' }));
            }
        } catch (error) {
            logger.error('Socket tracking error:', error);
        }
    });

    ws.on('close', () => {
        logger.info('Tracking socket closed');
    });
}
