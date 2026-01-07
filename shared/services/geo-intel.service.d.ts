export declare class GeoIntelService {
    /**
     * 🗺️ ASSET INTELLIGENCE 100X: Environmental analysis, hyperlocal noise maps,
     * energy efficiency forecasting, and proximity scoring.
     * Features: [6, 9, 10, 11, 23, 47]
     */
    static getPropertyEnvironmentalAnalysis(lat: number, lng: number): Promise<{
        environmental: any;
        logistics: any;
        market_value_index: number;
    }>;
    /**
     * 🎯 SNIPER ENGINE 100X: Intent-based geographical alerts.
     * Detects "buying signal" patterns in specific radii.
     * Features: [15, 22, 51]
     */
    static triggerSniperAlert(category: string, lat: number, lng: number, price: number): Promise<{
        target_users: number;
        conversion_probability: number;
    }>;
    /**
     * 🔥 REAL-TIME HEATMAP: Global demand visualization for B2B/Wholesale.
     */
    static getGlobalHeatmap(category: string): Promise<any[]>;
}
