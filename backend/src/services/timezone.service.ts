import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { LRUCache } from 'lru-cache';
import { compress, decompress } from 'lz4';
import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';

// ==================== ZOD SCHEMAS ====================
const CoordinatesSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
});

export interface TimezoneInfo {
    zoneId: string;
    name: string;
    offset: number;
    dstOffset: number;
    rawOffset: number;
    dstEnabled: boolean;
    currentLocalTime: Date;
    currentUtcTime: Date;
    countryCode?: string;
    region?: string;
    timezoneProvider: 'google' | 'geonames' | 'offline' | 'cache';
}

export interface LocalTime {
    local: Date;
    utc: Date;
    formatted: string;
    offset: number;
    dstActive: boolean;
}

export interface BusinessHours {
    timezone: string;
    openingTime: string;
    closingTime: string;
    daysOpen: number[];
    holidays?: string[];
    is24Hours: boolean;
}

// ==================== TIMEZONE SERVICE ====================
export class TimezoneService {
    private readonly memoryCache: LRUCache<string, Buffer>;
    private readonly nodeCache: NodeCache;
    private readonly redis: Redis;
    private readonly pgPool: Pool;
    private readonly httpClient: AxiosInstance;
    private readonly circuitBreakers: Map<string, CircuitBreaker>;
    private readonly providerWeights: Map<string, number>;

    constructor(
        redisClient: Redis,
        pgPool: Pool,
        httpClient?: AxiosInstance
    ) {
        this.redis = redisClient;
        this.pgPool = pgPool;
        this.httpClient = httpClient || axios.create({ timeout: 5000 });

        this.memoryCache = new LRUCache<string, Buffer>({
            max: 1000,
            ttl: 300000,
            fetchMethod: async (key: string) => {
                const data = await this.redis.get(key);
                return data ? compress(Buffer.from(data)) : undefined;
            }
        });

        this.nodeCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

        this.circuitBreakers = new Map();
        ['google', 'geonames'].forEach(p => {
            this.circuitBreakers.set(p, new CircuitBreaker({
                failureThreshold: 5, resetTimeout: 30000, timeout: 5000
            }));
        });

        this.providerWeights = new Map([['google', 0.6], ['geonames', 0.4]]);
    }

    async getTimezone(lat: number, lng: number): Promise<TimezoneInfo> {
        const start = Date.now();
        const cacheKey = `tz:${lat.toFixed(4)}:${lng.toFixed(4)}`;

        try {
            // 1. Memory Cache
            const memCached = this.memoryCache.get(cacheKey);
            if (memCached) {
                metrics.increment('timezone.cache_hits_memory');
                return JSON.parse(decompress(memCached).toString());
            }

            // 2. Redis Cache
            const redisCached = await this.redis.get(cacheKey);
            if (redisCached) {
                metrics.increment('timezone.cache_hits_redis');
                const data = JSON.parse(redisCached);
                this.setMemoryCache(cacheKey, data);
                return data;
            }

            // 3. Provider Fetch
            const provider = this.selectProvider();
            const result = await this.circuitBreakers.get(provider)!.execute(() =>
                this.fetchFromProvider(provider, lat, lng)
            );

            // 4. Update Caches
            await this.redis.setex(cacheKey, 86400, JSON.stringify(result));
            this.setMemoryCache(cacheKey, result);

            metrics.timing('timezone.latency', Date.now() - start);
            return result;

        } catch (error) {
            logger.error('Timezone fetch failed', { lat, lng, error });
            return this.fallbackTimezone();
        }
    }

    async getBusinessHours(lat: number, lng: number): Promise<BusinessHours> {
        const tz = await this.getTimezone(lat, lng);
        // Mock logic for 10x speed - normally would query a regional DB
        return {
            timezone: tz.zoneId,
            openingTime: '09:00',
            closingTime: '17:00',
            daysOpen: [1, 2, 3, 4, 5],
            is24Hours: false
        };
    }

    private async fetchFromProvider(provider: string, lat: number, lng: number): Promise<TimezoneInfo> {
        if (provider === 'google') {
            const key = process.env.GOOGLE_MAPS_API_KEY;
            const ts = Math.floor(Date.now() / 1000);
            const res = await this.httpClient.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}&key=${key}`);
            if (res.data.status !== 'OK') throw new Error(res.data.errorMessage || 'Google API Error');

            return {
                zoneId: res.data.timeZoneId,
                name: res.data.timeZoneName,
                offset: res.data.rawOffset / 3600,
                dstOffset: res.data.dstOffset / 3600,
                rawOffset: res.data.rawOffset / 3600,
                dstEnabled: res.data.dstOffset !== 0,
                currentLocalTime: new Date(Date.now() + (res.data.rawOffset + res.data.dstOffset) * 1000),
                currentUtcTime: new Date(),
                timezoneProvider: 'google'
            };
        }
        throw new Error('Provider not implemented');
    }

    private selectProvider(): string {
        return Math.random() > 0.4 ? 'google' : 'geonames';
    }

    private setMemoryCache(key: string, data: any) {
        try {
            this.memoryCache.set(key, compress(Buffer.from(JSON.stringify(data))));
        } catch (e) {
            logger.warn('Failed to compress cache', e);
        }
    }

    private fallbackTimezone(): TimezoneInfo {
        return {
            zoneId: 'UTC',
            name: 'UTC',
            offset: 0,
            dstOffset: 0,
            rawOffset: 0,
            dstEnabled: false,
            currentLocalTime: new Date(),
            currentUtcTime: new Date(),
            timezoneProvider: 'offline'
        };
    }
}
