import { Hono } from 'hono';
import { GeofencingController } from '../controllers/geo-fencing.controller';

export function setupGeofenceRoutes(app: Hono, redis: any, pgPool: any) {
    const controller = new GeofencingController(redis, pgPool);

    const route = new Hono();

    // CRUD
    route.post('/', (c) => controller.createGeofence(c));
    route.put('/:id', (c) => controller.updateGeofence(c));
    route.delete('/:id', (c) => controller.deleteGeofence(c));
    route.get('/:id', (c) => controller.getGeofence(c));
    route.get('/', (c) => controller.listGeofences(c));

    // Advanced & Real-time
    route.post('/assign', (c) => controller.assignEntities(c));
    route.post('/batch-assign', (c) => controller.batchAssign(c));
    route.delete('/:geofenceId/assign/:entityType/:entityId', (c) => controller.removeAssignment(c));
    route.post('/check-status', (c) => controller.checkStatus(c));
    route.post('/monitor', (c) => controller.realTimeMonitoring(c));
    route.get('/:id/analytics', (c) => controller.getAnalytics(c));
    route.post('/rules/complex', (c) => controller.createComplexRule(c));

    app.route('/api/v1/geofences', route);
}
