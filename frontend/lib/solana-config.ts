import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// --- CONFIGURACIÓN QUANTUM SOLANA ---
export const SOLANA_NETWORK = 'devnet';
export const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
export const ADMIN_WALLET = new PublicKey('4p8S5H8yq1q5A5f8xK8R8z8j8L8M8N8P8Q8R8S8T8U'); // Wallet de tesorería del imperio

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
