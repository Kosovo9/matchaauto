import { describe, it, expect, vi } from 'vitest';
import { GeofencingService } from '../services/geo-fencing.service';

describe('GeofencingService', () => {
    const mockRedis = { get: vi.fn(), setex: vi.fn() } as any;
    const mockPg = { connect: vi.fn() } as any;
    const service = new GeofencingService(mockRedis, mockPg);

    it('detecta transiciones ENTER/EXIT', async () => {
        mockRedis.get.mockResolvedValue('outside'); // Previous state
        const activeFences = [{ id: 'f1', name: 'Test', is_inside: true }];

        // Mocking the checkProximity internal logic
        const client = { query: vi.fn().mockResolvedValue({ rows: activeFences }), release: vi.fn() };
        mockPg.connect.mockResolvedValue(client);

        const events = await service.checkProximity('u1', 4, -74);
        expect(events[0].type).toBe('ENTER');
        expect(mockRedis.setex).toHaveBeenCalled();
    });
});
