import { z } from 'zod';
import axios, { AxiosInstance } from 'axios';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';

export const GeocodeResultSchema = z.object({
    formattedAddress: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    country: z.string().optional(),
    countryCode: z.string().optional(),
    city: z.string().optional(),
    confidence: z.number().default(0.8),
    provider: z.string(),
    cached: z.boolean().default(false)
});

export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;

export class GeocodingService {
    private redis: Redis;
    private pgPool: Pool;
    private httpClient: AxiosInstance;
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 86400 * 7; // 7 days cache

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.httpClient = axios.create({ timeout: 10000 });
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 30000,
            timeout: 10000
        });
    }

    async geocode(address: string): Promise<GeocodeResult[]> {
        const start = Date.now();
        metrics.increment('geocoding.requests_total');
        const cacheKey = `geocode:${Buffer.from(address).toString('base64')}`;

        // 1. Try Cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            metrics.increment('geocoding.cache_hits_total');
            return JSON.parse(cached);
        }
        metrics.increment('geocoding.cache_misses_total');

        // 2. Try Provider via Circuit Breaker
        try {
            const results = await this.circuitBreaker.execute(async () => {
                return await this.fetchGeocode(address);
            });

            if (results.length > 0) {
                await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(results));
            }

            metrics.timing('geocoding.duration_ms', Date.now() - start);
            return results;
        } catch (error: any) {
            metrics.increment('geocoding.errors_total');
            logger.error('Geocoding failed:', { error: error.message });
            return [];
        }
    }

    async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
        const start = Date.now();
        const cacheKey = `reverse:${lat.toFixed(6)}:${lng.toFixed(6)}`;

        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        try {
            const result = await this.circuitBreaker.execute(async () => {
                return await this.fetchReverseGeocode(lat, lng);
            });

            if (result) {
                await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
            }

            metrics.timing('geocoding.reverse_duration_ms', Date.now() - start);
            return result;
        } catch (error) {
            logger.error('Reverse geocoding failed:', error);
            return null;
        }
    }

    private async fetchGeocode(address: string): Promise<GeocodeResult[]> {
        // Here we could implement multi-provider logic (Google -> Mapbox -> Nominatim)
        // For now, continuing with Nominatim as the free/default 
        // but structured for easy swapping

        const response = await this.httpClient.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json', limit: 5 },
            headers: { 'User-Agent': 'MatchaAuto-10x' }
        });

        return response.data.map((item: any) => ({
            formattedAddress: item.display_name,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            confidence: parseFloat(item.importance) || 0.5,
            provider: 'nominatim',
            cached: false
        }));
    }

    private async fetchReverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
        const response = await this.httpClient.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat, lon: lng, format: 'json' },
            headers: { 'User-Agent': 'MatchaAuto-10x' }
        });

        const data = response.data;
        return {
            formattedAddress: data.display_name,
            latitude: lat,
            longitude: lng,
            confidence: 1.0,
            provider: 'nominatim',
            cached: false
        };
    }
}
