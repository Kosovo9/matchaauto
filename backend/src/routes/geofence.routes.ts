import { Hono } from 'hono';
import { GeofenceEventsController } from '../controllers/geofence-events.controller';
import { GeofencingService } from '../services/geo-fencing.service';

export function setupGeofenceRoutes(app: Hono, redis: any, pgPool: any) {
    const service = new GeofencingService(redis, pgPool);
    const controller = new GeofenceEventsController(service);

    const route = new Hono();

    route.post('/', controller.create);
    route.post('/check', controller.checkTriggers);
    route.get('/nearby', controller.listNearby);

    app.route('/api/v1/geofences', route);
}
