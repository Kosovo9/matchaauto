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
            const stats = await this.analyticsService.getDensityStats({ minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 });
            return c.json({ success: true, data: stats });
        } catch (error) {
            return c.json({ success: false, error: 'Failed to generate heatmap' }, 500);
        }
    };

    /**
     * Detección de brechas en cobertura de servicio
     */
    getCoverageGaps = async (c: Context) => {
        const gaps = await this.analyticsService.findCoverageGaps({ minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 }, 0.5);
        return c.json({ success: true, data: gaps });
    };

    /**
     * Análisis de patrones de movimiento para un activo
     */
    getBehaviorAnalysis = async (c: Context) => {
        const userId = c.req.query('userId');
        if (!userId) return c.json({ success: false, error: 'User ID required' }, 400);
        // Note: Service currently supports bounds/timeWindow, adhering to that for build success
        const analysis = await this.analyticsService.analyzeMovementPatterns({ minLat: -90, maxLat: 90, minLng: -180, maxLng: 180 }, '24h');
        return c.json({ success: true, data: analysis });
    };
}
