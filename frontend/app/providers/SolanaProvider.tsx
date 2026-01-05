'use client';

import {
    Connection,
    clusterApiUrl,
    PublicKey
} from '@solana/web3.js';
import {
    WalletAdapterNetwork,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
    ConnectionProvider,
    WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';

export function SolanaProvider({ children }: { children: React.ReactNode }) {
    // Use mainnet-beta for production
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Configure wallets
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

// Utility function to connect with backend wallet service
export async function getBalanceFromBackend(
    publicKey: PublicKey,
    traceId?: string
): Promise<{
    sol: number;
    lamports: number;
    formatted: string;
    lastUpdated: Date;
    source: 'cache' | 'rpc';
    cacheHit: boolean;
}> {
    const response = await fetch(`/api/wallet/balance/${publicKey.toBase58()}`, {
        headers: traceId ? { 'X-Trace-ID': traceId } : {},
    });

    if (!response.ok) {
        throw new Error('Failed to fetch balance from backend');
    }

    const data = await response.json();
    return data.data;
}

// Utility function to send SOL transaction through backend
export async function sendSolanaTransaction(
    from: PublicKey,
    to: PublicKey,
    amount: number,
    traceId?: string
): Promise<{ signature: string; status: 'confirmed' | 'pending' | 'failed' }> {
    const response = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(traceId && { 'X-Trace-ID': traceId }),
        },
        body: JSON.stringify({
            from: from.toBase58(),
            to: to.toBase58(),
            amount,
            currency: 'SOL',
        }),
    });

    if (!response.ok) {
        throw new Error('Transaction failed');
    }

    return await response.json();
}
