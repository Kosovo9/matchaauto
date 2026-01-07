import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { validateEnv } from './config/env';
import { setupDatabase } from './config/database';
import { setupRedis } from './config/redis';
import { setupLocationRoutes } from './routes/location.routes';
import { setupAnalyticsRoutes } from './routes/analytics.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Controladores PRO 1000x
import marketplaceController from './controllers/marketplace.controller';
import proFeatures from './controllers/pro-features.controller';
import killer from './controllers/competitor-killer.controller';
import tradingController from './controllers/trading.controller';
import adsController from './controllers/ads.controller';
import wholesaleController from './controllers/wholesale.controller';
import growthController from './controllers/growth.controller';
import identityController from './controllers/sovereign-identity.controller';
import juryController from './controllers/leader-jury.controller';
import mediaController from './controllers/media-pro.controller';
import syncController from './controllers/sync.controller';
import treasuryController from './controllers/treasury.controller';
import deliveryController from './controllers/delivery.controller';
import escrowController from './controllers/escrow.controller';

const app = new Hono();

app.use('*', honoLogger());
app.use('*', cors());

const start = async () => {
    try {
        const env = validateEnv(process.env);
        const pgPool = setupDatabase(env);
        const redis = setupRedis(env);

        // Rutas del Ecosistema
        app.route('/api/marketplace', marketplaceController);
        app.route('/api/pro', proFeatures);
        app.route('/api/killer', killer);
        app.route('/api/trading', tradingController);
        app.route('/api/ads', adsController);
        app.route('/api/wholesale', wholesaleController);
        app.route('/api/growth', growthController);
        app.route('/api/identity', identityController);
        app.route('/api/jury', juryController);
        app.route('/api/media', mediaController);
        app.route('/api/sync', syncController);
        app.route('/api/treasury', treasuryController);
        app.route('/api/delivery', deliveryController);
        app.route('/api/escrow', escrowController);

        // Módulos compartidos necesarios para el Marketplace
        setupLocationRoutes(app, redis, pgPool);
        setupAnalyticsRoutes(app, pgPool);

        app.onError(errorMiddleware);
        logger.info('🚀 Global Marketplace API Initialized');
    } catch (error) {
        logger.error('Marketplace failed to start:', error);
    }
};

start();
export default app;
