import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeolocationService } from '../services/geolocation.service';

describe('GeolocationService', () => {
    let geoService: GeolocationService;
    const mockPool = { connect: vi.fn() } as any;
    const mockRedis = { get: vi.fn(), setex: vi.fn() } as any;

    beforeEach(() => {
        geoService = new GeolocationService(mockPool, mockRedis);
        vi.clearAllMocks();
    });

    it('should return cached results if available', async () => {
        const cachedData = [{ id: '1', name: 'Car 1' }];
        mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

        const results = await geoService.searchNearby(4.7110, -74.0721);

        expect(results).toEqual(cachedData);
        expect(mockRedis.get).toHaveBeenCalled();
        expect(mockPool.connect).not.toHaveBeenCalled();
    });

    it('should handle search errors gracefully', async () => {
        mockRedis.get.mockResolvedValue(null);
        mockPool.connect.mockRejectedValue(new Error('Connection failed'));

        await expect(geoService.searchNearby(4.7110, -74.0721))
            .rejects.toThrow('Connection failed');
    });
});
