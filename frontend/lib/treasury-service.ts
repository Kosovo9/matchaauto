import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_RPC_URL, ADMIN_WALLET } from './solana-config';

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export const getTreasuryStatus = async () => {
    try {
        const balance = await connection.getBalance(ADMIN_WALLET);
        const solBalance = balance / 1_000_000_000;

        // Fetch recent transactions
        const signatures = await connection.getSignaturesForAddress(ADMIN_WALLET, { limit: 10 });

        const transactions = await Promise.all(
            signatures.map(async (sig) => {
                const tx = await connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 });
                return {
                    signature: sig.signature,
                    slot: sig.slot,
                    time: sig.blockTime,
                    status: sig.confirmationStatus,
                    amount: tx?.meta?.postBalances[0] !== undefined ? (tx.meta.postBalances[1] - tx.meta.preBalances[1]) / 1_000_000_000 : 0
                };
            })
        );

        return {
            success: true,
            address: ADMIN_WALLET.toBase58(),
            balance: solBalance,
            network: 'devnet',
            transactions
        };
    } catch (error: any) {
        console.error("Treasury Monitor Error:", error);
        return { success: false, error: error.message };
    }
};
