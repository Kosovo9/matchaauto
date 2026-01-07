import { Hono } from 'hono';
import { HubsController } from './hubs.controller';
import { HubsService } from './hubs.service';
import { rateLimit, rateLimitConfigs } from '../../middleware/rateLimiter';

export function setupHubsRoutes(app: Hono, redis: any, pgPool: any) {
    const service = new HubsService(pgPool, redis);
    const controller = new HubsController(service);

    const routes = new Hono();

    // Protection for community nodes
    routes.use('*', rateLimit(rateLimitConfigs.moderate));

    routes.get('/', (c) => controller.list(c));
    routes.post('/', (c) => controller.create(c));
    routes.get('/:id', (c) => controller.get(c));
    routes.post('/signal', (c) => controller.postSignal(c));
    routes.get('/:id/signals', (c) => controller.getSignals(c));
    routes.post('/clone', (c) => controller.clone(c));

    app.route('/api/v1/hubs', routes);
}
