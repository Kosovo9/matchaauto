
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { honeypotGuard } from '../src/middleware/security.middleware';
import { Context } from 'hono';

describe('Security Middleware - Honeypot', () => {
    let mockCtx: any;
    let mockNext: any;
    let mockPool: any;

    beforeEach(() => {
        mockPool = {
            query: vi.fn().mockResolvedValue({})
        };
        mockNext = vi.fn();
        mockCtx = {
            req: {
                method: 'POST',
                path: '/api/test',
                json: vi.fn(),
                header: vi.fn().mockReturnValue('127.0.0.1')
            },
            get: vi.fn().mockReturnValue(mockPool),
            json: vi.fn()
        };
    });

    it('should allow clean requests', async () => {
        mockCtx.req.json.mockResolvedValue({ name: 'Real User' });
        const guard = honeypotGuard(['website']);

        await guard(mockCtx, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockCtx.json).not.toHaveBeenCalled();
    });

    it('should trap bots with honeypot fields', async () => {
        mockCtx.req.json.mockResolvedValue({ name: 'Bot', website: 'http://evil.com' });
        const guard = honeypotGuard(['website']);

        await guard(mockCtx, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockCtx.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: "Suspicious behavior detected." }),
            403
        );
        expect(mockPool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO honeypot_hits'),
            expect.any(Array)
        );
    });

    it('should ignore non-POST requests', async () => {
        mockCtx.req.method = 'GET';
        const guard = honeypotGuard(['website']);

        await guard(mockCtx, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });
});
