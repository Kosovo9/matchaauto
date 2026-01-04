import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
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
}

// Interfaz de balance
export interface WalletBalance {
    sol: number;
    lamports: number;
    formatted: string;
    lastUpdated: Date;
}

// Clase principal CryptoWallet
export class CryptoWallet {
    private connection: Connection;
    private config: CryptoWalletConfig;
    private breaker: CircuitBreaker;
    private static readonly SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

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
     * Obtiene balance de una dirección Solana con Circuit Breaker y Timeout
     */
    public async getBalance(address: string): Promise<WalletBalance> {
        return this.breaker.execute(async () => {
            // Validar dirección
            const validatedAddress = SolanaAddressSchema.parse(address);

            // Configurar timeout
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), this.config.timeoutMs);

            try {
                const publicKey = new PublicKey(validatedAddress);
                const balanceLamports = await this.connection.getBalance(publicKey, 'confirmed');

                const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

                return {
                    sol: balanceSol,
                    lamports: balanceLamports,
                    formatted: `${balanceSol.toFixed(4)} SOL`,
                    lastUpdated: new Date(),
                };
            } catch (error: any) {
                if (error.name === 'AbortError') throw new Error(`RPC timeout after ${this.config.timeoutMs}ms`);
                throw new Error(`Failed to fetch balance: ${error.message}`);
            } finally {
                clearTimeout(timeoutId);
            }
        });
    }
}

// Factory para crear instancia configurada desde environment
export const createCryptoWallet = (env: Env) => {
    return new CryptoWallet({
        rpcUrl: env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
        network: (env.SOLANA_NETWORK as any) || 'mainnet-beta',
        timeoutMs: 15000,
    });
};
