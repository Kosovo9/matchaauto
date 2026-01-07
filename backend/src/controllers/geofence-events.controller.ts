import { Context } from 'hono';
import { GeoFencingService } from '../services/geo-fencing.service';
import { logger } from '../utils/logger';

export class GeofenceEventsController {
    private geofencingService: GeoFencingService;

    constructor(geofencingService: GeoFencingService) {
        this.geofencingService = geofencingService;
    }

    /**
     * Crea una nueva zona de control (Geocerca)
     */
    create = async (c: Context) => {
        try {
            const data = await c.req.json();
            const id = await this.geofencingService.createGeofence(data);
            return c.json({ success: true, id }, 201);
        } catch (error) {
            return c.json({ success: false, error: 'Failed to create geofence' }, 400);
        }
    };

    /**
     * Verifica triggers de entrada/salida para un usuario/vehículo
     */
    checkTriggers = async (c: Context) => {
        const { userId, lat, lng } = await c.req.json();
        const events = await this.geofencingService.checkProximity(userId, lat, lng);
        return c.json({ success: true, events });
    };

    /**
     * Lista geocercas activas en un Bounding Box
     */
    listNearby = async (c: Context) => {
        const { minLat, minLon, maxLat, maxLon } = c.req.query();
        const fences = await this.geofencingService.getGeofencesInArea(
            parseFloat(minLat), parseFloat(minLon), parseFloat(maxLat), parseFloat(maxLon)
        );
        return c.json({ success: true, data: fences });
    };
}
