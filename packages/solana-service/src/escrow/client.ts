import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

export class EscrowClient {
    private program: Program;

    constructor(program: Program) {
        this.program = program;
    }

    /**
     * Initializes a new Escrow transaction
     */
    async initializeEscrow(
        buyer: anchor.web3.Keypair,
        seller: PublicKey,
        oracle: PublicKey,
        amount: number,
        trackingId: string,
        timelockSeconds: number
    ) {
        try {
            const [escrowAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from("escrow"), buyer.publicKey.toBuffer(), seller.toBuffer()],
                this.program.programId
            );

            const tx = await this.program.methods
                .initializeEscrow(new anchor.BN(amount), trackingId, new anchor.BN(timelockSeconds))
                .accounts({
                    buyer: buyer.publicKey,
                    seller: seller,
                    oracle: oracle,
                    // Additional accounts like mint, vault, etc. would go here
                })
                .signers([buyer])
                .rpc();

            return { tx, escrowAccount };
        } catch (error) {
            console.error("Failed to initialize escrow:", error);
            throw error;
        }
    }

    /**
     * Confirms delivery of the goods (Signed by Logistics Oracle)
     */
    async confirmDelivery(oracle: anchor.web3.Keypair, escrowAccount: PublicKey) {
        try {
            const tx = await this.program.methods
                .confirmDelivery()
                .accounts({
                    oracle: oracle.publicKey,
                    escrowAccount: escrowAccount,
                })
                .signers([oracle])
                .rpc();

            return tx;
        } catch (error) {
            console.error("Oracle confirmation failed:", error);
            throw error;
        }
    }

    /**
     * Withdraws funds from the escrow (Called by Seller after delivery)
     */
    async releaseFunds(seller: anchor.web3.Keypair, escrowAccount: PublicKey) {
        try {
            const tx = await this.program.methods
                .releaseFunds()
                .accounts({
                    seller: seller.publicKey,
                    escrowAccount: escrowAccount,
                })
                .signers([seller])
                .rpc();

            return tx;
        } catch (error) {
            console.error("Fund release failed:", error);
            throw error;
        }
    }
}
