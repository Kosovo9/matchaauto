import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import listings from './listings';

// Define a shared mock function
const mockModerateText = vi.fn();

// Mock AIOrchestrator
vi.mock('../services/ai/engine', () => {
    return {
        AIOrchestrator: function () {
            return {
                moderateText: mockModerateText
            };
        }
    };
});

describe('Listings Routes Integration', () => {
    let app: any;

    beforeEach(() => {
        app = new Hono();
        app.route('/listings', listings);
        vi.clearAllMocks();
    });

    it('should return 201 when creating a valid listing', async () => {
        mockModerateText.mockResolvedValue({
            isSafe: true,
            confidence: 0.1
        });

        const mockEnv = {
            DB: {
                prepare: vi.fn().mockReturnThis(),
                bind: vi.fn().mockReturnThis(),
                run: vi.fn().mockResolvedValue({ meta: { last_row_id: 1 } })
            },
            AI_TOXICITY_THRESHOLD: '0.8'
        };

        const res = await app.fetch(
            new Request('http://localhost/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Porsche 911 GT3',
                    description: 'Excellent condition, track ready.',
                    make: 'Porsche',
                    model: '911 GT3',
                    year: 2023,
                    price: 250000,
                    category: 'vehicles'
                })
            }),
            mockEnv
        );

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.data.title).toBe('Porsche 911 GT3');
    });

    it('should reject toxic content', async () => {
        mockModerateText.mockResolvedValue({
            isSafe: false,
            confidence: 0.95
        });

        const mockEnv = {
            AI_TOXICITY_THRESHOLD: '0.8'
        };

        const res = await app.fetch(
            new Request('http://localhost/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Toxic Title',
                    make: 'Test',
                    model: 'Test',
                    year: 2020,
                    price: 100
                })
            }),
            mockEnv
        );

        expect(res.status).toBe(422);
        const data = await res.json();
        expect(data.error).toBe('Content rejected');
    });
});
