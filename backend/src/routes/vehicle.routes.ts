// backend/src/routes/vehicle.routes.ts
import { Hono } from 'hono';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { VINDecoderService } from '../services/vin-decoder.service';
import { GeocodingService } from '../services/geocoding.service';

const setupVehicleRoutes = (app: Hono, pg: Pool, redis: Redis, geocoding: GeocodingService) => {
    app.get('/api/vehicle/decode/:vin', async (c) => {
        const vin = c.req.param('vin');
        const service = new VINDecoderService(redis);

        try {
            const data = await service.decode(vin);
            return c.json(data);
        } catch (e) {
            return c.json({ error: 'VIN decoding failed' }, 400);
        }
    });

    app.get('/api/vehicle/catalog', async (c) => {
        return c.json([
            { id: '1', title: 'Tesla Model S', price: 80000, img: '/hero-car.png' },
            { id: '2', title: 'Ford Raptor', price: 95000, img: '/interior.png' }
        ]);
    });
};

export { setupVehicleRoutes };
