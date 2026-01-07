import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { MarketplaceService, SearchFilterSchema } from '../services/marketplace.service';
import { VehicleService } from '../services/vehicle.service';
import { MatchingEngineService } from '../services/matching-engine.service';
import { logger } from '../utils/logger';

const marketplace = new Hono();

// Schemas
const CreateListingSchema = z.object({
    userId: z.string().uuid(),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    price: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'MXN', 'GBP']).default('USD'),
    mileage: z.number().min(0),
    vin: z.string().optional(),
    location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string().optional()
    }),
    images: z.array(z.string().url()).max(20).optional(),
    features: z.array(z.string()).optional(),
    description: z.string().max(2000).optional()
});

// --- ROUTES ---

// GET /search
marketplace.get('/search', async (c) => {
    const start = Date.now();
    try {
        const query = c.req.query();
        const filters: any = { ...query };

        // Cast numeric fields
        if (filters.minPrice) filters.minPrice = Number(filters.minPrice);
        if (filters.maxPrice) filters.maxPrice = Number(filters.maxPrice);
        if (filters.lat && filters.lng && filters.radius) {
            filters.lat = Number(filters.lat);
            filters.lng = Number(filters.lng);
            filters.radius = Number(filters.radius);
        }

        // Access services from context (setup in index.ts)
        const marketplaceService = c.get('marketplaceService') as MarketplaceService;
        const result = await marketplaceService.search(filters);

        return c.json({ success: true, data: result });
    } catch (error) {
        logger.error('Search failed', error);
        return c.json({ success: false, error: 'Search failed' }, 500);
    }
});

// POST /listings
marketplace.post('/listings', zValidator('json', CreateListingSchema), async (c) => {
    try {
        const validated = c.req.valid('json');
        const vehicleService = c.get('vehicleService') as VehicleService;
        const matchingEngine = c.get('matchingEngine') as MatchingEngineService;

        const vehicle = await vehicleService.createVehicle(validated as any);

        // Background matching
        matchingEngine.findBuyersForNewVehicle(vehicle.id!).catch(err => {
            logger.error('Failed to trigger auto-match', err);
        });

        return c.json({ success: true, data: vehicle }, 201);
    } catch (error) {
        logger.error('Create listing failed', error);
        return c.json({ success: false, error: 'Failed to create listing' }, 500);
    }
});

// GET /listings/:id
marketplace.get('/listings/:id', async (c) => {
    const id = c.req.param('id');
    const vehicleService = c.get('vehicleService') as VehicleService;

    try {
        const vehicle = await vehicleService.getVehicle(id);
        if (!vehicle) {
            return c.json({ success: false, error: 'Listing not found' }, 404);
        }
        return c.json({ success: true, data: vehicle });
    } catch (error) {
        return c.json({ success: false, error: 'Failed to fetch listing' }, 500);
    }
});

export default marketplace;
