import { Hono } from 'hono';
import { RoutePlanningController } from '../controllers/route-planning.controller';
import { RouteOptimizationService } from '../services/route-optimization.service';
import { DistanceMatrixService } from '../services/distance-matrix.service';

export function setupPlanningRoutes(app: Hono, redis: any, pgPool: any) {
    const routeService = new RouteOptimizationService(redis, pgPool);
    const distService = new DistanceMatrixService(redis, pgPool);
    const controller = new RoutePlanningController(routeService, distService);

    const route = new Hono();

    route.post('/optimize', controller.optimize);
    route.post('/matrix', controller.getMatrix);

    app.route('/api/v1/routes', route);
}
