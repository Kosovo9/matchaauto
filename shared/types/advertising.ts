export type AdTier = 'free' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface ListingAdPerformance {
    id: string;
    title: string;
    category: string;
    tier: AdTier;
    views: number;
    contacts: number;
    watchlist: number;
    createdAt: string;
    expiresAt: string;
    matchAdBudget?: number;
    roi: number;
    region: string;
}

export interface GlobalAdMetrics {
    totalReach: string;
    activeCampaigns: number;
    adSpendToday: string;
    avgROI: string;
    newUsers24h: number;
    avgResponseTime: string;
    liveConnections: number;
}

export interface PredictionData {
    id: string;
    metric: string;
    current: number;
    predicted: number;
    confidence: number;
    trend: 'up' | 'down';
}

export interface CountryROI {
    country: string;
    code: string;
    listings: number;
    avgPrice: number;
    roi: number;
    recommendedBudget: number;
    color: string;
}
