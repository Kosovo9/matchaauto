import { Context } from 'hono';
import { RadiusSearchService } from '../services/radius-search.service';
import { GeocodingService } from '../services/geocoding.service';
import { logger } from '../utils/logger';

export class GeoSearchController {
    private radiusSearchService: RadiusSearchService;
    private geocodingService: GeocodingService;

    constructor(radiusSearchService: RadiusSearchService, geocodingService: GeocodingService) {
        this.radiusSearchService = radiusSearchService;
        this.geocodingService = geocodingService;
    }

    /**
     * Búsqueda por ubicación textual o coordenadas
     */
    search = async (c: Context) => {
        try {
            const q = c.req.query('q');
            const lat = c.req.query('lat');
            const lng = c.req.query('lng');
            const radius = parseInt(c.req.query('radius') || '5000');

            let searchLat, searchLng;

            if (q) {
                const geocodeResults = await this.geocodingService.geocode(q);
                if (geocodeResults.length === 0) return c.json({ success: false, error: 'Location not found' }, 404);
                searchLat = geocodeResults[0].latitude;
                searchLng = geocodeResults[0].longitude;
            } else if (lat && lng) {
                searchLat = parseFloat(lat);
                searchLng = parseFloat(lng);
            } else {
                return c.json({ success: false, error: 'Query or Coordinates required' }, 400);
            }

            const results = await this.radiusSearchService.search({
                latitude: searchLat,
                longitude: searchLng,
                radius,
                unit: 'meters',
                filters: {}
            });

            return c.json({
                success: true,
                data: results,
                metadata: { executionTime: results.executionTime, cacheHit: results.cacheHit }
            });
        } catch (error) {
            logger.error('Geo search controller error:', error);
            return c.json({ success: false, error: 'Search failed' }, 500);
        }
    };
}
