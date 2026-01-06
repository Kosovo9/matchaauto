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
import { GeocodingService } from './services/geocoding.service';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';

const app = new Hono();

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

        // Error Handling
        app.onError(errorMiddleware);

        logger.info(`🚀 MatchaAuto 1000x Backend initialized in ${env.NODE_ENV} mode`);

    } catch (error) {
        logger.error('Failed to start server:', error);
    }
};

start();

export default app;
