import { Context } from 'hono';
import { RouteOptimizationService } from '../services/route-optimization.service';
import { DistanceMatrixService } from '../services/distance-matrix.service';
import { logger } from '../utils/logger';

export class RoutePlanningController {
    private routeService: RouteOptimizationService;
    private distanceService: DistanceMatrixService;

    constructor(routeService: RouteOptimizationService, distanceService: DistanceMatrixService) {
        this.routeService = routeService;
        this.distanceService = distanceService;
    }

    /**
     * Optimiza una ruta con múltiples paradas (TSP)
     */
    optimize = async (c: Context) => {
        try {
            const data = await c.req.json();
            const result = await this.routeService.optimizeRoute(data);
            return c.json({ success: true, data: result });
        } catch (error) {
            logger.error('Route optimization controller error:', error);
            return c.json({ success: false, error: 'Optimization failed' }, 500);
        }
    };

    /**
     * Calcula matriz de tiempo/distancia entre múltiples puntos (n x m)
     */
    getMatrix = async (c: Context) => {
        try {
            const data = await c.req.json();
            const matrix = await this.distanceService.calculateMatrix(data);
            return c.json({ success: true, data: matrix });
        } catch (error) {
            return c.json({ success: false, error: 'Matrix calculation failed' }, 400);
        }
    };
}
