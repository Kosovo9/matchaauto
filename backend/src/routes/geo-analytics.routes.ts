
import { Hono } from 'hono';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { GeoAnalyticsController } from '../controllers/geo-analytics.controller';
import { TimezoneController } from '../controllers/timezone.controller';

export function setupAdvancedGeoRoutes(
    app: Hono,
    redis: Redis,
    pgPool: Pool
) {
    const analyticsController = new GeoAnalyticsController(redis, pgPool);
    const timezoneController = new TimezoneController(redis, pgPool);

    const anaRoute = new Hono();
    anaRoute.post('/heatmap', (c) => analyticsController.generateHeatmap(c));
    anaRoute.post('/clustering', (c) => analyticsController.performClustering(c));
    anaRoute.post('/statistics', (c) => analyticsController.calculateSpatialStatistics(c));

    app.route('/api/geo-analytics', anaRoute);

    const tzRoute = new Hono();
    tzRoute.get('/', (c) => timezoneController.getTimezone(c));
    app.route('/api/timezone', tzRoute);
}
