import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { validateEnv } from './config/env';
import { setupDatabase } from './config/database';
import { setupRedis } from './config/redis';
import { setupGeolocationRoutes } from './routes/geolocation.routes';
import { setupVehicleRoutes } from './routes/vehicle.routes';
// Controladores PRO 1000x (Real Estate Specialized)
import assetsController from './controllers/assets.controller';
import proFeatures from './controllers/pro-features.controller';
import killer from './controllers/competitor-killer.controller';
import tradingController from './controllers/trading.controller';
import adsController from './controllers/ads.controller';
import wholesaleController from './controllers/wholesale.controller';
import growthController from './controllers/growth.controller';
import identityController from './controllers/sovereign-identity.controller';
import juryController from './controllers/leader-jury.controller';
import mediaController from './controllers/media-pro.controller';
import deliveryController from './controllers/delivery.controller';
import escrowController from './controllers/escrow.controller';
import { setupSearchRoutes } from './routes/search.routes';
import { setupGeofenceRoutes } from './routes/geofence.routes';
import { setupPlanningRoutes } from './routes/routes.routes';
import { setupTrackingRoutes } from './routes/tracking.routes';
import { setupAnalyticsRoutes } from './routes/analytics.routes';
import { setupLocationRoutes } from './routes/location.routes';
import { setupWebhookRoutes } from './routes/webhook.routes';
import { setupCommunityResilienceRoutes } from './routes/community-resilience.routes';
import { setupAdvancedGeoRoutes } from './routes/geo-analytics.routes';
import { setupGeospatialRoutes } from './routes/geospatial.routes';
import { setupHubsRoutes } from './modules/hubs/hubs.routes';
import { GeocodingService } from './services/geocoding.service';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { swaggerUI } from '@hono/swagger-ui';

export { RateLimitStore } from './middleware/rateLimiter';
export { ChatRoom } from './chat/durable';
export { BidStreamDO } from './durable-objects/bid-stream';

const app = new Hono();

// Swagger UI
app.get('/api-docs', swaggerUI({ url: '/doc' }));
app.get('/doc', (c) => {
    return c.json({
        openapi: '3.0.0',
        info: {
            title: 'Match-Auto API',
            version: '2.0.0',
            description: '1000x High-Performance Geospatial API'
        },
        paths: {
            '/api/locations/nearby': {
                get: {
                    summary: 'Search nearby locations',
                    parameters: [
                        { name: 'lat', in: 'query', required: true, schema: { type: 'number' } },
                        { name: 'lng', in: 'query', required: true, schema: { type: 'number' } }
                    ],
                    responses: {
                        200: { description: 'Success' }
                    }
                }
            }
            // Add more paths as needed
        }
    });
});

// Prometheus Metrics
app.get('/metrics', (c) => {
    return c.text(`# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/api/locations/nearby"} 1`);
});

// Global Middleware
app.use('*', honoLogger());
app.use('*', cors());

// Initialize App
const start = async () => {
    try {
        const env = validateEnv(process.env);
        const pgPool = setupDatabase(env);
        const redis = setupRedis(env);

        // Core Shared Services
        const geocodingService = new GeocodingService(redis as any, pgPool);

        // Rutas del Ecosistema Inmobiliario
        app.route('/api/assets', assetsController);
        app.route('/api/pro', proFeatures);
        app.route('/api/killer', killer);
        app.route('/api/trading', tradingController);
        app.route('/api/ads', adsController);
        app.route('/api/wholesale', wholesaleController);
        app.route('/api/growth', growthController);
        app.route('/api/identity', identityController);
        app.route('/api/jury', juryController);
        app.route('/api/media', mediaController);
        app.route('/api/delivery', deliveryController);
        app.route('/api/escrow', escrowController);

        // Routes - 1000x Modules
        setupGeolocationRoutes(app, pgPool, redis, geocodingService);
        setupVehicleRoutes(app, pgPool);
        setupSearchRoutes(app, redis, pgPool);
        setupGeofenceRoutes(app, redis, pgPool);
        setupPlanningRoutes(app, redis, pgPool);
        setupTrackingRoutes(app, redis, pgPool);
        setupAnalyticsRoutes(app, pgPool);
        setupLocationRoutes(app, redis, pgPool);
        setupWebhookRoutes(app);

        // QUEEN MODULES (Community Resilience & Advanced Geo)
        setupCommunityResilienceRoutes(app, redis, pgPool);
        setupAdvancedGeoRoutes(app, redis, pgPool);
        setupGeospatialRoutes(app, redis, pgPool);
        setupHubsRoutes(app, redis, pgPool);

        // Error Handling
        app.onError(errorMiddleware);

        logger.info(`🚀 MatchaAuto 1000x Backend initialized in ${env.NODE_ENV} mode`);

    } catch (error) {
        logger.error('Failed to start server:', error);
    }
};

start();

export default app;
