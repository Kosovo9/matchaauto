import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// --- CONFIGURACIÓN QUANTUM SOLANA ---
export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Valid base58 dummy key: 4zMMC9srt5RyDk1x7wLFCN3h9pA8Kk5gHxX9qjN6Gd7U
const FALLBACK_WALLET = '4zMMC9srt5RyDk1x7wLFCN3h9pA8Kk5gHxX9qjN6Gd7U';
const walletStr = process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET || FALLBACK_WALLET;

export const ADMIN_WALLET = new PublicKey(walletStr);

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export const createTransferTransaction = async (fromPubkey: PublicKey, amountInSol: number) => {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey,
            toPubkey: ADMIN_WALLET,
            lamports: amountInSol * LAMPORTS_PER_SOL,
        })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    return transaction;
};
