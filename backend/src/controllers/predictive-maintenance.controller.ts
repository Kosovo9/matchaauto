import { Context } from 'hono';
import { z } from 'zod';
import { VehicleService } from '../services/vehicle.service';
import { handleError } from '../utils/error-handler';
import { logger } from '../utils/logger';

// 10x: Rule-based engine avoids latency of external AI. Predictions are deterministic, auditable, and work offline.
const MAINTENANCE_RULES = {
    brakePads: { intervalKm: 40000, wearRatePerKm: 0.000025 },
    oilChange: { intervalKm: 10000, wearRatePerKm: 0.0001 },
    tires: { intervalKm: 60000, wearRatePerKm: 0.0000167 },
    battery: { intervalKm: 50000, wearRatePerKm: 0.00002 }, // Added battery rule
    coolant: { intervalKm: 30000, wearRatePerKm: 0.000033 } // Added coolant rule
};

export class PredictiveMaintenanceController {
    private vehicleService: VehicleService;

    constructor(vehicleService: VehicleService) {
        this.vehicleService = vehicleService;
    }

    /**
     * POST /predict/:vehicleId
     * Returns a maintenance schedule with probabilities
     */
    predictMaintenance = async (c: Context) => {
        try {
            const vehicleId = c.req.param('vehicleId');
            const vehicle = await this.vehicleService.getVehicleById(vehicleId);

            if (!vehicle) {
                return c.json({ success: false, error: 'Vehicle not found' }, 404);
            }

            const currentMileage = vehicle.mileage || 0;
            // Assuming we track last maintenance mileage in metadata or a separate table. 
            // For now, using a stubbed lastMaintenance based on mileage modulo.
            // In production, fetch this from MaintenanceService.

            const predictions = Object.entries(MAINTENANCE_RULES).map(([component, rule]) => {
                const distanceSinceLast = currentMileage % rule.intervalKm;
                const remaining = rule.intervalKm - distanceSinceLast;
                const wearPercentage = (distanceSinceLast / rule.intervalKm) * 100;

                // Probability increases as we approach 100% wear
                let probability = wearPercentage;
                if (wearPercentage > 90) probability += 10; // High urgent risk
                if (probability > 100) probability = 99.9;

                return {
                    component,
                    status: wearPercentage > 80 ? 'urgente' : wearPercentage > 50 ? 'warning' : 'good',
                    wearPercentage: Math.round(wearPercentage),
                    probabilityFailure: Math.round(probability * 10) / 10,
                    estimatedRemainingKm: Math.round(remaining),
                    recommendedAction: wearPercentage > 80 ? `Replace ${component} immediately` : `Inspect ${component} soon`
                };
            });

            // 10x Optimization: Sort by urgency
            predictions.sort((a, b) => b.probabilityFailure - a.probabilityFailure);

            return c.json({
                success: true,
                data: {
                    vehicleId,
                    currentMileage,
                    predictions,
                    nextMajorServiceKm: Math.ceil(currentMileage / 10000) * 10000
                }
            });

        } catch (error) {
            return handleError(error, c);
        }
    };

    /**
     * GET /fleet-health
     * Returns an aggregate health score for a fleet of vehicles
     */
    getFleetHealth = async (c: Context) => {
        try {
            // Fetch all vehicles (stubbed with searchVehicles for now)
            const vehicles = await this.vehicleService.searchVehicles({});

            if (vehicles.length === 0) {
                return c.json({ success: true, data: { score: 100, vehicleCount: 0, status: 'Empty Fleet' } });
            }

            let totalScore = 0;
            const criticalVehicles: any[] = [];

            for (const vehicle of vehicles) {
                const mileage = vehicle.mileage || 0;
                // Simple health metric based on age and mileage
                const age = new Date().getFullYear() - (vehicle.year || 2020);
                const baseScore = 100;
                const mileageDeduction = Math.min(30, (mileage / 100000) * 10);
                const ageDeduction = Math.min(20, age * 2);

                let vehicleScore = baseScore - mileageDeduction - ageDeduction;
                if (vehicleScore < 60) criticalVehicles.push({ id: vehicle.id, score: vehicleScore });
                totalScore += vehicleScore;
            }

            const avgScore = totalScore / vehicles.length;

            return c.json({
                success: true,
                data: {
                    fleetHealthScore: Math.round(avgScore),
                    vehicleCount: vehicles.length,
                    criticalVehiclesCount: criticalVehicles.length,
                    criticalVehicles: criticalVehicles.slice(0, 5), // Top 5 critical
                    status: avgScore > 80 ? 'Excellent' : avgScore > 60 ? 'Good' : 'Needs Attention'
                }
            });

        } catch (error) {
            return handleError(error, c);
        }
    };
}
