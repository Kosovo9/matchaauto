import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { validateEnv } from './config/env';
import { setupDatabase } from './config/database';
import { setupRedis } from './config/redis';
import { setupGeolocationRoutes } from './routes/geolocation.routes';
import { setupVehicleRoutes } from './routes/vehicle.routes';
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

// 🔥 TITAN CONTROLLERS (TRILOGY ENGINE)
import tradingController from './controllers/trading.controller';
import adsController from './controllers/ads.controller';
import proFeatures from './controllers/pro-features.controller';
import killer from './controllers/competitor-killer.controller';
import wholesaleController from './controllers/wholesale.controller';
import growthController from './controllers/growth.controller';
import identityController from './controllers/sovereign-identity.controller';
import juryController from './controllers/leader-jury.controller';
import mediaController from './controllers/media-pro.controller';
import syncController from './controllers/sync.controller';
import treasuryController from './controllers/treasury.controller';
import missionControlController from './controllers/admin/mission-control.controller';
import { HybridHelpDeskController } from './controllers/hybrid-helpdesk.controller'; // 🧠 Nuevo Cerebro Híbrido
import { OfflineSyncController } from './controllers/offline-sync.controller';
import { ResourceAllocationController } from './controllers/resource-allocation.controller';
import { SkillExchangeController } from './controllers/skill-exchange.controller';
import { LocalCurrencyController } from './controllers/local-currency.controller';
import { DisputeResolutionController } from './controllers/dispute-resolution.controller';
import { GeoRAGService } from './services/ai/geo-rag.service';
import { GeoRAGController } from './controllers/geo-rag.controller';
import { UniversalRAGService } from './services/ai/universal-rag.service';
import { RAGController } from './controllers/rag.controller';

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
        setupCommunityResilienceRoutes(app, redis as any, pgPool);
        setupAdvancedGeoRoutes(app, redis as any, pgPool);
        setupGeospatialRoutes(app, redis as any, pgPool);
        setupHubsRoutes(app, redis as any, pgPool);

        // Instantiate new services/controllers
        const offlineSyncCtrl = new OfflineSyncController(redis, pgPool);
        const resourceCtrl = new ResourceAllocationController(redis);
        const skillCtrl = new SkillExchangeController(redis);
        const currencyCtrl = new LocalCurrencyController(redis, pgPool);
        const disputeCtrl = new DisputeResolutionController(redis, pgPool);

        // 🧠 HYBRID AI BRAIN (Online + Offline)
        const helpDeskCtrl = new HybridHelpDeskController(redis, pgPool, env);

        // Register routes for the new controllers
        app.route('/api/offline-sync', offlineSyncCtrl);
        app.route('/api/resources', resourceCtrl);
        app.route('/api/skills', skillCtrl);
        app.route('/api/currency', currencyCtrl);
        app.route('/api/dispute', disputeCtrl);
        app.route('/api/helpdesk', helpDeskCtrl);

        // 🔥 TITAN SUITE (Global Functionalities)
        app.route('/api/trading', tradingController);
        app.route('/api/ads', adsController);
        app.route('/api/pro', proFeatures);
        app.route('/api/killer', killer);
        app.route('/api/wholesale', wholesaleController);
        app.route('/api/growth', growthController);
        app.route('/api/identity', identityController);
        app.route('/api/jury', juryController);
        app.route('/api/media', mediaController);
        app.route('/api/sync', syncController);
        app.route('/api/treasury', treasuryController);
        app.route('/api/mega', megaProController);
        app.route('/api/mission-control', missionControlController);

        // 🌍 GeoRAG Engine
        const geoRagService = new GeoRAGService(redis, pgPool);
        const geoRagCtrl = new GeoRAGController(geoRagService);
        app.post('/api/rag/geo', geoRagCtrl.search);

        // 🧠 UNIVERSAL RAG (The 20 Oracles)
        const universalRagService = new UniversalRAGService(pgPool);
        const ragCtrl = new RAGController(universalRagService, pgPool);
        app.post('/api/rag/query', ragCtrl.query);
        app.post('/api/rag/ingest', ragCtrl.ingest); // Solo admin


        // Error Handling
        app.onError(errorMiddleware);

        logger.info(`🚀 MatchaAuto 1000x Backend initialized in ${env.NODE_ENV} mode`);

    } catch (error) {
        logger.error('Failed to start server:', error);
    }
};

start();

export default app;
