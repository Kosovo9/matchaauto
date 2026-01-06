import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { MarketplaceService, SearchFilterSchema } from '../services/marketplace.service';
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

    // GET /api/v1/marketplace/search
    async searchListings(req: Request, res: Response) {
        const start = Date.now();
        try {
            // Parse Query Params to SearchFilter
            // Note: Express query params are strings, so we need some casting logic
            // Simplified casting for brevity
            const filters: any = { ...req.query };

            if (filters.minPrice) filters.minPrice = Number(filters.minPrice);
            if (filters.maxPrice) filters.maxPrice = Number(filters.maxPrice);
            if (filters.lat && filters.lng && filters.radius) {
                filters.location = {
                    lat: Number(filters.lat),
                    lng: Number(filters.lng),
                    radius: Number(filters.radius)
                };
            }

            const result = await this.marketplaceService.search(filters);

            metrics.timing('marketplace.search_latency', Date.now() - start);
            res.json({ success: true, data: result });
        } catch (error) {
            logger.error('Search failed', error);
            res.status(500).json({ success: false, error: 'Search failed' });
        }
    }

    // POST /api/v1/marketplace/listings
    async createListing(req: Request, res: Response) {
        try {
            const validated = CreateListingSchema.parse(req.body);

            // 1. Create Vehicle
            const vehicle = await this.vehicleService.createVehicle(validated);

            // 2. Trigger Proactive Matching (Async)
            // Don't await this, let it run in background to wow the user later
            this.matchingEngine.findBuyersForNewVehicle(vehicle.id).catch(err => {
                logger.error('Failed to trigger auto-match', err);
            });

            res.status(201).json({ success: true, data: vehicle });
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
            } else {
                logger.error('Create listing failed', error);
                res.status(500).json({ success: false, error: 'Failed to create listing' });
            }
        }
    }

    // GET /api/v1/marketplace/listings/:id
    async getListing(req: Request, res: Response) {
        try {
            const id = req.params.id;
            const vehicle = await this.vehicleService.getVehicle(id);

            if (!vehicle) {
                return res.status(404).json({ success: false, error: 'Listing not found' });
            }

            // Track View (Analytics)
            // await analytics.trackView(id, req.user?.id);

            res.json({ success: true, data: vehicle });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch listing' });
        }
    }
}
