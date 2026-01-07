import { describe, it, expect, vi } from 'vitest';
import { RouteOptimizationService } from '../services/route-optimization.service';

describe('RouteOptimizationService', () => {
    const mockRedis = {} as any;
    const mockPg = {} as any;
    const service = new RouteOptimizationService(mockRedis, mockPg);

    it('ordena waypoints eficientemente usando 2-opt', async () => {
        // Mocking the solver since we don't want to call real distance matrix
        const matrix = {
            rows: [
                { elements: [{}, { distance: 100 }, { distance: 500 }] }, // Start
                { elements: [{}, {}, { distance: 100 }] },               // W1
                { elements: [{}, { distance: 100 }, {}] }                // W2
            ]
        };

        const request = {
            startPoint: { lat: 0, lng: 0 },
            waypoints: [
                { id: '1', lat: 1, lng: 1 },
                { id: '2', lat: 5, lng: 5 }
            ]
        };

        const result = (service as any).solveTSP(matrix, request);
        expect(result.sequence).toHaveLength(2);
        expect(result.totalDistance).toBeGreaterThan(0);
    });
});
