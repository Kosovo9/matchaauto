import { Context } from 'hono';
import { z } from 'zod';
import { GeoAnalyticsService } from '../services/geo-analytics.service';
import { VehicleService } from '../services/vehicle.service';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

const CalculatePriceSchema = z.object({
    vehicleId: z.string().min(1),
    basePrice: z.number().positive(),
    location: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180)
    }),
    userId: z.string().optional() // For personalized pricing if needed
});

export class DynamicPricingController {
    private geoAnalytics: GeoAnalyticsService;
    private vehicleService: VehicleService;

    constructor(geoAnalytics: GeoAnalyticsService, vehicleService: VehicleService) {
        this.geoAnalytics = geoAnalytics;
        this.vehicleService = vehicleService;
    }

    /**
     * POST /calculate-price
     * Adjust vehicle listing prices and rental rates based on real-time demand and location density.
     */
    calculatePrice = async (c: Context) => {
        const start = Date.now();
        try {
            const body = await c.req.json();
            const validated = CalculatePriceSchema.parse(body);

            // 1. Get Demand/Supply Density
            // We look at a 2km radius (approx 0.02 deg)
            const bounds = {
                minLat: validated.location.lat - 0.01,
                maxLat: validated.location.lat + 0.01,
                minLng: validated.location.lng - 0.01,
                maxLng: validated.location.lng + 0.01
            };

            // 10x: Uses cached heatmap data from GeoAnalyticsService (Redis backed)
            const densityStats = await this.geoAnalytics.getDensityStats(bounds);
            const maxIntensity = densityStats.maxIntensity || 0;

            // 2. Calculate Multiplier using Rule Engine
            // High supply (many cars nearby) -> Lower price to compete
            // Low supply (exclusive area) -> Higher price (Surge)
            // But if Demand is high (which we might infer from 'intensity' if it represents active users vs cars)
            // Let's assume 'intensity' in heatmap represents VEHICLE DENSITY (Supply).
            // We need a proxy for DEMAND. 
            // For now, let's assume High Vehicle Density = High Competition = Lower Price multiplier.
            // AND we can randomize/stub "Active User Demand" for the simulation.

            const supplyScore = Math.min(maxIntensity, 100) / 100; // 0 to 1
            const demandScore = Math.random(); // Stub: Real implementation would query 'UserBehaviorAnalytics' for search volume in area

            let multiplier = 1.0;

            if (demandScore > 0.8 && supplyScore < 0.3) {
                // High Demand, Low Supply -> SURGE
                multiplier = 1.2 + (demandScore - 0.8); // 1.2 to 1.4
            } else if (supplyScore > 0.8 && demandScore < 0.4) {
                // High Supply, Low Demand -> DISCOUNT
                multiplier = 0.8 + (demandScore * 0.1); // 0.8 to 0.84
            } else {
                // Balanced
                multiplier = 1.0;
            }

            // 3. Vehicle Specific Adjustments
            const vehicle = await this.vehicleService.getVehicleById(validated.vehicleId);
            if (vehicle && vehicle.attributes && vehicle.attributes.isPremium) {
                multiplier += 0.1; // Premium tax
            }

            const adjustedPrice = Math.round(validated.basePrice * multiplier * 100) / 100;

            return c.json({
                success: true,
                data: {
                    originalPrice: validated.basePrice,
                    adjustedPrice,
                    multiplier: Math.round(multiplier * 100) / 100,
                    factors: {
                        supplyDensity: Math.round(supplyScore * 100) / 100,
                        demandLevel: Math.round(demandScore * 100) / 100,
                        marketCondition: multiplier > 1.0 ? 'High Demand' : multiplier < 1.0 ? 'High Competition' : 'Stable'
                    },
                    calculationTimeMs: Date.now() - start
                }
            });

        } catch (error) {
            return handleError(error, c);
        }
    }
}
