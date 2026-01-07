export declare class UXPerformanceService {
    /**
     * ⚡ PREDICTIVE OPTIMIZER: Machine learning based pre-caching
     * and offline synchronization for the PWA vault.
     * Features: [39, 41, 46, 54]
     */
    static getOptimizationBundle(userId: string): Promise<{
        next_likely_view: string;
        precache_assets: string[];
        compression_mode: 'ULTRA' | 'BALANCED';
    }>;
    /**
     * ♿ UNIVERSAL INCLUSION: High-contrast patterns, screen reader
     * speech-to-intent engine, and voice command mapping.
     * Features: [19, 27, 40, 43, 55]
     */
    static mapVoiceCommand(input: string): Promise<{
        action: string;
        params: any;
    }>;
}
