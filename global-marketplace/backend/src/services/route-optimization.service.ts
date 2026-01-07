/**
 * Route Optimization Service
 * Provides multiple optimization algorithms (nearest neighbor, genetic, simulated annealing)
 * with Redis caching, circuit‑breaker protection and detailed metrics.
 */
import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { metrics } from '../utils/metrics';

export const RouteOptimizationRequestSchema = z.object({
    waypoints: z.array(
        z.object({
            latitude: z.number().min(-90).max(90),
            longitude: z.number().min(-180).max(180),
            id: z.string().optional(),
            priority: z.number().min(0).max(10).default(5),
            serviceTime: z.number().min(0).default(0), // seconds
            timeWindows: z.array(
                z.object({
                    start: z.date(),
                    end: z.date(),
                    hard: z.boolean().default(false)
                })
            ).optional(),
            constraints: z.record(z.string(), z.any()).optional()
        })
    ).min(2).max(100),
    startPoint: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional(),
    endPoint: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional(),
    constraints: z.object({
        maxDistance: z.number().min(0).optional(),
        maxDuration: z.number().min(0).optional(),
        maxStops: z.number().min(1).optional(),
        vehicleCapacity: z.number().min(0).optional(),
        driverHours: z.number().min(0).optional(),
        avoid: z.array(z.enum(['tolls', 'highways', 'ferries'])).optional(),
        preferredRoads: z.array(z.string()).optional()
    }).optional(),
    optimizationCriteria: z.array(z.enum([
        'distance', 'time', 'cost', 'emissions', 'traffic', 'safety', 'scenic'
    ])).default(['time', 'distance']),
    algorithm: z.enum([
        'genetic', 'simulated_annealing', 'ant_colony', 'nearest_neighbor', 'tabu_search', 'dynamic_programming'
    ]).default('genetic'),
    iterations: z.number().min(1).max(10000).default(1000),
    populationSize: z.number().min(10).max(1000).default(100),
    timeoutMs: z.number().min(1000).max(30000).default(10000)
});

export const RouteSegmentSchema = z.object({
    fromIndex: z.number(),
    toIndex: z.number(),
    distance: z.number(),
    duration: z.number(),
    polyline: z.string(),
    instructions: z.array(z.string()).optional(),
    roadType: z.string().optional(),
    trafficLevel: z.number().min(0).max(1).optional()
});

export const OptimizedRouteSchema = z.object({
    route: z.array(z.number()), // indices of waypoints in optimized order
    segments: z.array(RouteSegmentSchema),
    summary: z.object({
        totalDistance: z.number(),
        totalDuration: z.number(),
        totalCost: z.number().optional(),
        totalEmissions: z.number().optional(),
        constraintsViolated: z.number(),
        optimizationScore: z.number(),
        improvements: z.object({
            distance: z.number(),
            duration: z.number(),
            percentage: z.number()
        })
    }),
    metadata: z.object({
        executionTimeMs: z.number(),
        algorithmUsed: z.string(),
        iterations: z.number(),
        cacheHit: z.boolean(),
        convergenceRate: z.number().optional()
    })
});

export type RouteOptimizationRequest = z.infer<typeof RouteOptimizationRequestSchema>;
export type OptimizedRoute = z.infer<typeof OptimizedRouteSchema>;
export type RouteSegment = z.infer<typeof RouteSegmentSchema>;

interface RouteOptimizer {
    name: string;
    optimize(waypoints: any[], constraints: any, options: any): Promise<any>;
    getComplexity(): 'low' | 'medium' | 'high';
}

export class RouteOptimizationService {
    private redis: Redis;
    private pgPool: Pool;
    private optimizers: RouteOptimizer[] = [];
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 1800; // 30 minutes for route optimization

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;

        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 60000,
            timeout: 30000
        });

        this.initializeOptimizers();
    }

    private initializeOptimizers(): void {
        // 1. Nearest Neighbor (fast, simple)
        this.optimizers.push({
            name: 'nearest_neighbor',
            optimize: async (waypoints, constraints, options) => {
                return this.nearestNeighborOptimization(waypoints, constraints, options);
            },
            getComplexity: () => 'low'
        });

        // 2. Genetic Algorithm (good for medium complexity)
        this.optimizers.push({
            name: 'genetic',
            optimize: async (waypoints, constraints, options) => {
                return this.geneticAlgorithmOptimization(waypoints, constraints, options);
            },
            getComplexity: () => 'medium'
        });

        // 3. Simulated Annealing (good for hard problems)
        this.optimizers.push({
            name: 'simulated_annealing',
            optimize: async (waypoints, constraints, options) => {
                return this.simulatedAnnealingOptimization(waypoints, constraints, options);
            },
            getComplexity: () => 'high'
        });
    }

    private async nearestNeighborOptimization(
        waypoints: any[],
        constraints: any,
        options: any
    ): Promise<{ route: number[]; score: number }> {
        const startIndex = 0; // Start from first waypoint
        const unvisited = new Set(Array.from({ length: waypoints.length }, (_, i) => i));
        const route: number[] = [startIndex];
        unvisited.delete(startIndex);
        let current = startIndex;
        while (unvisited.size > 0) {
            let nearestIndex = -1;
            let nearestDistance = Infinity;
            for (const candidate of unvisited) {
                const distance = this.calculateHaversineDistance(
                    waypoints[current].latitude,
                    waypoints[current].longitude,
                    waypoints[candidate].latitude,
                    waypoints[candidate].longitude
                );
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = candidate;
                }
            }
            if (nearestIndex === -1) break;
            route.push(nearestIndex);
            unvisited.delete(nearestIndex);
            current = nearestIndex;
        }
        if (options.roundTrip) route.push(startIndex);
        const score = this.calculateRouteScore(route, waypoints, constraints);
        return { route, score };
    }

    private async geneticAlgorithmOptimization(
        waypoints: any[],
        constraints: any,
        options: any
    ): Promise<{ route: number[]; score: number }> {
        const populationSize = options.populationSize || 100;
        const generations = options.iterations || 1000;
        const mutationRate = 0.1;
        const eliteSize = Math.floor(populationSize * 0.1);
        let population: number[][] = [];
        for (let i = 0; i < populationSize; i++) {
            population.push(this.generateRandomRoute(waypoints.length, options.roundTrip));
        }
        let bestRoute = population[0];
        let bestScore = this.calculateRouteScore(bestRoute, waypoints, constraints);
        for (let gen = 0; gen < generations; gen++) {
            const scored = population.map(route => ({ route, score: this.calculateRouteScore(route, waypoints, constraints) }));
            scored.sort((a, b) => a.score - b.score);
            if (scored[0].score < bestScore) {
                bestRoute = scored[0].route;
                bestScore = scored[0].score;
            }
            const parents: number[][] = [];
            while (parents.length < populationSize - eliteSize) {
                const tournament = [];
                const tournamentSize = 5;
                for (let i = 0; i < tournamentSize; i++) {
                    tournament.push(scored[Math.floor(Math.random() * scored.length)]);
                }
                tournament.sort((a, b) => a.score - b.score);
                parents.push(tournament[0].route);
            }
            const nextGen: number[][] = [];
            for (let i = 0; i < eliteSize; i++) nextGen.push(scored[i].route);
            while (nextGen.length < populationSize) {
                const parent1 = parents[Math.floor(Math.random() * parents.length)];
                const parent2 = parents[Math.floor(Math.random() * parents.length)];
                let child = this.crossover(parent1, parent2);
                if (Math.random() < mutationRate) child = this.mutate(child);
                nextGen.push(child);
            }
            population = nextGen;
            if (this.hasConverged(population, bestScore)) break;
        }
        return { route: bestRoute, score: bestScore };
    }

    private async simulatedAnnealingOptimization(
        waypoints: any[],
        constraints: any,
        options: any
    ): Promise<{ route: number[]; score: number }> {
        const iterations = options.iterations || 10000;
        const initial = await this.nearestNeighborOptimization(waypoints, constraints, options);
        let currentRoute = initial.route;
        let currentScore = initial.score;
        let bestRoute = [...currentRoute];
        let bestScore = currentScore;
        let temperature = 1000;
        const coolingRate = 0.995;
        for (let i = 0; i < iterations; i++) {
            const neighbor = this.generateNeighbor(currentRoute);
            const neighborScore = this.calculateRouteScore(neighbor, waypoints, constraints);
            const acceptance = this.calculateAcceptanceProbability(currentScore, neighborScore, temperature);
            if (acceptance > Math.random()) {
                currentRoute = neighbor;
                currentScore = neighborScore;
            }
            if (currentScore < bestScore) {
                bestRoute = [...currentRoute];
                bestScore = currentScore;
            }
            temperature *= coolingRate;
            if (temperature < 0.1) break;
        }
        return { route: bestRoute, score: bestScore };
    }

    private generateRandomRoute(length: number, roundTrip: boolean): number[] {
        const route = Array.from({ length }, (_, i) => i);
        for (let i = route.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [route[i], route[j]] = [route[j], route[i]];
        }
        if (roundTrip) route.push(route[0]);
        return route;
    }

    private crossover(parent1: number[], parent2: number[]): number[] {
        const start = Math.floor(Math.random() * parent1.length);
        const end = start + Math.floor(Math.random() * (parent1.length - start));
        const child = new Array(parent1.length).fill(-1);
        const segment = parent1.slice(start, end);
        for (let i = start; i < end; i++) child[i] = segment[i - start];
        let idx = end % parent1.length;
        for (let i = 0; i < parent2.length; i++) {
            const gene = parent2[(end + i) % parent2.length];
            if (!child.includes(gene)) {
                child[idx] = gene;
                idx = (idx + 1) % child.length;
            }
        }
        return child;
    }

    private mutate(route: number[]): number[] {
        const mutated = [...route];
        const i = Math.floor(Math.random() * mutated.length);
        let j = Math.floor(Math.random() * mutated.length);
        while (j === i) j = Math.floor(Math.random() * mutated.length);
        [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
        return mutated;
    }

    private generateNeighbor(route: number[]): number[] {
        const neighbor = [...route];
        const i = Math.floor(Math.random() * neighbor.length);
        let j = Math.floor(Math.random() * neighbor.length);
        while (j === i) j = Math.floor(Math.random() * neighbor.length);
        [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
        return neighbor;
    }

    private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371000;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number { return deg * (Math.PI / 180); }

    private calculateRouteScore(route: number[], waypoints: any[], constraints: any): number {
        let totalDistance = 0;
        let totalDuration = 0;
        let violations = 0;
        for (let i = 0; i < route.length - 1; i++) {
            const from = waypoints[route[i]];
            const to = waypoints[route[i + 1]];
            const distance = this.calculateHaversineDistance(from.latitude, from.longitude, to.latitude, to.longitude);
            totalDistance += distance;
            const duration = distance / (50000 / 3600); // 50km/h
            totalDuration += duration;
        }
        if (constraints.maxDistance && totalDistance > constraints.maxDistance) violations += (totalDistance - constraints.maxDistance) / constraints.maxDistance;
        if (constraints.maxDuration && totalDuration > constraints.maxDuration) violations += (totalDuration - constraints.maxDuration) / constraints.maxDuration;
        if (constraints.maxStops && route.length > constraints.maxStops) violations += (route.length - constraints.maxStops) / constraints.maxStops;
        const distanceWeight = 0.4;
        const durationWeight = 0.4;
        const violationWeight = 0.2;
        const normalizedDistance = totalDistance / 100000;
        const normalizedDuration = totalDuration / 3600;
        return distanceWeight * normalizedDistance + durationWeight * normalizedDuration + violationWeight * violations * 10;
    }

    private calculateAcceptanceProbability(currentScore: number, newScore: number, temperature: number): number {
        if (newScore < currentScore) return 1;
        return Math.exp((currentScore - newScore) / temperature);
    }

    private hasConverged(population: number[][], bestScore: number): boolean {
        const sample = Math.min(10, population.length);
        let similarity = 0;
        for (let i = 0; i < sample; i++) {
            for (let j = i + 1; j < sample; j++) {
                similarity += this.routeSimilarity(population[i], population[j]);
            }
        }
        const avg = similarity / (sample * (sample - 1) / 2);
        return avg > 0.9;
    }

    private routeSimilarity(a: number[], b: number[]): number {
        let matches = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) if (a[i] === b[i]) matches++;
        return matches / Math.max(a.length, b.length);
    }

    private getCacheKey(request: RouteOptimizationRequest): string {
        const keyData = {
            waypoints: request.waypoints.map(w => [w.latitude.toFixed(6), w.longitude.toFixed(6), w.priority]),
            constraints: request.constraints,
            optimizationCriteria: request.optimizationCriteria,
            algorithm: request.algorithm,
            iterations: request.iterations
        };
        return `route_optimization:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
    }

    async optimizeRoute(request: RouteOptimizationRequest): Promise<OptimizedRoute> {
        const start = Date.now();
        metrics.increment('route_optimization.requests_total');
        try {
            const validated = RouteOptimizationRequestSchema.parse(request);
            const cacheKey = this.getCacheKey(validated);
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                const cachedRoute: OptimizedRoute = JSON.parse(cached);
                logger.debug('Cache hit for route optimization', { cacheKey: cacheKey.substring(0, 30) });
                metrics.increment('route_optimization.cache_hits_total');
                return { ...cachedRoute, metadata: { ...cachedRoute.metadata, executionTimeMs: Date.now() - start, cacheHit: true } };
            }
            metrics.increment('route_optimization.cache_misses_total');
            let optimizer = this.optimizers.find(o => o.name === validated.algorithm);
            if (!optimizer) {
                if (validated.waypoints.length <= 20) optimizer = this.optimizers.find(o => o.name === 'nearest_neighbor');
                else if (validated.waypoints.length <= 50) optimizer = this.optimizers.find(o => o.name === 'genetic');
                else optimizer = this.optimizers.find(o => o.name === 'simulated_annealing');
            }
            const optResult = await this.circuitBreaker.execute(() => optimizer!.optimize(
                validated.waypoints,
                validated.constraints || {},
                { roundTrip: !validated.endPoint, populationSize: validated.populationSize, iterations: validated.iterations }
            ));
            // Build segments
            const segments: RouteSegment[] = [];
            let totalDistance = 0;
            let totalDuration = 0;
            for (let i = 0; i < optResult.route.length - 1; i++) {
                const fromIdx = optResult.route[i];
                const toIdx = optResult.route[i + 1];
                const from = validated.waypoints[fromIdx];
                const to = validated.waypoints[toIdx];
                const distance = this.calculateHaversineDistance(from.latitude, from.longitude, to.latitude, to.longitude);
                const duration = distance / (50000 / 3600);
                totalDistance += distance;
                totalDuration += duration;
                segments.push({
                    fromIndex: fromIdx,
                    toIndex: toIdx,
                    distance,
                    duration,
                    polyline: this.encodePolyline([[from.longitude, from.latitude], [to.longitude, to.latitude]]),
                    instructions: [`From waypoint ${fromIdx + 1} to ${toIdx + 1}`, `Distance ${(distance / 1000).toFixed(2)} km`, `ETA ${(duration / 60).toFixed(0)} mins`]
                });
            }
            const initialScore = this.calculateRouteScore(Array.from({ length: validated.waypoints.length }, (_, i) => i), validated.waypoints, validated.constraints || {});
            const improvement = initialScore - optResult.score;
            const response: OptimizedRoute = {
                route: optResult.route,
                segments,
                summary: {
                    totalDistance,
                    totalDuration,
                    constraintsViolated: 0,
                    optimizationScore: optResult.score,
                    improvements: {
                        distance: totalDistance * (improvement / initialScore),
                        duration: totalDuration * (improvement / initialScore),
                        percentage: (improvement / initialScore) * 100
                    }
                },
                metadata: {
                    executionTimeMs: Date.now() - start,
                    algorithmUsed: optimizer!.name,
                    iterations: validated.iterations,
                    cacheHit: false,
                    convergenceRate: optResult.convergenceRate
                }
            };
            await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(response));
            logger.info('Route optimization completed', {
                algorithm: optimizer!.name,
                waypoints: validated.waypoints.length,
                totalDistance: `${(totalDistance / 1000).toFixed(2)} km`,
                totalDuration: `${(totalDuration / 3600).toFixed(2)} h`,
                improvement: `${(improvement / initialScore * 100).toFixed(1)}%`
            });
            metrics.timing('route_optimization.execution_time_ms', response.metadata.executionTimeMs);
            metrics.gauge('route_optimization.improvement_percentage', response.summary.improvements.percentage);
            return response;
        } catch (err: any) {
            metrics.increment('route_optimization.errors_total');
            logger.error('Route optimization failed', { error: err.message, stack: err.stack, waypoints: request.waypoints?.length, algorithm: request.algorithm });
            throw new Error(`Route optimization failed: ${err.message}`);
        }
    }

    private encodePolyline(points: number[][]): string {
        return points.map(p => p.join(',')).join('|');
    }

    async clearCache(prefix: string = 'route_optimization:'): Promise<number> {
        try {
            const keys = await this.redis.keys(`${prefix}*`);
            if (keys.length) await this.redis.del(...keys);
            return keys.length;
        } catch (e) {
            logger.error('Failed to clear route optimization cache', { error: e });
            return 0;
        }
    }
}
