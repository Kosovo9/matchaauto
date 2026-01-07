import { Hono } from 'hono';
import { GeoSearchController } from '../controllers/geo-search.controller';
import { RadiusSearchService } from '../services/radius-search.service';
import { GeocodingService } from '../services/geocoding.service';

export function setupSearchRoutes(app: Hono, redis: any, pgPool: any) {
    const radiusService = new RadiusSearchService(redis, pgPool);
    const geocodingService = new GeocodingService(redis, pgPool);
    const controller = new GeoSearchController(radiusService, geocodingService);

    const route = new Hono();

    route.get('/', controller.search);

    app.route('/api/v1/search', route);
}
