import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Mock global fetch if needed, but MSW handles it
// global.fetch = vi.fn();

// Mock crypto.randomUUID
if (!global.crypto) {
    (global as any).crypto = {};
}
if (!global.crypto.randomUUID) {
    global.crypto.randomUUID = vi.fn(() => 'mock-uuid-1234-5678') as any;
}

// Mock Date
const mockDate = new Date('2024-01-01T00:00:00Z');
vi.setSystemTime(mockDate);

// Mock Cloudflare environment defaults
global.process.env = {
    ...global.process.env,
    NODE_ENV: 'test',
    SOLANA_RPC_URL: 'https://api.testnet.solana.com',
    CLERK_SECRET_KEY: 'test_clerk_sk_test_123',
    AI_TOXICITY_THRESHOLD: '0.8',
    VERSION: '1.0.0-test'
};

// Setup MSW server for API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
});
afterAll(() => {
    server.close();
    vi.useRealTimers();
});
