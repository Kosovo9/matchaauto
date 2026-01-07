export declare class BlockchainService {
    /**
     * 🔗 PROOF-OF-EXPERIENCE 100X: Decentralized record of user history,
     * vehicle maintenance, and transaction integrity.
     * Features: [27, 29, 31, 37, 39]
     */
    static generateProof(entityId: string, data: any): Promise<{
        hash: string;
        network: 'SOLANA_MAINNET' | 'POLYGON_POS';
        timestamp: number;
    }>;
    /**
     * 📜 NFT ASSET TITLES: Tokenization of vehicles and properties.
     * Integrates with real-world legal systems via sovereign identity.
     */
    static mintAssetNFT(ownerId: string, assetData: any): Promise<{
        mint_address: string;
        status: 'MINTED' | 'PENDING_VALIDATION';
    }>;
}
