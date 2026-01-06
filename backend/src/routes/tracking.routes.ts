import { Hono } from 'hono';
import { LocationSyncController } from '../controllers/location-sync.controller';
import { VehicleTrackingService } from '../services/vehicle-tracking.service';

export function setupTrackingRoutes(app: Hono, redis: any, pgPool: any) {
    const service = new VehicleTrackingService(redis, pgPool);
    const controller = new LocationSyncController(service);

    const route = new Hono();

    route.post('/sync', controller.sync);
    route.get('/:id/live', controller.getLive);

    app.route('/api/v1/tracking', route);
}
