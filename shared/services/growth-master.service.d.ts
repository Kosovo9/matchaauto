export declare class GrowthMasterService {
    /**
     * 📈 VIRAL LOOP 2.0: AI-verified sharing incentives and K-Factor optimization.
     * Features: [17, 29, 32, 50]
     */
    static calculateAffiliateReward(userId: string, referralType: 'listing' | 'signup' | 'sale'): Promise<{
        credits: number;
        reputation_boost: number;
        unlock_features: string[];
    }>;
    /**
     * 🛒 B2B SYNC 100X: Automated inventory import and geo-fenced flash sales.
     * Features: [16, 28, 31, 34, 45]
     */
    static triggerFlashSale(listingId: string, radiusKm?: number): Promise<{
        success: boolean;
        notifications_sent: number;
        projected_conversion_uplift: string;
    }>;
    /**
     * 📊 K-FACTOR MONITOR: Real-time viral growth monitoring.
     */
    static getGlobalGrowthMetrics(): Promise<{
        k_factor: number;
        virality_score: string;
    }>;
}
