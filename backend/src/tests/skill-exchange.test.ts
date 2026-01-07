
import { describe, it, expect, vi } from 'vitest';
import { SkillExchangeController } from '../controllers/skill-exchange.controller';

describe('SkillExchangeController', () => {
    it('should be defined', () => {
        const controller = new SkillExchangeController({} as any);
        expect(controller).toBeDefined();
    });
});
