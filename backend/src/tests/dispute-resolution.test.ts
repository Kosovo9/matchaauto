
import { describe, it, expect, vi } from 'vitest';
import { DisputeResolutionController } from '../controllers/dispute-resolution.controller';

describe('DisputeResolutionController', () => {
    it('should be defined', () => {
        const controller = new DisputeResolutionController({} as any, {} as any);
        expect(controller).toBeDefined();
    });
});
