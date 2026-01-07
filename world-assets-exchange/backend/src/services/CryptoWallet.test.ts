import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CryptoWallet, createCryptoWallet } from './CryptoWallet';
import { Connection, PublicKey } from '@solana/web3.js';

// Define the mock outside to access it easily
const mockGetBalance = vi.fn();

// Mock @solana/web3.js
vi.mock('@solana/web3.js', () => {
    return {
        Connection: function () {
            return {
                getBalance: mockGetBalance,
            };
        },
        PublicKey: function (addr: string) {
            // Mock base58 validation roughly
            if (addr === 'invalid') throw new Error('Invalid');
            return {};
        },
        LAMPORTS_PER_SOL: 1_000_000_000,
    };
});

describe('CryptoWallet', () => {
    let wallet: CryptoWallet;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetBalance.mockResolvedValue(1000000000); // 1 SOL

        wallet = createCryptoWallet({
            SOLANA_RPC_URL: 'https://api.testnet.solana.com',
            SOLANA_NETWORK: 'testnet'
        } as any);
    });

    describe('validateAddress', () => {
        it('should return true for valid Solana address candidate', () => {
            // Use a real Solana address (44 chars)
            const validAddress = 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg';
            expect(wallet.validateAddress(validAddress)).toBe(true);
        });

        it('should return false for invalid Solana address', () => {
            expect(wallet.validateAddress('invalid')).toBe(false);
        });
    });

    describe('getBalance', () => {
        it('should return balance for valid address', async () => {
            const address = 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg';
            const balance = await wallet.getBalance(address);

            expect(balance.sol).toBe(1);
            expect(balance.formatted).toBe('1.0000 SOL');
        });

        it('should trigger fallback if RPC fails', async () => {
            mockGetBalance.mockRejectedValue(new Error('RPC Down'));

            const address = 'vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg';
            const balance = await wallet.getBalance(address);

            expect(balance.formatted).toBe('0 SOL (Safe Fallback)');
        });
    });
});
