export declare class AIIntelService {
    /**
     * 🛠️ PHOTO MASTER 100X: Ultra-resolution restoration, license plate blurring,
     * background removal, and 360 tour frame generation.
     * Features: [1, 5, 13, 14, 39, 53]
     */
    static optimizeVisuals(imageUrl: string, options?: {
        blurPlates?: boolean;
        removeBg?: boolean;
        upscale?: boolean;
    }): Promise<{
        url: string;
        metadata: any;
    }>;
    /**
     * 📝 DESCRIPTION PRO 100X: Multi-modal extraction of vehicle specs from images
     * and high-conversion SEO copy generation using Llama 3.1 70B.
     * Features: [2, 12, 18, 37, 52]
     */
    static generateSmartContent(imageData: any[]): Promise<{
        specs: any;
        description: string;
        seoKeywords: string[];
    }>;
}
