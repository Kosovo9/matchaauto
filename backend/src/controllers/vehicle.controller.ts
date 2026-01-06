import { Context } from 'hono';
import { VehicleService } from '../services/vehicle.service';
import { logger } from '../utils/logger';

export class VehicleController {
    private vehicleService: VehicleService;

    constructor(vehicleService: VehicleService) {
        this.vehicleService = vehicleService;
    }

    async createVehicle(c: Context) {
        try {
            const body = await c.req.json();
            const vehicle = await this.vehicleService.createVehicle(body);
            return c.json({ success: true, data: vehicle }, 201);
        } catch (error) {
            logger.error('Create vehicle failed:', error);
            return c.json({ success: false, error: 'Failed to create vehicle' }, 400);
        }
    }

    async getVehicle(c: Context) {
        const id = c.req.param('id');
        const vehicle = await this.vehicleService.getVehicleById(id);
        if (!vehicle) return c.json({ success: false, error: 'Not found' }, 404);
        return c.json({ success: true, data: vehicle });
    }

    async listVehicles(c: Context) {
        const type = c.req.query('type');
        const brand = c.req.query('brand');
        const maxPrice = c.req.query('max_price') ? parseFloat(c.req.query('max_price')!) : undefined;

        const vehicles = await this.vehicleService.listVehicles({ type, brand, maxPrice });
        return c.json({ success: true, data: vehicles });
    }
}
