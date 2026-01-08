
import { Hono } from 'hono';
import { VehicleController } from '../controllers/vehicle.controller';
import { VehicleService } from '../services/vehicle.service';
import { LocationCacheService } from '../services/location-cache.service';
import { GeocodingService } from '../services/geocoding.service';
import { Redis } from 'ioredis';
import { Pool } from 'pg';

export function setupVehicleRoutes(app: Hono, pgPool: Pool, redis: Redis, geocodingService: GeocodingService) {
    const locationCacheService = new LocationCacheService(redis, pgPool);
    const service = new VehicleService(redis, pgPool, locationCacheService, geocodingService);
    const controller = new VehicleController(service);

    const route = new Hono();

    route.post('/', (c) => controller.createVehicle(c));
    route.get('/', (c) => controller.listVehicles(c));
    route.get('/:id', (c) => controller.getVehicle(c));

    app.route('/api/vehicles', route);
}
