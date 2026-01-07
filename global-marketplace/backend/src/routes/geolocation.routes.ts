import { Hono } from 'hono';
import { GeolocationController } from '../controllers/geolocation.controller';
import { GeolocationService } from '../services/geolocation.service';
import { GeocodingService } from '../services/geocoding.service';
import { Pool } from 'pg';
import { Redis } from '@upstash/redis';

export function setupGeolocationRoutes(
    app: Hono,
    pgPool: any,
    redis: any,
    geocodingService: GeocodingService
) {
    const geoService = new GeolocationService(pgPool, redis);
    const controller = new GeolocationController(geoService, geocodingService);

    const route = new Hono();

    route.get('/nearby', (c) => controller.searchNearby(c));
    route.get('/autocomplete', (c) => controller.autocomplete(c));
    route.get('/reverse', (c) => controller.reverseGeocode(c));

    app.route('/api/locations', route);
}
