import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { metrics } from '../utils/metrics';
import { GeocodingService } from './geocoding.service';

/**
 * Service to validate and standardize postal addresses.
 * Enhances basic validation with PostGIS checks, Caching, and Geocoding verification.
 */

// Legacy Schema for backward compatibility
export const AddressFormatSchema = z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().default('Colombia')
});

export type AddressFormat = z.infer<typeof AddressFormatSchema>;

// New Robust Schemas
export const AddressValidationRequestSchema = z.object({
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(3).optional(),
    country: z.string().min(2)
});

export const AddressValidationResponseSchema = z.object({
    isValid: z.boolean(),
    isReliable: z.boolean(),
    formattedAddress: z.string(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    confidence: z.number().min(0).max(1),
    metadata: z.object({
        provider: z.string(),
        validationSource: z.string()
    }).optional()
});

export type AddressValidationRequest = z.infer<typeof AddressValidationRequestSchema>;
export type AddressValidationResponse = z.infer<typeof AddressValidationResponseSchema>;

export class AddressValidationService {
    private redis: Redis;
    private pgPool: Pool;
    private geocodingService: GeocodingService;
    private circuitBreaker: CircuitBreaker;
    private cacheTTL = 604800; // 7 days for validated addresses

    constructor(redis: Redis, pgPool: Pool, geocodingService?: GeocodingService) {
        this.redis = redis;
        this.pgPool = pgPool;
        // If geocoding service is not provided, we instantiate one (assuming we have access to redis/pool)
        this.geocodingService = geocodingService || new GeocodingService(redis, pgPool);

        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeout: 60000,
            timeout: 15000
        });
    }

    /**
     * Legacy method for backward compatibility.
     * Normalizes an address to avoid duplicates and search errors.
     */
    async validateAndNormalize(rawAddress: string | AddressFormat): Promise<any> {
        let request: AddressValidationRequest;

        if (typeof rawAddress === 'string') {
            // Very rough parsing for legacy string input - would ideally need a parser
            // For now, we assume the string is the addressLine1 and we try our best
            const parts = rawAddress.split(',');
            request = {
                addressLine1: parts[0] || rawAddress,
                city: parts[1] || 'Unknown',
                state: parts[2] || 'Unknown',
                country: parts[3] || 'Colombia' // Default from legacy schema
            };
        } else {
            request = {
                addressLine1: rawAddress.street,
                city: rawAddress.city,
                state: rawAddress.state || '',
                postalCode: rawAddress.zipCode,
                country: rawAddress.country
            };
        }

        const result = await this.validate(request);

        return {
            isValid: result.isValid,
            isReliable: result.isReliable,
            normalized: result.formattedAddress,
            coordinates: {
                lat: result.latitude,
                lng: result.longitude
            },
            metadata: {
                provider: result.metadata?.provider || 'internal',
                confidence: result.confidence
            }
        };
    }

    /** 
     * Validate an address, returning standardized format and coordinates.
     * Uses Circuit Breaker and Caching.
     */
    async validate(request: AddressValidationRequest): Promise<AddressValidationResponse> {
        const start = Date.now();
        metrics.increment('address_validation.requests_total');

        try {
            // 1. Check Cache
            const cacheKey = this.getCacheKey(request);
            const cached = await this.redis.get(cacheKey);

            if (cached) {
                metrics.increment('address_validation.cache_hits_total');
                logger.debug('Address validation cache hit', { cacheKey: cacheKey.substring(0, 30) });
                return JSON.parse(cached) as AddressValidationResponse;
            }
            metrics.increment('address_validation.cache_misses_total');

            // 2. Execute Validation Logic (via Circuit Breaker)
            const result = await this.circuitBreaker.execute(async () => {
                return await this.performValidation(request);
            });

            // 3. Store in Cache & DB
            if (result.isValid) {
                await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
                // Asynchronously persist to DB for offline analysis
                this.storeValidatedAddress(result).catch(err =>
                    logger.warn('Failed to persist validated address', { error: err })
                );
            }

            metrics.timing('address_validation.duration_ms', Date.now() - start);
            return result;

        } catch (error: any) {
            metrics.increment('address_validation.errors_total');
            logger.error('Address validation failed', { error: error.message, request });
            // Fail gracefully
            return {
                isValid: false,
                isReliable: false,
                formattedAddress: `${request.addressLine1}, ${request.city}`,
                latitude: 0,
                longitude: 0,
                confidence: 0
            };
        }
    }

    private async performValidation(req: AddressValidationRequest): Promise<AddressValidationResponse> {
        const addressString = `${req.addressLine1}, ${req.city}, ${req.state}, ${req.country}`;

        // Strategy: Use Geocoding as validation mechanism
        // If we can geocode it with high confidence = valid
        const results = await this.geocodingService.geocode(addressString);

        if (results.length === 0) {
            return {
                isValid: false,
                isReliable: false,
                formattedAddress: addressString,
                latitude: 0,
                longitude: 0,
                confidence: 0,
                metadata: { provider: 'none', validationSource: 'geocoding_lookup' }
            };
        }

        const bestMatch = results[0];
        const isReliable = bestMatch.confidence > 0.7;

        return {
            isValid: true,
            isReliable,
            formattedAddress: bestMatch.formattedAddress,
            latitude: bestMatch.latitude,
            longitude: bestMatch.longitude,
            confidence: bestMatch.confidence,
            metadata: {
                provider: bestMatch.provider,
                validationSource: 'geocoding_lookup'
            }
        };
    }

    private async storeValidatedAddress(res: AddressValidationResponse): Promise<void> {
        const client = await this.pgPool.connect();
        try {
            await client.query(
                `INSERT INTO validated_addresses (formatted_address, latitude, longitude, confidence, provider, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 ON CONFLICT (formatted_address) 
                 DO UPDATE SET latitude = EXCLUDED.latitude, 
                               longitude = EXCLUDED.longitude, 
                               confidence = EXCLUDED.confidence,
                               updated_at = NOW()`,
                [res.formattedAddress, res.latitude, res.longitude, res.confidence, res.metadata?.provider || 'unknown']
            );
        } catch (error: any) {
            // If table doesn't exist, we just log warning (don't crash flow)
            if (error.code === '42P01') { // undefined_table
                logger.warn('Table validated_addresses does not exist, skipping persistence');
            } else {
                throw error;
            }
        } finally {
            client.release();
        }
    }

    private getCacheKey(req: AddressValidationRequest): string {
        const normalized = `${req.addressLine1}|${req.city}|${req.postalCode || ''}|${req.country}`.toLowerCase().replace(/\s+/g, '');
        return `address_val:${Buffer.from(normalized).toString('base64')}`;
    }

    /** 
     * Basic syntactic validation by zip code (kept from original)
     */
    isValidZipCode(zip: string, countryCode = 'CO'): boolean {
        const patterns: Record<string, RegExp> = {
            'CO': /^\d{6}$/,
            'US': /^\d{5}(-\d{4})?$/,
            'MX': /^\d{5}$/
        };
        return patterns[countryCode]?.test(zip) || false;
    }

    async clearCache(): Promise<void> {
        const keys = await this.redis.keys('address_val:*');
        if (keys.length) await this.redis.del(...keys);
    }
}
