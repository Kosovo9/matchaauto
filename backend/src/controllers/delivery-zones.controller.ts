import { Context } from 'hono';
import { GeofencingService } from '../services/geo-fencing.service';
import { logger } from '../utils/logger';

export class DeliveryZonesController {
    private geofencingService: GeofencingService;

    constructor(geofencingService: GeofencingService) {
        this.geofencingService = geofencingService;
    }

    /**
     * Define una zona operativa/entrega
     */
    defineZone = async (c: Context) => {
        try {
            const data = await c.req.json();
            const metadata = { ...data.metadata, category: 'DELIVERY_ZONE' };
            const id = await this.geofencingService.createGeofence({ ...data, metadata });
            return c.json({ success: true, id });
        } catch (error) {
            return c.json({ success: false, error: 'Zone definition failed' }, 400);
        }
    };

    /**
     * Verifica si una ubicación tiene cobertura de entrega
     */
    checkCoverage = async (c: Context) => {
        const { lat, lng } = c.req.query();
        const zones = await this.geofencingService.checkProximity('system', parseFloat(lat), parseFloat(lng));
        const hasCoverage = zones.some(z => z.type === 'ENTER' || z.type === 'inside');
        return c.json({ success: true, hasCoverage, zones: zones.length });
    };
}
