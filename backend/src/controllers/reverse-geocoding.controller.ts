import { Context } from 'hono';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { ReverseGeocodingService } from '../services/reverse-geocoding.service';
import Redis from 'ioredis';
import { Pool } from 'pg';

/**
 * @controller ReverseGeocodingController
 * @description REST Controller for reverse geocoding coordinates to addresses using 10x optimizations.
 */

// ==================== ZOD SCHEMAS ====================
const ReverseGeocodeRequestSchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    language: z.string().length(2).default('en'),
    provider: z.enum(['google', 'osm', 'mapbox', 'auto']).default('auto'),
    radius: z.coerce.number().min(0).max(50000).default(100),
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

    constructor(redisClient: Redis, pgPool: Pool) {
        this.reverseGeocodingService = new ReverseGeocodingService(redisClient, pgPool);
    }

    async reverseGeocode(c: Context) {
        const start = Date.now();
        try {
            const query = {
                lat: c.req.query('lat'),
                lng: c.req.query('lng'),
                lang: c.req.query('lang'),
                provider: c.req.query('provider'),
                radius: c.req.query('radius'),
                format: c.req.query('format')
            };
            const validated = ReverseGeocodeRequestSchema.parse(query);

            const result = await this.reverseGeocodingService.reverseGeocode(
                validated.lat,
                validated.lng,
                {
                    language: validated.language,
                    radius: validated.radius
                }
            );

            metrics.timing('reverse_geocoding.latency', Date.now() - start);

            if (validated.format === 'xml') {
                c.header('Content-Type', 'application/xml');
                return c.body(this.toXML(result));
            } else if (validated.format === 'geojson') {
                return c.json(this.toGeoJSON(result));
            } else {
                return c.json({ success: true, data: result });
            }
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    async batchReverseGeocode(c: Context) {
        try {
            const body = await c.req.json();
            const validated = BatchReverseGeocodeRequestSchema.parse(body);

            const coordinates = validated.coordinates.map(c => ({ latitude: c.lat, longitude: c.lng }));
            const results = await this.reverseGeocodingService.batchReverseGeocode(coordinates, {
                language: validated.language
            });

            return c.json({
                success: true,
                data: results,
                meta: { total: validated.coordinates.length }
            });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    private toXML(data: any): string {
        const firstResult = data.results?.[0]?.formattedAddress || '';
        return `<ReverseGeocodeResult><Address>${firstResult}</Address></ReverseGeocodeResult>`;
    }

    private toGeoJSON(data: any) {
        const firstResult = data.results?.[0];
        if (!firstResult) return { type: "FeatureCollection", features: [] };

        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [firstResult.longitude, firstResult.latitude]
            },
            properties: { address: firstResult.formattedAddress }
        };
    }

    private handleError(error: any, c: Context) {
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        } else {
            logger.error('Reverse Geocoding Controller Error', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    }
}
