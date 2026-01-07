import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { DistanceMatrixService } from '../services/distance-matrix.service';
import { createGzip } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

// ==================== ZOD SCHEMAS ====================
const DistanceMatrixRequestSchema = z.object({
    origins: z.array(z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        id: z.string().optional()
    })).min(1).max(1000),

    destinations: z.array(z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        id: z.string().optional()
    })).min(1).max(1000),

    options: z.object({
        metric: z.enum(['haversine', 'vincenty', 'euclidean', 'manhattan']).default('haversine'),
        algorithm: z.enum(['parallel', 'vectorized', 'batch', 'approximate']).default('parallel'),
        optimize: z.boolean().default(true),
        trafficModel: z.enum(['optimistic', 'pessimistic', 'real-time']).optional(),
    }).optional().default({})
});

const BatchDistanceMatrixSchema = z.object({
    requests: z.array(DistanceMatrixRequestSchema).min(1).max(100),
    batchOptions: z.object({
        concurrency: z.number().min(1).max(100).default(10)
    }).optional()
});

// ==================== CONTROLLER ====================
export class DistanceMatrixController {
    private service: DistanceMatrixService;
    private redis: Redis;
    private activeStreams: Map<string, any> = new Map();

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.service = new DistanceMatrixService(pgPool, redis);
    }

    // POST /api/v1/distance/matrix
    async calculateMatrix(req: Request, res: Response): Promise<void> {
        const start = Date.now();
        try {
            const validated = DistanceMatrixRequestSchema.parse(req.body);

            // Check cache
            const cacheKey = this.generateCacheKey(validated);
            const cached = await this.redis.get(cacheKey);

            if (cached) {
                metrics.increment('distance_matrix.cache_hit');
                res.json(JSON.parse(cached));
                return;
            }

            const result = await this.service.calculateDistanceMatrix(validated);

            // Cache result (TTL 5 mins)
            await this.redis.setex(cacheKey, 300, JSON.stringify({ success: true, data: result }));

            metrics.timing('distance_matrix.latency', Date.now() - start);
            res.json({ success: true, data: result });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // POST /api/v1/distance/batch
    async calculateBatch(req: Request, res: Response): Promise<void> {
        const start = Date.now();
        try {
            const validated = BatchDistanceMatrixSchema.parse(req.body);

            // Process in parallel with concurrency limit (simplified)
            const results = await Promise.all(
                validated.requests.map(req => this.service.calculateDistanceMatrix(req))
            );

            metrics.timing('distance_matrix.batch_latency', Date.now() - start);
            res.json({ success: true, data: results });
        } catch (error) {
            this.handleError(error, res);
        }
    }

    // GET /api/v1/distance/stream (SSE)
    async streamMatrix(req: Request, res: Response): Promise<void> {
        const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Setup SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const validated = DistanceMatrixRequestSchema.parse(req.body);

            // Simulate streaming (Actual implementation depends on Service streaming capabilities)
            // Here we just send the computation started event
            res.write(`data: ${JSON.stringify({ event: 'start', streamId })}\n\n`);

            const result = await this.service.calculateDistanceMatrix(validated);

            res.write(`data: ${JSON.stringify({ event: 'complete', data: result })}\n\n`);
            res.end();
        } catch (error) {
            res.write(`data: ${JSON.stringify({ event: 'error', error: 'Stream failed' })}\n\n`);
            res.end();
        }
    }

    private generateCacheKey(params: any): string {
        return `dist_matrix:${JSON.stringify(params.origins)}:${JSON.stringify(params.destinations)}`;
    }

    private handleError(error: any, res: Response) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation Error', details: error.errors });
        } else {
            logger.error('Distance Matrix Error', error);
            res.status(500).json({ success: false, error: 'Calculation Failed' });
        }
    }
}
