
import { describe, it, expect, vi } from 'vitest';
import { LocalCurrencyController } from '../controllers/local-currency.controller';

describe('LocalCurrencyController', () => {
    it('should be defined', () => {
        const controller = new LocalCurrencyController({} as any, {} as any);
        expect(controller).toBeDefined();
    });
});
