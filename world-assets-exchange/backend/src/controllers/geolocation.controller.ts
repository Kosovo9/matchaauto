import { Context } from 'hono';
import { GeolocationService } from '../services/geolocation.service';
import { GeocodingService } from '../services/geocoding.service';
import { logger } from '../utils/logger';

export class GeolocationController {
    private geoService: GeolocationService;
    private geocodingService: GeocodingService;

    constructor(geoService: GeolocationService, geocodingService: GeocodingService) {
        this.geoService = geoService;
        this.geocodingService = geocodingService;
    }

    async searchNearby(c: Context) {
        try {
            const lat = parseFloat(c.req.query('lat') || '0');
            const lng = parseFloat(c.req.query('lng') || '0');
            const radius = parseFloat(c.req.query('radius') || '5000');

            const results = await this.geoService.searchNearby(lat, lng, radius);

            return c.json({
                success: true,
                data: results,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Nearby search failed:', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    }

    async autocomplete(c: Context) {
        try {
            const query = c.req.query('q') || '';
            const country = c.req.query('country');

            const suggestions = await this.geocodingService.geocode(query);

            return c.json({
                success: true,
                data: suggestions
            });
        } catch (error) {
            return c.json({ success: false, error: 'Autocomplete failed' }, 500);
        }
    }

    async reverseGeocode(c: Context) {
        try {
            const lat = parseFloat(c.req.query('lat') || '0');
            const lng = parseFloat(c.req.query('lng') || '0');

            const address = await this.geocodingService.reverseGeocode(lat, lng);

            return c.json({
                success: true,
                data: address
            });
        } catch (error) {
            return c.json({ success: false, error: 'Reverse geocode failed' }, 500);
        }
    }
}
