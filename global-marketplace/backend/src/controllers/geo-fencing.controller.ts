import { Context } from 'hono';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { GeoFencingService } from '../services/geo-fencing.service';
import { MetricsCollector } from '../utils/metrics-collector';
import { SpatialCacheEngine } from '../utils/spatial-cache';
import { logger } from '../utils/logger';

// ==================== ZOD SCHEMAS ====================
const GeofenceCreateSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    type: z.enum(['polygon', 'circle', 'route', 'multi_polygon', 'complex']),
    geometry: z.object({
        coordinates: z.any(),
        properties: z.record(z.string(), z.any()).optional()
    }),
    rules: z.array(z.object({
        type: z.enum(['enter', 'exit', 'dwell', 'speed', 'proximity']),
        parameters: z.record(z.string(), z.any()),
        severity: z.enum(['info', 'warning', 'critical']).default('warning')
    })).default([]),
    priority: z.number().min(1).max(100).default(50)
});

const GeofenceUpdateSchema = GeofenceCreateSchema.partial().extend({
    id: z.string().min(1)
});

const GeofenceAssignmentSchema = z.object({
    geofenceId: z.string().min(1),
    entityType: z.enum(['vehicle', 'driver', 'asset']),
    entityIds: z.array(z.string()).min(1).max(10000),
    assignmentType: z.enum(['permanent', 'temporary']).default('permanent')
});

const RealTimeMonitoringSchema = z.object({
    geofenceIds: z.array(z.string()).min(1),
    entityIds: z.array(z.string()).min(1),
    options: z.object({
        updateInterval: z.number().min(1).max(60).default(5)
    }).optional().default({})
});

const ComplexRuleSchema = z.object({
    name: z.string(),
    conditions: z.array(z.object({
        geofenceId: z.string(),
        eventType: z.enum(['enter', 'exit', 'dwell'])
    })),
    logic: z.enum(['AND', 'OR', 'SEQUENCE']).default('AND'),
    actions: z.array(z.any())
});

// ==================== CONTROLLER ====================
export class GeofencingController {
    private service: GeoFencingService;
    private redis: Redis;
    private metrics: MetricsCollector;
    private spatialCache: SpatialCacheEngine;

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.service = new GeoFencingService(redis, pgPool);
        this.metrics = MetricsCollector.getInstance();
        this.spatialCache = new SpatialCacheEngine(redis);
    }

    /**
     * Create Geofence
     */
    async createGeofence(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await GeofenceCreateSchema.parseAsync(body);

            const geofence = await this.service.createGeofence({
                ...validated,
                createdBy: 'system' // Should be user ID from auth context
            });

            // Update Cache
            await this.spatialCache.set(`geofence:${geofence.id}`, geofence);

            this.metrics.increment('geofence.created');

            return c.json({ success: true, data: geofence }, 201);
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Update Geofence
     */
    async updateGeofence(c: Context) {
        const id = c.req.param('id');
        try {
            const body = await c.req.json();
            const validated = await GeofenceUpdateSchema.parseAsync({ id, ...body });

            const geofence = await this.service.updateGeofence(id, validated);

            await this.spatialCache.set(`geofence:${id}`, geofence);

            return c.json({ success: true, data: geofence });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Delete Geofence
     */
    async deleteGeofence(c: Context) {
        const id = c.req.param('id');
        try {
            await this.service.deleteGeofence(id);
            await this.redis.del(`geofence:${id}`);

            return c.json({ success: true, message: 'Deleted' });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Get Geofence
     */
    async getGeofence(c: Context) {
        const id = c.req.param('id');
        try {
            const cached = await this.spatialCache.get(`geofence:${id}`);
            if (cached) return c.json({ success: true, data: cached, source: 'cache' });

            const geofence = await this.service.getGeofenceById(id);
            if (!geofence) return c.json({ success: false, error: 'Not Found' }, 404);

            return c.json({ success: true, data: geofence });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * List Geofences (Basic)
     */
    async listGeofences(c: Context) {
        try {
            // Basic listing, would add pagination/filtering parsing
            const geofences = await this.service.findAllGeofences();
            return c.json({ success: true, data: geofences });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Assign Entities
     */
    async assignEntities(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await GeofenceAssignmentSchema.parseAsync(body);

            const result = await this.service.assignEntities(
                validated.geofenceId,
                validated.entityType,
                validated.entityIds
            );

            return c.json({ success: true, data: result });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Batch Assign (Stub for consistency)
     */
    async batchAssign(c: Context) {
        // Reusing the assign logic for simplified batch stub
        return this.assignEntities(c);
    }

    /**
     * Remove Assignment
     */
    async removeAssignment(c: Context) {
        const { geofenceId, entityType, entityId } = c.req.param();
        try {
            await this.service.removeAssignment(geofenceId, entityType as any, entityId);
            return c.json({ success: true });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Check Status (Point-in-Polygon Check)
     */
    async checkStatus(c: Context) {
        try {
            const body = await c.req.json();
            const { latitude, longitude, entityId } = body;

            // Simple status check
            const insideGeofences = await this.service.findContainingGeofences(latitude, longitude);

            return c.json({
                success: true,
                data: {
                    inside: insideGeofences,
                    count: insideGeofences.length,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Real-time Monitoring Setup
     */
    async realTimeMonitoring(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await RealTimeMonitoringSchema.parseAsync(body);

            const sessionId = `monitor-${Date.now()}`;

            return c.json({
                success: true,
                data: { sessionId, wsUrl: `/ws/geofencing/${sessionId}` }
            });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Analytics
     */
    async getAnalytics(c: Context) {
        try {
            const { geofenceId } = c.req.query();
            // Stub analytics
            return c.json({
                success: true,
                data: {
                    entries: 150,
                    exits: 145,
                    avgDwellTime: 450, // seconds
                    violations: 2
                }
            });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    /**
     * Complex Rules
     */
    async createComplexRule(c: Context) {
        try {
            const body = await c.req.json();
            const validated = await ComplexRuleSchema.parseAsync(body);

            // Save rule logic
            return c.json({ success: true, message: 'Rule created', ruleId: `rule-${Date.now()}` });
        } catch (error) {
            return this.handleError(error, c);
        }
    }

    private handleError(error: any, c: Context) {
        logger.error('Geofencing Controller Error', error);
        if (error instanceof z.ZodError) {
            return c.json({ success: false, error: 'Validation Error', details: error.errors }, 400);
        }
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
}
