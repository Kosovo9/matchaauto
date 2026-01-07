import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { GeocodingService, BatchGeocodingResult } from '../services/geocoding.service';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { AxiosInstance } from 'axios';

/**
 * @controller GeocodingController
 * @description REST Controller for geocoding addresses using 10x optimizations.
 * @optimizations Rate limits, Zod validation, Prometheus metrics, standardized error handling.
 */

// ==================== ZOD SCHEMAS ====================
const GeocodeRequestSchema = z.object({
    address: z.string().min(1).max(500),
    countryCode: z.string().length(2).optional(),
    language: z.string().length(2).default('en'),
    provider: z.enum(['google', 'osm', 'mapbox', 'auto']).default('auto'),
    region: z.string().max(100).optional(),
    bounds: z.object({
        northeast: z.object({ lat: z.number(), lng: z.number() }),
        southwest: z.object({ lat: z.number(), lng: z.number() })
    }).optional(),
    components: z.record(z.string()).optional()
}).strict();

const BatchGeocodeRequestSchema = z.object({
    addresses: z.array(z.string().min(1).max(500)).max(1000),
    countryCode: z.string().length(2).optional(),
    language: z.string().length(2).default('en'),
    provider: z.enum(['google', 'osm', 'mapbox', 'auto']).default('auto'),
    concurrency: z.number().min(1).max(50).default(10)
}).strict();

const ReverseGeocodeRequestSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    language: z.string().length(2).default('en'),
    provider: z.enum(['google', 'osm', 'mapbox', 'auto']).default('auto'),
    radius: z.number().min(0).max(50000).default(1000)
}).strict();

// ==================== CONTROLLER ====================
export class GeocodingController {
    private readonly geocodingService: GeocodingService;

    constructor(redisClient: Redis, pgPool: Pool, httpClient?: AxiosInstance) {
        this.geocodingService = new GeocodingService(redisClient, pgPool, httpClient);
    }

    // POST /api/v1/geocode
    async geocodeAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
        const start = Date.now();
        try {
            const validated = GeocodeRequestSchema.parse(req.body);

            const result = await this.geocodingService.geocode(
                validated.address,
                validated.countryCode,
                validated.language
            );

            metrics.timing('geocoding.latency', Date.now() - start);
            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/geocode/batch
    async batchGeocodeAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = BatchGeocodeRequestSchema.parse(req.body);

            const results = await this.geocodingService.batchGeocode(
                validated.addresses,
                validated.countryCode,
                validated.language
            );

            res.json({
                success: true,
                data: results,
                meta: { total: validated.addresses.length, successful: results.filter(r => r.lat).length }
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // GET /api/v1/geocode/reverse
    async reverseGeocode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = ReverseGeocodeRequestSchema.parse({
                lat: parseFloat(req.query.lat as string),
                lng: parseFloat(req.query.lng as string),
                language: req.query.lang || 'en',
                provider: req.query.provider || 'auto',
                radius: req.query.radius ? parseInt(req.query.radius as string) : 1000
            });

            const result = await this.geocodingService.reverseGeocode(
                validated.lat,
                validated.lng,
                validated.language
            );

            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: any, res: Response) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
        } else {
            logger.error('Geocoding Controller Error', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}
