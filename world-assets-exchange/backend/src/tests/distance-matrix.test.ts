import { describe, it, expect, vi } from 'vitest';
import { DistanceMatrixService } from '../services/distance-matrix.service';

describe('DistanceMatrixService', () => {
    const mockRedis = { get: vi.fn(), setex: vi.fn() } as any;
    const mockPg = {} as any;
    const service = new DistanceMatrixService(mockRedis, mockPg);

    it('calcula distancia haversine como fallback', async () => {
        const req = {
            origins: [{ lat: 0, lng: 0 }],
            destinations: [{ lat: 1, lng: 1 }],
            mode: 'car' as const
        };

        const result = (service as any).fallbackToHaversine(req);
        expect(result.rows[0].elements[0].distance).toBeGreaterThan(150000);
        expect(result.provider).toBe('haversine');
    });

    it('usa cache si está disponible', async () => {
        mockRedis.get.mockResolvedValue(JSON.stringify({ rows: [], provider: 'google' }));
        const result = await service.calculateMatrix({
            origins: [{ lat: 4, lng: -74 }],
            destinations: [{ lat: 4.1, lng: -74.1 }]
        });
        expect(result.cacheHit).toBe(true);
    });
});
