import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { ReverseGeocodingService, BatchReverseGeocodingResult } from '../services/reverse-geocoding.service';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { AxiosInstance } from 'axios';

/**
 * @controller ReverseGeocodingController
 * @description REST Controller for reverse geocoding coordinates to addresses using 10x optimizations.
 * @optimizations Spatial Cache, Zod validation, Multi-format support (JSON/XML/GeoJSON).
 */

// ==================== ZOD SCHEMAS ====================
// Simplified Zod schemas for implementation
const ReverseGeocodeRequestSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    language: z.string().length(2).default('en'),
    provider: z.enum(['google', 'osm', 'mapbox', 'auto']).default('auto'),
    radius: z.number().min(0).max(50000).default(100),
    format: z.enum(['json', 'xml', 'csv', 'geojson']).default('json')
}).strict();

const BatchReverseGeocodeRequestSchema = z.object({
    coordinates: z.array(z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
    })).min(1).max(1000),
    language: z.string().length(2).default('en'),
    provider: z.enum(['google', 'osm', 'mapbox', 'auto']).default('auto'),
    concurrency: z.number().min(1).max(50).default(10)
}).strict();

// ==================== CONTROLLER ====================
export class ReverseGeocodingController {
    private readonly reverseGeocodingService: ReverseGeocodingService;

    constructor(redisClient: Redis, pgPool: Pool, httpClient?: AxiosInstance) {
        this.reverseGeocodingService = new ReverseGeocodingService(redisClient, pgPool, httpClient);
    }

    // GET /api/v1/reverse-geocode
    async reverseGeocode(req: Request, res: Response, next: NextFunction): Promise<void> {
        const start = Date.now();
        try {
            const validated = ReverseGeocodeRequestSchema.parse({
                lat: parseFloat(req.query.lat as string),
                lng: parseFloat(req.query.lng as string),
                language: req.query.lang || 'en',
                provider: req.query.provider || 'auto',
                radius: req.query.radius ? parseInt(req.query.radius as string) : 100,
                format: req.query.format || 'json'
            });

            const result = await this.reverseGeocodingService.reverseGeocode(
                validated.lat,
                validated.lng,
                validated.language,
                validated.provider
            );

            metrics.timing('reverse_geocoding.latency', Date.now() - start);

            // Handle Different Formats
            if (validated.format === 'xml') {
                res.set('Content-Type', 'application/xml');
                res.send(this.toXML(result));
            } else if (validated.format === 'geojson') {
                res.json(this.toGeoJSON(result));
            } else {
                res.json({ success: true, data: result });
            }
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/reverse-geocode/batch
    async batchReverseGeocode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = BatchReverseGeocodeRequestSchema.parse(req.body);

            const results = await this.reverseGeocodingService.batchReverseGeocode(
                validated.coordinates,
                validated.language,
                validated.provider,
                validated.concurrency
            );

            res.json({
                success: true,
                data: results,
                meta: { total: validated.coordinates.length, successful: results.filter(r => r.formattedAddress).length }
            });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // Helper: Convert to XML (Simplified)
    private toXML(data: any): string {
        return `<ReverseGeocodeResult><Address>${data.formattedAddress}</Address></ReverseGeocodeResult>`;
    }

    // Helper: Convert to GeoJSON
    private toGeoJSON(data: any) {
        return {
            type: "Feature",
            geometry: { type: "Point", coordinates: [data.geometry?.location.lng, data.geometry?.location.lat] },
            properties: { address: data.formattedAddress }
        };
    }

    private handleError(error: any, res: Response) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
        } else {
            logger.error('Reverse Geocoding Controller Error', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}
