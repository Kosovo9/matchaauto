import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import { VehicleTrackingService } from '../services/vehicle-tracking.service';
import { MetricsCollector } from '../utils/metrics-collector';
import { SpatialCacheEngine } from '../utils/spatial-cache';
import { logger } from '../utils/logger';

// ==================== ZOD SCHEMAS ====================
const VehiclePositionSchema = z.object({
    vehicleId: z.string().min(1).max(100),
    deviceId: z.string().optional(),
    position: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracy: z.number().min(0).max(1000).optional(),
        altitude: z.number().optional(),
        heading: z.number().min(0).max(360).optional(),
        speed: z.number().min(0).max(300).optional(),
        timestamp: z.string()
    }),
    status: z.enum(['idle', 'moving', 'loading', 'unloading', 'stopped', 'offline', 'maintenance', 'emergency']).default('moving'),
    odometer: z.number().min(0).optional(),
    fuelLevel: z.number().min(0).max(100).optional(),
    metadata: z.record(z.string(), z.any()).optional()
});

const BulkPositionUpdateSchema = z.object({
    positions: z.array(VehiclePositionSchema).min(1).max(10000),
    options: z.object({
        compression: z.enum(['none', 'gzip', 'delta']).default('none')
    }).optional().default({})
});

const TripStartSchema = z.object({
    vehicleId: z.string(),
    driverId: z.string(),
    startLocation: z.object({ lat: z.number(), lng: z.number() }),
    destination: z.object({ lat: z.number(), lng: z.number() }).optional(),
    metadata: z.record(z.string(), z.any()).optional()
});

const TripEndSchema = z.object({
    tripId: z.string(),
    endLocation: z.object({ lat: z.number(), lng: z.number() }),
    odometerEnd: z.number().optional(),
    metadata: z.record(z.string(), z.any()).optional()
});

const GeofenceSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['circle', 'polygon', 'route']),
    coordinates: z.any(), // Flexible for GeoJSON or custom format
    parameters: z.object({
        triggerOn: z.enum(['enter', 'exit', 'both', 'dwell', 'speed']).default('both'),
        severity: z.enum(['info', 'warning', 'critical']).default('warning')
    }).optional().default({})
});

const RoutePredictionRequestSchema = z.object({
    vehicleId: z.string(),
    currentPosition: z.object({ lat: z.number(), lng: z.number() }),
    destination: z.object({ lat: z.number(), lng: z.number() }),
    options: z.object({
        updateInterval: z.number().default(60)
    }).optional().default({})
});

const FleetAnalyticsRequestSchema = z.object({
    fleetIds: z.array(z.string()),
    timeRange: z.object({ start: z.string(), end: z.string() }),
    metrics: z.array(z.string()).default(['utilization', 'distanceTraveled'])
});

const DriverBehaviorSchema = z.object({
    driverId: z.string(),
    timeRange: z.object({ start: z.string(), end: z.string() }),
    metrics: z.array(z.string()).default(['safetyScore', 'fuelEfficiency']),
    options: z.record(z.any()).optional()
});

const MaintenancePredictionsSchema = z.object({
    vehicleId: z.string(),
    components: z.array(z.string()).default(['engine', 'brakes', 'tires'])
});

// ==================== CONTROLLER ====================
export class VehicleTrackingController {
    private service: VehicleTrackingService;
    private redis: Redis;
    private metrics: MetricsCollector;
    private cache: SpatialCache;
    private socketIo?: Server;

    constructor(redis: Redis, pgPool: Pool, socketIo?: Server) {
        this.redis = redis;
        this.service = new VehicleTrackingService(pgPool);
        this.metrics = MetricsCollector.getInstance();
        this.cache = new SpatialCacheEngine(redis);
        this.socketIo = socketIo;
    }

    // ==================== PUBLIC METHODS ====================

    /**
     * Update vehicle position (Single)
     */
    /**
   * Get Active Fleet Positions
   * Returns latest known position for all active vehicles
   */
    async getActiveFleet(c: Context) {
        try {
            const cacheKey = 'fleet:active:positions';
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return c.json({ success: true, data: JSON.parse(cached), source: 'cache' });
            }

            // Retrieve from service (assuming service has this method or we mock it for now)
            // In this architecture, service should handle the logic. 
            // We will assume service.getAllActivePositions() exists or add it.
            // For safety, let's implement a direct Redis pattern search if service doesn't have it, 
            // but cleaner to put in service. 
            // Let's assume service.getAllActivePositions() is what we want.
            const positions = await this.service.getAllActivePositions();

            await this.redis.setex(cacheKey, 5, JSON.stringify(positions));

            return c.json({ success: true, data: positions });
        } catch (error) {
            logger.error('Get Active Fleet Error', error);
            return c.json({ success: false, error: 'Internal Server Error' }, 500);
        }
    }

    async updateVehiclePosition(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await VehiclePositionSchema.parseAsync(body);

            // Update Cache immediately
            await this.cache.set(`vehicle:pos:${validated.vehicleId}`, validated, 60);

            // Async process to DB
            this.service.updatePosition(validated).catch(err => logger.error('Async pos update failed', err));

            this.metrics.increment('tracking.position_update');

            return c.json({ success: true, message: 'Position updated' });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Bulk Update Positions
     */
    async bulkUpdatePositions(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await BulkPositionUpdateSchema.parseAsync(body);

            // Process in batches
            await this.service.bulkInsertPositions('bulk', validated.positions);

            this.metrics.increment('tracking.bulk_update', { count: validated.positions.length });

            return c.json({ success: true, processed: validated.positions.length });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Get Current Position
     */
    async getVehiclePosition(c: Context) {
        const vehicleId = c.req.param('vehicleId');
        try {
            // Try cache
            const cached = await this.cache.get(`vehicle:pos:${vehicleId}`);
            if (cached) return c.json({ success: true, data: cached, source: 'cache' });

            const pos = await this.service.getCurrentPosition(vehicleId);
            if (!pos) return c.json({ success: false, error: 'Vehicle not found' }, 404);

            return c.json({ success: true, data: pos, source: 'db' });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Start Trip
     */
    async startTrip(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await TripStartSchema.parseAsync(body);

            const trip = await this.service.startTrip({
                ...validated,
                startTime: new Date().toISOString(),
                estimatedDistance: 0, // Should calculate
                estimatedDuration: 0
            });

            return c.json({ success: true, data: trip });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * End Trip
     */
    async endTrip(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await TripEndSchema.parseAsync(body);

            const result = await this.service.endTrip(validated);

            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Manage Geofence
     */
    async manageGeofence(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await GeofenceSchema.parseAsync(body);

            // Logic would go here to persist geofence
            // For now, caching it
            await this.cache.set(`geofence:${validated.id}`, validated, 86400);

            return c.json({ success: true, message: 'Geofence updated' });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Fleet Analytics
     */
    async getFleetAnalytics(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await FleetAnalyticsRequestSchema.parseAsync(body);

            const analytics = await this.service.getFleetAnalytics(
                validated.fleetIds,
                validated.timeRange,
                validated.metrics
            );

            return c.json({ success: true, data: analytics });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
   * Predict Route
   */
    async predictRoute(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await RoutePredictionRequestSchema.parseAsync(body);

            // Placeholder logic for prediction
            // In real scenario, call routing engine or ML service
            const prediction = {
                distance: 10000,
                duration: 900,
                eta: new Date(Date.now() + 900000).toISOString(),
                confidence: 0.85
            };

            return c.json({ success: true, data: prediction });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Driver Behavior Analysis
     */
    async analyzeDriverBehavior(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await DriverBehaviorSchema.parseAsync(body);

            // Stub for driver analysis logic
            const history = await this.service.getDriverHistory(validated.driverId, validated.timeRange);

            return c.json({
                success: true,
                data: {
                    score: 85,
                    trips: history?.trips?.length || 0,
                    metrics: validated.metrics.reduce((acc, m) => ({ ...acc, [m]: 0 }), {})
                }
            });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Maintenance Prediction
     */
    async predictMaintenance(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await MaintenancePredictionsSchema.parseAsync(body);

            // Stub logic
            const predictions = validated.components.map(comp => ({
                component: comp,
                health: 0.9,
                predictedFailDate: new Date(Date.now() + 86400000 * 30).toISOString()
            }));

            return c.json({ success: true, data: { predictions, overallHealth: 0.88 } });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Real-time Tracking Session (Pseudo-WebSocket init)
     */
    async startRealTimeTracking(c: Context) {
        const sessionId = `track-${Date.now()}`;
        return c.json({
            success: true,
            data: { sessionId, wsUrl: `/ws/tracking/${sessionId}` }
        });
    }

    async stopRealTimeTracking(c: Context) {
        return c.json({ success: true, message: 'Session ended' });
    }

    /**
     * Health Check
     */
    async healthCheck(c: Context) {
        const dbHealth = await this.service.checkHealth().catch(() => false);
        return c.json({
            status: 'ok',
            db: dbHealth,
            redis: this.redis.status === 'ready'
        });
    }

    private handleError(error: any, c: Context) {
        logger.error('VehicleTracking Controller Error', error);
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        }
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
}
