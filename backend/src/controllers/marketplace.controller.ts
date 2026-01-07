import { Context } from 'hono';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { MarketplaceService } from '../services/marketplace.service';
import { VehicleService } from '../services/vehicle.service';
import { MatchingEngineService } from '../services/matching-engine.service';

/**
 * @controller MarketplaceController
 * @description Controller for Marketplace Listings, Search, and Vehicle Management
 */

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

export class MarketplaceController {
    private marketplaceService: MarketplaceService;
    private vehicleService: VehicleService;
    private matchingEngine: MatchingEngineService;

    constructor(
        marketplaceService: MarketplaceService,
        vehicleService: VehicleService,
        matchingEngine: MatchingEngineService
    ) {
        this.marketplaceService = marketplaceService;
        this.vehicleService = vehicleService;
        this.matchingEngine = matchingEngine;
    }

    async searchListings(c: Context) {
        const start = Date.now();
        try {
            const query = c.req.query();
            const filters: any = { ...query };

            if (filters.minPrice) filters.minPrice = Number(filters.minPrice);
            if (filters.maxPrice) filters.maxPrice = Number(filters.maxPrice);
            if (filters.lat) filters.lat = Number(filters.lat);
            if (filters.lng) filters.lng = Number(filters.lng);
            if (filters.radius) filters.radius = Number(filters.radius);
            if (filters.page) filters.page = Number(filters.page);
            if (filters.limit) filters.limit = Number(filters.limit);

            const result = await this.marketplaceService.search(filters);

            metrics.timing('marketplace.search_latency', Date.now() - start);
            return c.json({ success: true, data: result });
        } catch (error) {
            logger.error('Search failed', error);
            return c.json({ success: false, error: 'Search failed' }, 500);
        }
    }

    async createListing(c: Context) {
        try {
            const body = await c.req.json();
            const validated = CreateListingSchema.parse(body);

            const vehicle = await this.vehicleService.createVehicle({
                ownerId: validated.userId,
                status: 'draft',
                mileageUnit: 'km',
                ...validated
            } as any);

            // Auto-match trigger
            // this.matchingEngine.findMatches(vehicle.id).catch(err => {
            //     logger.error('Failed to trigger auto-match', err);
            // });

            return c.json({ success: true, data: vehicle }, 201);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return c.json({ success: false, error: 'Validation Error', details: (error as z.ZodError).errors }, 400);
            } else {
                logger.error('Create listing failed', error);
                return c.json({ success: false, error: 'Failed to create listing' }, 500);
            }
        }
    }

    async getListing(c: Context) {
        try {
            const id = c.req.param('id');
            const vehicle = await this.vehicleService.getVehicle(id);

            if (!vehicle) {
                return c.json({ success: false, error: 'Listing not found' }, 404);
            }

            return c.json({ success: true, data: vehicle });
        } catch (error) {
            return c.json({ success: false, error: 'Failed to fetch listing' }, 500);
        }
    }
}
