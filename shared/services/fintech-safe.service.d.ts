export declare class FinTechSafeService {
    /**
     * 🛡️ SENTINEL X: Digital fingerprinting, dark web monitoring,
     * and autonomous fraud prevention layer.
     * Features: [7, 20, 21, 25, 42]
     */
    static verifyTransactionSecurity(userId: string, targetValue: number): Promise<{
        safe: boolean;
        risk_score: number;
        protections_active: string[];
    }>;
    /**
     * 🏦 GLOBAL TAX 100X: Real-time tax calculation for 50+ jurisdictions
     * including cross-border customs for vehicles and high-value assets.
     * Features: [8, 24, 33, 48]
     */
    static estimateFinalPriceWithTaxes(basePrice: number, countryCode: string, category: 'vehicle' | 'real_estate' | 'commodity'): Promise<{
        total_price: number;
        tax_breakdown: any;
        customs_fees: number;
    }>;
}
