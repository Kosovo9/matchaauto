import { z } from 'zod';
import Redis from 'ioredis';
import axios from 'axios';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';

export const TimezoneRequestSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timestamp: z.number().optional() // unix timestamp
});

export const TimezoneResponseSchema = z.object({
    timeZoneId: z.string(),
    timeZoneName: z.string().optional(),
    rawOffset: z.number(), // offset from UTC in seconds
    dstOffset: z.number(), // dst offset in seconds
    currentOffset: z.number() // total offset in minutes (for easy frontend use)
});

export type TimezoneRequest = z.infer<typeof TimezoneRequestSchema>;
export type TimezoneResponse = z.infer<typeof TimezoneResponseSchema>;

export class TimezoneService {
    private redis: Redis;
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 2592000; // 30 days cache (Timezones rarely change boundaries)

    constructor(redis: Redis) {
        this.redis = redis;
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 60000,
            timeout: 5000
        });
    }

    /**
     * Get timezone information for a GPS point.
     * Uses Redis cache and Google Maps API (or fallback).
     */
    async getTimezone(lat: number, lng: number): Promise<string> {
        const info = await this.getTimezoneInfo(lat, lng);
        return info.timeZoneId;
    }

    /**
     * Get detailed timezone info including offsets.
     */
    async getTimezoneInfo(lat: number, lng: number, timestamp = Math.floor(Date.now() / 1000)): Promise<TimezoneResponse> {
        const start = Date.now();
        metrics.increment('timezone.requests_total');

        try {
            // 1. Check Cache
            const cacheKey = this.getCacheKey(lat, lng);
            const cached = await this.redis.get(cacheKey);

            if (cached) {
                metrics.increment('timezone.cache_hits_total');
                logger.debug('Timezone cache hit', { cacheKey });
                return JSON.parse(cached) as TimezoneResponse;
            }
            metrics.increment('timezone.cache_misses_total');

            // 2. Fetch from External Provider via Circuit Breaker
            const result = await this.circuitBreaker.execute(async () => {
                return await this.fetchFromProvider(lat, lng, timestamp);
            });

            // 3. Cache Result
            await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
            metrics.timing('timezone.duration_ms', Date.now() - start);

            return result;
        } catch (error: any) {
            metrics.increment('timezone.errors_total');
            logger.error('Timezone fetch failed', { error: error.message, lat, lng });
            // Fallback to UTC to prevent crashes
            return {
                timeZoneId: 'UTC',
                timeZoneName: 'Coordinated Universal Time',
                rawOffset: 0,
                dstOffset: 0,
                currentOffset: 0
            };
        }
    }

    /**
     * Calculates the local offset in minutes for a specific location using native Intl
     * avoiding external API calls if possible, or using the info we just fetched.
     */
    async getLocalOffset(lat: number, lng: number): Promise<number> {
        try {
            const tzId = await this.getTimezone(lat, lng);
            return this.calculateOffsetForTimezone(tzId);
        } catch (e) {
            return 0; // UTC fallback
        }
    }

    private calculateOffsetForTimezone(timeZone: string): number {
        try {
            const date = new Date();
            // Get string like "1/5/2026, 8:26:00 PM" in that timezone
            // We need to compare it to UTC string
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));

            // Difference in minutes
            const diff = (tzDate.getTime() - utcDate.getTime()) / 60000;
            return Math.round(diff);
        } catch (e) {
            logger.warn(`Could not calculate offset for timezone ${timeZone}`, { error: e });
            return 0;
        }
    }

    private async fetchFromProvider(lat: number, lng: number, timestamp: number): Promise<TimezoneResponse> {
        // Primary: Google Maps Timezone API
        if (process.env.GOOGLE_MAPS_API_KEY) {
            const response = await axios.get('https://maps.googleapis.com/maps/api/timezone/json', {
                params: {
                    location: `${lat},${lng}`,
                    timestamp,
                    key: process.env.GOOGLE_MAPS_API_KEY
                },
                timeout: 5000
            });

            if (response.data.status === 'OK') {
                const data = response.data;
                // Google returns offsets in seconds
                const totalOffsetSeconds = data.rawOffset + data.dstOffset;
                return {
                    timeZoneId: data.timeZoneId,
                    timeZoneName: data.timeZoneName,
                    rawOffset: data.rawOffset,
                    dstOffset: data.dstOffset,
                    currentOffset: Math.floor(totalOffsetSeconds / 60) // minutes
                };
            } else {
                throw new Error(`Google API Error: ${response.data.status} - ${response.data.errorMessage}`);
            }
        }

        // Secondary: OpenStreetMap / GeoApify could go here
        // For now, if no API key, we might use a geometric look-up library if we had one installed (e.g. geo-tz)
        // Since we can't install new heavy libs easily without user permission, we fallback to UTC or throw
        throw new Error('No Timezone Provider configured');
    }

    private getCacheKey(lat: number, lng: number): string {
        // Round to 2 decimal places (~1.1km) to group nearby requests
        return `tz:${lat.toFixed(2)}:${lng.toFixed(2)}`;
    }

    async clearCache(): Promise<void> {
        const keys = await this.redis.keys('tz:*');
        if (keys.length) await this.redis.del(...keys);
    }
}
