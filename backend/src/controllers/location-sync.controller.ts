import { Context } from 'hono';
import { VehicleTrackingService } from '../services/vehicle-tracking.service';
import { logger } from '../utils/logger';

export class LocationSyncController {
    private trackingService: VehicleTrackingService;

    constructor(trackingService: VehicleTrackingService) {
        this.trackingService = trackingService;
    }

    /**
     * Recibe actualizaciones de GPS masivas de dispositivos/apps
     */
    sync = async (c: Context) => {
        try {
            const body = await c.req.json();
            // Optimization: Batch sync if body is array
            const updates = Array.isArray(body) ? body : [body];

            for (const update of updates) {
                await this.trackingService.updateVehiclePosition(update);
            }

            return c.json({ success: true, count: updates.length });
        } catch (error) {
            logger.error('Location sync failed:', error);
            return c.json({ success: false, error: 'Sync failed' }, 400);
        }
    };

    /**
     * Obtiene la posición live de un activo
     */
    getLive = async (c: Context) => {
        const id = c.req.param('id');
        const location = await this.trackingService.getCurrentPosition(id);
        if (!location) return c.json({ success: false, error: 'Vehicle offline' }, 404);
        return c.json({ success: true, data: location });
    };
}
