import { Hono } from 'hono';
import { VehicleController } from '../controllers/vehicle.controller';
import { VehicleService } from '../services/vehicle.service';

export function setupVehicleRoutes(app: Hono, pgPool: any) {
    const service = new VehicleService(pgPool);
    const controller = new VehicleController(service);

    const route = new Hono();

    route.post('/', (c) => controller.createVehicle(c));
    route.get('/', (c) => controller.listVehicles(c));
    route.get('/:id', (c) => controller.getVehicle(c));

    app.route('/api/vehicles', route);
}
