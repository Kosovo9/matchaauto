import { Hono } from 'hono';
import { SpatialAnalyticsController } from '../controllers/spatial-analytics.controller';
import { GeoAnalyticsService } from '../services/geo-analytics.service';

export function setupAnalyticsRoutes(app: Hono, pgPool: any) {
    const service = new GeoAnalyticsService(pgPool);
    const controller = new SpatialAnalyticsController(service);

    const route = new Hono();

    route.get('/heatmap', controller.getHeatmap);
    route.get('/gaps', controller.getCoverageGaps);
    route.get('/behavior', controller.getBehaviorAnalysis);

    app.route('/api/v1/analytics/geo', route);
}
