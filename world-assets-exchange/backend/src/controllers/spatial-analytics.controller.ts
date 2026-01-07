import { Context } from 'hono';
import { GeoAnalyticsService } from '../services/geo-analytics.service';
import { logger } from '../utils/logger';

export class SpatialAnalyticsController {
    private analyticsService: GeoAnalyticsService;

    constructor(analyticsService: GeoAnalyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Mapa de calor de densidad de vehículos/usuarios
     */
    getHeatmap = async (c: Context) => {
        try {
            const stats = await this.analyticsService.getDensityStats({});
            return c.json({ success: true, data: stats });
        } catch (error) {
            return c.json({ success: false, error: 'Failed to generate heatmap' }, 500);
        }
    };

    /**
     * Detección de brechas en cobertura de servicio
     */
    getCoverageGaps = async (c: Context) => {
        const gaps = await this.analyticsService.findCoverageGaps();
        return c.json({ success: true, data: gaps });
    };

    /**
     * Análisis de patrones de movimiento para un activo
     */
    getBehaviorAnalysis = async (c: Context) => {
        const userId = c.req.query('userId');
        if (!userId) return c.json({ success: false, error: 'User ID required' }, 400);
        const analysis = await this.analyticsService.analyzeMovementPatterns(userId);
        return c.json({ success: true, data: analysis });
    };
}
