import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleService } from '../services/vehicle.service';

describe('VehicleService', () => {
    let vehicleService: VehicleService;
    const mockPool = {
        connect: vi.fn().mockReturnValue({
            query: vi.fn(),
            release: vi.fn()
        })
    } as any;

    beforeEach(() => {
        vehicleService = new VehicleService(mockPool);
        vi.clearAllMocks();
    });

    it('should list vehicles with default pagination', async () => {
        const mockResult = { rows: [{ id: '1', name: 'Tesla' }] };
        mockPool.connect().query.mockResolvedValue(mockResult);

        const vehicles = await vehicleService.listVehicles();

        expect(vehicles).toEqual(mockResult.rows);
        expect(mockPool.connect().query).toHaveBeenCalledWith(
            expect.stringContaining('LIMIT $1 OFFSET $2'),
            [20, 0]
        );
    });
});
