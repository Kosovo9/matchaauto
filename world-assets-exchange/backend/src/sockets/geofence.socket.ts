import { logger } from '../utils/logger';
import { GeofencingService } from '../services/geo-fencing.service';

export function handleGeofenceSocket(ws: any, geofencingService: GeofencingService) {
    ws.on('message', async (message: string) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'SUBSCRIBE_FENCE') {
                // Logica para subscribirse a eventos de una zona específica
                ws.send(JSON.stringify({ type: 'SUBSCRIPTION_OK', fenceId: data.payload.fenceId }));
            }
        } catch (error) {
            logger.error('Socket geofence error:', error);
        }
    });
}
