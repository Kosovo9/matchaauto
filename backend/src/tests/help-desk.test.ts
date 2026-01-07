
import { describe, it, expect, vi } from 'vitest';
import { HelpDeskController } from '../controllers/help-desk.controller';

describe('HelpDeskController', () => {
    it('should be defined', () => {
        const controller = new HelpDeskController({} as any, {} as any);
        expect(controller).toBeDefined();
    });

    it('should handle query', async () => {
        const controller = new HelpDeskController({} as any, {} as any);
        const c = {
            req: { json: vi.fn().mockResolvedValue({ userId: 'u1', question: 'test' }) },
            json: vi.fn().mockImplementation((val) => val)
        } as any;
        const res = await controller.query(c);
        expect(res.success).toBe(true);
        expect(res.answer).toContain('AI Support');
    });
});
