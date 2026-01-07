import { Pool } from 'pg';
import Redis from 'ioredis';
export declare class ProEngineService {
    private db;
    private redis;
    private ai;
    constructor(db: Pool, redis: Redis);
    secureAudit(listingId: string, data: any, adminId?: string): Promise<{
        verified: boolean;
        fraudScore: number;
    }>;
    processMedia(listingId: string, imageUrl: string): Promise<{
        watermarkedUrl: string;
        qrCode: string;
    }>;
    getFinancialEstimate(amount: number, fromCurrency: string, userLang: string): Promise<{
        converted: number;
        estimatedMonthly: number;
        currencySymbol: string;
    }>;
    registerSearchActivity(lat: number, lng: number, category: string): Promise<{
        alertsSent: any;
    }>;
    translateMessage(text: string, targetLang: string): Promise<string>;
    getOfflineSyncPacket(userId: string, lat: number, lng: number): Promise<any>;
    verifyTrust(userId: string, videoUrl?: string): Promise<{
        score: number;
        verified: boolean;
        badge: string;
    }>;
}
