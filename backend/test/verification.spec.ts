import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerificationService } from '../src/services/verification.service';
import { Pool } from 'pg';

// Mock Logger to avoid noise
vi.mock('../src/utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock pg Pool
vi.mock('pg', () => {
    const mPool = {
        query: vi.fn(),
    };
    return { Pool: vi.fn(() => mPool) };
});

describe('VerificationService', () => {
    let service: VerificationService;
    let pool: any;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();
        pool = new Pool();
        service = new VerificationService(pool);
    });

    it('should request verification successfully', async () => {
        const mockRow = { id: 'uuid-123', status: 'pending', created_at: new Date() };
        pool.query.mockResolvedValueOnce({ rows: [mockRow] });

        const input = { docType: 'passport', fileUrl: 'https://example.com/video.mp4' };
        const result = await service.requestVerification('user-123', input);

        // Verify query structure
        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query.mock.calls[0][0]).toContain('INSERT INTO identity_verifications');
        expect(pool.query.mock.calls[0][1]).toEqual(['user-123', 'passport', 'https://example.com/video.mp4']);

        expect(result).toEqual(mockRow);
    });

    it('should get latest status', async () => {
        const mockRow = { id: 'uuid-123', status: 'pending', created_at: new Date(), reviewed_at: null, review_note: null };
        pool.query.mockResolvedValueOnce({ rows: [mockRow] });

        const result = await service.getLatestStatus('user-123');

        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, status'), ['user-123']);
        expect(result).toEqual(mockRow);
    });

    it('should return "none" status if no record found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const result = await service.getLatestStatus('user-new');

        expect(result).toEqual({ status: 'none' });
    });

    it('should decide verification (approve)', async () => {
        const mockRow = { id: 'uuid-123', status: 'approved', reviewed_at: new Date() };
        pool.query.mockResolvedValueOnce({ rows: [mockRow] }); // UPDATE identity_verifications
        pool.query.mockResolvedValueOnce({ rows: [{ user_id: 'user-123' }] }); // SELECT user_id
        pool.query.mockResolvedValueOnce({ rows: [] }); // UPDATE users

        const params = {
            verificationId: 'uuid-123',
            decision: 'approved' as const,
            reviewerId: 'admin-1',
            note: 'Looks good'
        };

        const result = await service.decideVerification(params);

        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE identity_verifications'), [
            'uuid-123', 'approved', 'admin-1', 'Looks good'
        ]);
        expect(result).toEqual(mockRow);
    });
});
