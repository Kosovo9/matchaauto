import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { z } from 'zod';
import { Env } from '../../../shared/types';
import { CircuitBreaker, CircuitBreakerState } from '../lib/circuitBreaker';

// Esquema de validación de dirección Solana
const SolanaAddressSchema = z.string().refine(
    (address) => {
        try {
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    },
    { message: 'Invalid Solana public key' }
);

// Esquema para validación de red
const NetworkSchema = z.enum(['mainnet-beta', 'devnet', 'testnet']);

// Configuración de la wallet
interface CryptoWalletConfig {
    rpcUrl: string;
    network: z.infer<typeof NetworkSchema>;
    timeoutMs: number;
    monitor?: any;
}

// Interfaz de balance
export interface WalletBalance {
    sol: number;
    lamports: number;
    formatted: string;
    lastUpdated: Date;
    fromCache?: boolean;
}

// Clase principal CryptoWallet
export class CryptoWallet {
    private connection: Connection;
    private config: CryptoWalletConfig;
    private breaker: CircuitBreaker;
    private static readonly SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

    // Cache interno simple (10x Optimization)
    private balanceCache = new Map<string, { balance: WalletBalance, timestamp: number }>();
    private readonly CACHE_TTL = 10000; // 10 segundos

    constructor(config: CryptoWalletConfig) {
        const validatedConfig = {
            ...config,
            network: NetworkSchema.parse(config.network),
        };

        this.config = validatedConfig;
        this.connection = new Connection(validatedConfig.rpcUrl, {
            commitment: 'confirmed',
        });

        this.breaker = new CircuitBreaker({
            name: 'SolanaRPC',
            failureThreshold: 3,
            resetTimeout: 30000,
            onStateChange: (state, name) => {
                if (state === CircuitBreakerState.OPEN) {
                    this.config.monitor?.captureMessage(`CRITICAL: Circuit Breaker ${name} is OPEN`, 'error');
                }
            },
            fallback: async () => ({
                sol: 0,
                lamports: 0,
                formatted: '0 SOL (Safe Fallback)',
                lastUpdated: new Date()
            })
        });
    }

    /**
     * Valida una dirección de Solana
     */
    public validateAddress(address: string): boolean {
        try {
            if (!CryptoWallet.SOLANA_ADDRESS_REGEX.test(address)) return false;
            new PublicKey(address);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Obtiene balance con Caching Estratégico (10x Optimization)
     */
    public async getBalance(address: string): Promise<WalletBalance> {
        // 1. Check Cache
        const cached = this.balanceCache.get(address);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            return { ...cached.balance, fromCache: true };
        }

        return this.breaker.execute(async () => {
            const validatedAddress = SolanaAddressSchema.parse(address);
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), this.config.timeoutMs);

            try {
                const publicKey = new PublicKey(validatedAddress);
                const balanceLamports = await this.connection.getBalance(publicKey, 'confirmed');
                const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

                const balance: WalletBalance = {
                    sol: balanceSol,
                    lamports: balanceLamports,
                    formatted: `${balanceSol.toFixed(4)} SOL`,
                    lastUpdated: new Date(),
                };

                // Update Cache
                this.balanceCache.set(address, { balance, timestamp: Date.now() });

                return balance;
            } catch (error: any) {
                if (error.name === 'AbortError') throw new Error(`RPC timeout after ${this.config.timeoutMs}ms`);
                throw new Error(`Failed to fetch balance: ${error.message}`);
            } finally {
                clearTimeout(timeoutId);
            }
        });
    }

    /**
     * Envía transacción con Backoff Exponencial (10x Reliability)
     */
    public async sendTransactionWithRetry(transaction: Transaction, signers: Keypair[], maxRetries = 3): Promise<string> {
        let lastError: any;

        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await this.breaker.execute(async () => {
                    return await sendAndConfirmTransaction(this.connection, transaction, signers);
                });
            } catch (error: any) {
                lastError = error;
                if (i < maxRetries) {
                    const delay = Math.pow(2, i) * 1000 + (Math.random() * 1000); // Jitter
                    console.warn(`Transaction failed, retrying in ${delay}ms...`, error.message);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(`Transaction failed after ${maxRetries} retries: ${lastError.message}`);
    }
}

// Factory para crear instancia configurada desde environment
export const createCryptoWallet = (env: Env, monitor?: any) => {
    return new CryptoWallet({
        rpcUrl: env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        network: (env.SOLANA_NETWORK as any) || 'mainnet-beta',
        timeoutMs: 15000,
        monitor
    });
};
