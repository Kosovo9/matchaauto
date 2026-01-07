import { z } from 'zod';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { Pool } from 'pg';
import axios from 'axios';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

export const AddressSchema = z.object({
    street: z.string().min(1).max(200),
    streetNumber: z.string().optional(),
    unit: z.string().optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().length(2),
    countryName: z.string().optional(),
    formattedAddress: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    timezone: z.string().optional(),
    accuracy: z.number().min(0).max(1).optional(),
    validated: z.boolean().default(false),
    validationScore: z.number().min(0).max(1).optional(),
    issues: z.array(z.string()).optional(),
    suggestions: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.any()).optional()
});

export const ValidationRequestSchema = z.object({
    address: AddressSchema.omit({ validated: true, validationScore: true, issues: true, suggestions: true }),
    strict: z.boolean().default(false),
    geocode: z.boolean().default(true),
    providers: z.array(z.enum(['google', 'here', 'osm', 'smartystreets'])).optional(),
    language: z.string().default('en'),
    timeout: z.number().min(1000).max(30000).default(5000)
});

export const ValidationResultSchema = z.object({
    address: AddressSchema,
    valid: z.boolean(),
    score: z.number().min(0).max(1),
    issues: z.array(z.string()),
    suggestions: z.array(z.string()),
    corrections: z.record(z.string(), z.any()).optional(),
    provider: z.string().optional(),
    executionTimeMs: z.number(),
    cached: z.boolean().default(false)
});

export type Address = z.infer<typeof AddressSchema>;
export type ValidationRequestInput = z.input<typeof ValidationRequestSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type AddressValidationRequest = ValidationRequestInput;
export type AddressValidationResult = ValidationResult;

export type ProviderResult = Omit<ValidationResult, 'executionTimeMs' | 'cached'>;

interface ValidationProvider {
    name: string;
    priority: number;
    validate(address: Address): Promise<ProviderResult>;
    getCost(): number;
    isAvailable(): boolean;
}

export class AddressValidationService {
    private redis: Redis;
    private pgPool: Pool;
    private providers: ValidationProvider[] = [];
    private readonly CACHE_TTL = 86400; // 24 hours

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.initializeProviders();
    }

    private initializeProviders(): void {
        // 1. Google Address Validation API
        if (process.env.GOOGLE_MAPS_API_KEY) {
            this.providers.push({
                name: 'google',
                priority: 0,
                validate: async (address: Address) => {
                    const response = await axios.post(
                        `https://addressvalidation.googleapis.com/v1:validateAddress?key=${process.env.GOOGLE_MAPS_API_KEY}`,
                        {
                            address: {
                                regionCode: address.country,
                                postalCode: address.postalCode,
                                administrativeArea: address.state,
                                locality: address.city,
                                addressLines: [
                                    `${address.street} ${address.streetNumber || ''}`.trim(),
                                    address.unit || ''
                                ].filter(Boolean)
                            },
                            enableUspsCass: true
                        },
                        { timeout: 5000 }
                    );

                    const result = response.data.result;

                    return {
                        address: this.parseGoogleValidation(result),
                        valid: result.verdict?.validationGranularity === 'PREMISE',
                        score: this.calculateGoogleScore(result),
                        issues: result.verdict?.addressComplete ? [] : ['Incomplete address'],
                        suggestions: result.address?.addressComponents?.map((c: any) => c.componentName?.text) || [],
                        provider: 'google'
                    } as ProviderResult;
                },
                getCost: () => 0.005,
                isAvailable: () => true
            });
        }

        // 2. HERE Address Validation API
        if (process.env.HERE_API_KEY) {
            this.providers.push({
                name: 'here',
                priority: 1,
                validate: async (address: Address) => {
                    const response = await axios.get(
                        'https://geocode.search.hereapi.com/v1/geocode',
                        {
                            params: {
                                q: this.formatAddressForGeocoding(address),
                                apiKey: process.env.HERE_API_KEY,
                                in: `countryCode:${address.country}`,
                                limit: 1
                            },
                            timeout: 5000
                        }
                    );

                    const item = response.data.items?.[0];

                    return {
                        address: this.parseHereValidation(item, address),
                        valid: item?.scoring?.queryScore > 0.8,
                        score: item?.scoring?.queryScore || 0,
                        issues: item?.scoring?.queryScore < 0.8 ? ['Low confidence score'] : [],
                        suggestions: [],
                        provider: 'here'
                    } as ProviderResult;
                },
                getCost: () => 0.0005,
                isAvailable: () => true
            });
        }

        // 3. OpenStreetMap Nominatim (free)
        this.providers.push({
            name: 'osm',
            priority: 2,
            validate: async (address: Address) => {
                const response = await axios.get(
                    'https://nominatim.openstreetmap.org/search',
                    {
                        params: {
                            q: this.formatAddressForGeocoding(address),
                            format: 'jsonv2',
                            addressdetails: 1,
                            countrycodes: address.country,
                            limit: 1,
                            'accept-language': 'en'
                        },
                        timeout: 10000,
                        headers: {
                            'User-Agent': 'MatchaAuto/1.0'
                        }
                    }
                );

                const result = response.data?.[0];

                return {
                    address: this.parseOsmValidation(result, address),
                    valid: result?.importance > 0.5,
                    score: result?.importance || 0,
                    issues: result?.importance < 0.5 ? ['Low importance score'] : [],
                    suggestions: [],
                    provider: 'osm'
                } as ProviderResult;
            },
            getCost: () => 0,
            isAvailable: () => true
        });

        // 4. Local database validation
        this.providers.push({
            name: 'database',
            priority: 3,
            validate: async (address: Address) => {
                const res = await this.validateWithDatabase(address);
                return res as ProviderResult;
            },
            getCost: () => 0,
            isAvailable: () => true
        });

        // Sort by priority
        this.providers.sort((a, b) => a.priority - b.priority);
    }

    async validateAddress(request: ValidationRequestInput): Promise<ValidationResult> {
        const startTime = Date.now();
        metrics.increment('address_validation.requests_total');

        try {
            const validatedRequest = ValidationRequestSchema.parse(request);

            // Check cache first
            const cacheKey = this.getCacheKey(validatedRequest.address);
            const cached = await this.redis.get(cacheKey);

            if (cached) {
                const cachedResult: ValidationResult = JSON.parse(cached);
                logger.debug('Address validation cache hit', {
                    address: validatedRequest.address,
                    cacheKey: cacheKey.substring(0, 50)
                });

                metrics.increment('address_validation.cache_hits_total');
                return {
                    ...cachedResult,
                    executionTimeMs: Date.now() - startTime,
                    cached: true
                };
            }

            metrics.increment('address_validation.cache_misses_total');

            let validationResult: ValidationResult | null = null;
            let lastError: Error | null = null;

            // Try providers in order
            for (const provider of this.providers) {
                if (!provider.isAvailable()) continue;

                if (validatedRequest.providers &&
                    !validatedRequest.providers.includes(provider.name as any)) {
                    continue;
                }

                try {
                    logger.debug('Trying address validation provider', {
                        provider: provider.name,
                        address: validatedRequest.address
                    });

                    const result = await provider.validate(validatedRequest.address);
                    validationResult = {
                        ...result,
                        provider: provider.name,
                        executionTimeMs: Date.now() - startTime,
                        cached: false
                    };

                    // If strict mode and not valid, continue to next provider
                    if (validatedRequest.strict && !result.valid) {
                        logger.debug('Strict validation failed, trying next provider', {
                            provider: provider.name,
                            score: result.score
                        });
                        continue;
                    }

                    // Good enough result found
                    break;

                } catch (error: any) {
                    lastError = error;
                    logger.warn(`Address validation provider ${provider.name} failed`, {
                        error: error.message,
                        address: validatedRequest.address
                    });
                    continue;
                }
            }

            if (!validationResult) {
                throw lastError || new Error('All validation providers failed');
            }

            // Geocode if requested
            if (validatedRequest.geocode &&
                (!validationResult.address.latitude || !validationResult.address.longitude)) {
                const geocoded = await this.geocodeAddress(validationResult.address);
                if (geocoded) {
                    validationResult.address = {
                        ...validationResult.address,
                        latitude: geocoded.latitude,
                        longitude: geocoded.longitude,
                        accuracy: geocoded.accuracy
                    };
                }
            }

            // Calculate final validation score
            validationResult.score = this.calculateFinalScore(validationResult, validatedRequest.strict);
            validationResult.valid = validationResult.score >= (validatedRequest.strict ? 0.8 : 0.6);

            // Cache the result
            await this.redis.setex(
                cacheKey,
                this.CACHE_TTL,
                JSON.stringify(validationResult)
            );

            // Store in database for future reference
            await this.storeValidationResult(validationResult);

            logger.info('Address validation completed', {
                address: validatedRequest.address,
                valid: validationResult.valid,
                score: validationResult.score,
                provider: validationResult.provider,
                time: validationResult.executionTimeMs
            });

            metrics.timing('address_validation.time_ms', validationResult.executionTimeMs);
            metrics.gauge('address_validation.score', validationResult.score);

            return validationResult;

        } catch (error: any) {
            metrics.increment('address_validation.errors_total');
            logger.error('Address validation failed', {
                error: error.message,
                address: request.address
            });

            // Return minimal validation result
            return {
                address: request.address,
                valid: false,
                score: 0,
                issues: ['Validation service unavailable'],
                suggestions: ['Please check the address manually'],
                executionTimeMs: Date.now() - startTime,
                cached: false
            };
        }
    }

    async batchValidate(requests: ValidationRequest[]): Promise<ValidationResult[]> {
        const batchSize = 10;
        const results: ValidationResult[] = [];

        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchPromises = batch.map(request =>
                this.validateAddress(request).catch(error => {
                    logger.error('Batch address validation failed', {
                        address: request.address,
                        error: error.message
                    });

                    return {
                        address: request.address,
                        valid: false,
                        score: 0,
                        issues: ['Batch validation failed'],
                        suggestions: [],
                        executionTimeMs: 0,
                        cached: false,
                        error: error.message
                    } as any;
                })
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Rate limiting
            if (i + batchSize < requests.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }

    async validateAndGeocode(address: Address): Promise<ValidationResult & { coordinates?: { lat: number; lng: number } }> {
        const validation = await this.validateAddress({
            address,
            geocode: true
        });

        if (validation.address.latitude && validation.address.longitude) {
            return {
                ...validation,
                coordinates: {
                    lat: validation.address.latitude,
                    lng: validation.address.longitude
                }
            };
        }

        return validation;
    }

    async getAddressSuggestions(partialAddress: Partial<Address>, limit: number = 5): Promise<Address[]> {
        const client = await this.pgPool.connect();

        try {
            let query = `
        SELECT 
          street, street_number, unit, city, state, postal_code,
          country, country_name, formatted_address,
          latitude, longitude, timezone, accuracy,
          validation_score, usage_count
        FROM validated_addresses
        WHERE 1=1
      `;

            const params: any[] = [];
            let paramIndex = 1;

            if (partialAddress.street) {
                query += ` AND street ILIKE $${paramIndex}`;
                params.push(`${partialAddress.street}%`);
                paramIndex++;
            }

            if (partialAddress.city) {
                query += ` AND city ILIKE $${paramIndex}`;
                params.push(`${partialAddress.city}%`);
                paramIndex++;
            }

            if (partialAddress.state) {
                query += ` AND state ILIKE $${paramIndex}`;
                params.push(`${partialAddress.state}%`);
                paramIndex++;
            }

            if (partialAddress.postalCode) {
                query += ` AND postal_code LIKE $${paramIndex}`;
                params.push(`${partialAddress.postalCode}%`);
                paramIndex++;
            }

            if (partialAddress.country) {
                query += ` AND country = $${paramIndex}`;
                params.push(partialAddress.country);
                paramIndex++;
            }

            query += ` ORDER BY usage_count DESC, validation_score DESC LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await client.query(query, params);

            return result.rows.map(row => ({
                street: row.street,
                streetNumber: row.street_number,
                unit: row.unit,
                city: row.city,
                state: row.state,
                postalCode: row.postal_code,
                country: row.country,
                countryName: row.country_name,
                formattedAddress: row.formatted_address,
                latitude: row.latitude,
                longitude: row.longitude,
                timezone: row.timezone,
                accuracy: row.accuracy,
                validated: true,
                validationScore: row.validation_score,
                metadata: { usageCount: row.usage_count }
            }));

        } finally {
            client.release();
        }
    }

    async getValidationStats(): Promise<{
        total: number;
        byCountry: Record<string, number>;
        avgScore: number;
        successRate: number;
        topCities: Array<{ city: string; count: number; avgScore: number }>;
    }> {
        const client = await this.pgPool.connect();

        try {
            const [overallStats, countryStats, cityStats] = await Promise.all([
                client.query(`
          SELECT 
            COUNT(*) as total,
            AVG(validation_score) as avg_score,
            SUM(CASE WHEN validation_score >= 0.8 THEN 1 ELSE 0 END) as high_confidence,
            SUM(CASE WHEN validation_score < 0.5 THEN 1 ELSE 0 END) as low_confidence
          FROM validated_addresses
          WHERE created_at > NOW() - INTERVAL '30 days'
        `),

                client.query(`
          SELECT 
            country,
            COUNT(*) as count,
            AVG(validation_score) as avg_score
          FROM validated_addresses
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY country
          ORDER BY count DESC
          LIMIT 20
        `),

                client.query(`
          SELECT 
            city,
            country,
            COUNT(*) as count,
            AVG(validation_score) as avg_score
          FROM validated_addresses
          WHERE created_at > NOW() - INTERVAL '30 days'
          GROUP BY city, country
          ORDER BY count DESC
          LIMIT 20
        `)
            ]);

            const total = parseInt(overallStats.rows[0]?.total || '0');
            const highConfidence = parseInt(overallStats.rows[0]?.high_confidence || '0');

            const byCountry: Record<string, number> = {};
            countryStats.rows.forEach(row => {
                byCountry[row.country] = parseInt(row.count);
            });

            return {
                total,
                byCountry,
                avgScore: parseFloat(overallStats.rows[0]?.avg_score || '0'),
                successRate: total > 0 ? (highConfidence / total) * 100 : 0,
                topCities: cityStats.rows.map(row => ({
                    city: row.city,
                    country: row.country,
                    count: parseInt(row.count),
                    avgScore: parseFloat(row.avg_score)
                }))
            };

        } finally {
            client.release();
        }
    }

    async clearCache(): Promise<number> {
        try {
            const keys = await this.redis.keys('address_validation:*');
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
            return keys.length;
        } catch (error) {
            logger.error('Failed to clear address validation cache', { error });
            return 0;
        }
    }

    private getCacheKey(address: Address): string {
        const keyData = {
            street: address.street.toLowerCase(),
            streetNumber: address.streetNumber?.toLowerCase(),
            city: address.city.toLowerCase(),
            state: address.state.toLowerCase(),
            postalCode: address.postalCode.toLowerCase(),
            country: address.country.toLowerCase()
        };

        return `address_validation:${Buffer.from(JSON.stringify(keyData)).toString('base64').substring(0, 50)}`;
    }

    private formatAddressForGeocoding(address: Address): string {
        const parts = [
            address.street,
            address.streetNumber,
            address.unit,
            address.city,
            address.state,
            address.postalCode,
            address.countryName || address.country
        ].filter(Boolean);

        return parts.join(', ');
    }

    private parseGoogleValidation(result: any): Address {
        const addressComponents = result.address?.addressComponents || [];

        const components: Record<string, string> = {};
        addressComponents.forEach((component: any) => {
            const type = component.componentTypes?.[0]?.toLowerCase();
            if (type) {
                components[type] = component.componentName?.text || '';
            }
        });

        const location = result.geocode?.location || {};

        return {
            street: components['route'] || components['street_address'] || '',
            streetNumber: components['street_number'] || '',
            unit: components['subpremise'] || '',
            city: components['locality'] || components['postal_town'] || '',
            state: components['administrative_area_level_1'] || '',
            postalCode: components['postal_code'] || '',
            country: components['country']?.toUpperCase() || '',
            countryName: components['country'],
            formattedAddress: result.address?.formattedAddress || '',
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: result.geocode?.plusCode ? 0.9 : 0.5,
            validated: true,
            validationScore: this.calculateGoogleScore(result)
        };
    }

    private parseHereValidation(item: any, original: Address): Address {
        if (!item) return original;

        const address = item.address;
        const position = item.position;

        return {
            ...original,
            street: address.street || original.street,
            streetNumber: address.houseNumber || original.streetNumber,
            city: address.city || original.city,
            state: address.state || original.state,
            postalCode: address.postalCode || original.postalCode,
            country: address.countryCode || original.country,
            countryName: address.countryName,
            formattedAddress: address.label,
            latitude: position.lat,
            longitude: position.lng,
            accuracy: item.scoring?.queryScore || 0.5,
            validated: true,
            validationScore: item.scoring?.queryScore || 0
        };
    }

    private parseOsmValidation(result: any, original: Address): Address {
        if (!result) return original;

        const address = result.address;

        return {
            ...original,
            street: address.road || original.street,
            streetNumber: address.house_number || original.streetNumber,
            city: address.city || address.town || address.village || original.city,
            state: address.state || original.state,
            postalCode: address.postcode || original.postalCode,
            country: address.country_code?.toUpperCase() || original.country,
            countryName: address.country,
            formattedAddress: result.display_name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            accuracy: result.importance || 0.3,
            validated: true,
            validationScore: result.importance || 0
        };
    }

    private async validateWithDatabase(address: Address): Promise<ProviderResult> {
        const client = await this.pgPool.connect();

        try {
            // Check if similar address exists in database
            const result = await client.query(`
        SELECT 
          street, street_number, unit, city, state, postal_code,
          country, country_name, formatted_address,
          latitude, longitude, timezone, accuracy,
          validation_score, usage_count
        FROM validated_addresses
        WHERE postal_code = $1
          AND country = $2
          AND city ILIKE $3
        ORDER BY validation_score DESC
        LIMIT 1
      `, [address.postalCode, address.country, `%${address.city}%`]);

            if (result.rows.length === 0) {
                return {
                    address,
                    valid: false,
                    score: 0,
                    issues: ['Address not found in database'],
                    suggestions: [],
                    provider: 'database'
                };
            }

            const dbAddress = result.rows[0];

            // Calculate similarity score
            const similarity = this.calculateAddressSimilarity(address, {
                street: dbAddress.street,
                city: dbAddress.city,
                state: dbAddress.state,
                postalCode: dbAddress.postal_code,
                country: dbAddress.country
            });

            const validatedAddress: Address = {
                ...address,
                street: dbAddress.street,
                streetNumber: dbAddress.street_number,
                unit: dbAddress.unit,
                city: dbAddress.city,
                state: dbAddress.state,
                postalCode: dbAddress.postal_code,
                country: dbAddress.country,
                countryName: dbAddress.country_name,
                formattedAddress: dbAddress.formatted_address,
                latitude: dbAddress.latitude,
                longitude: dbAddress.longitude,
                timezone: dbAddress.timezone,
                accuracy: dbAddress.accuracy,
                validated: true,
                validationScore: dbAddress.validation_score
            };

            return {
                address: validatedAddress,
                valid: similarity >= 0.7,
                score: similarity,
                issues: similarity < 0.7 ? ['Low similarity with known addresses'] : [],
                suggestions: [],
                provider: 'database'
            };

        } finally {
            client.release();
        }
    }

    private async geocodeAddress(address: Address): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
        // Use a geocoding service to get coordinates
        try {
            const response = await axios.get(
                'https://nominatim.openstreetmap.org/search',
                {
                    params: {
                        q: this.formatAddressForGeocoding(address),
                        format: 'jsonv2',
                        limit: 1,
                        countrycodes: address.country
                    },
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'MatchaAuto/1.0'
                    }
                }
            );

            const result = response.data?.[0];
            if (result) {
                return {
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    accuracy: result.importance || 0.5
                };
            }
        } catch (error) {
            logger.warn('Geocoding failed for address validation', {
                address,
                error: error.message
            });
        }

        return null;
    }

    private calculateAddressSimilarity(addr1: Partial<Address>, addr2: Partial<Address>): number {
        let score = 0;
        let totalWeights = 0;

        const fields = [
            { key: 'postalCode', weight: 0.4 },
            { key: 'street', weight: 0.3 },
            { key: 'city', weight: 0.2 },
            { key: 'state', weight: 0.1 }
        ];

        for (const field of fields) {
            const val1 = addr1[field.key as keyof Address]?.toString().toLowerCase() || '';
            const val2 = addr2[field.key as keyof Address]?.toString().toLowerCase() || '';

            if (val1 && val2) {
                // Simple string similarity (Levenshtein distance would be better)
                const similarity = val1 === val2 ? 1 : 0.3;
                score += similarity * field.weight;
            }

            totalWeights += field.weight;
        }

        return totalWeights > 0 ? score / totalWeights : 0;
    }

    private calculateGoogleScore(result: any): number {
        if (!result.verdict) return 0;

        let score = 0;

        // Validation granularity
        const granularity = result.verdict.validationGranularity;
        if (granularity === 'PREMISE') score += 0.4;
        else if (granularity === 'SUB_PREMISE') score += 0.3;
        else if (granularity === 'ROUTE') score += 0.2;
        else score += 0.1;

        // Address completeness
        if (result.verdict.addressComplete) score += 0.3;

        // Geocode granularity
        const geocodeGranularity = result.geocode?.granularity;
        if (geocodeGranularity === 'PREMISE') score += 0.3;
        else if (geocodeGranularity === 'ROOFTOP') score += 0.2;
        else score += 0.1;

        return Math.min(1, score);
    }

    private calculateFinalScore(result: ValidationResult, strict: boolean): number {
        let score = result.score || 0;

        // Adjust based on issues
        if (result.issues && result.issues.length > 0) {
            const issuePenalty = result.issues.length * 0.1;
            score -= issuePenalty;
        }

        // Adjust based on geocoding accuracy
        if (result.address.accuracy) {
            score += result.address.accuracy * 0.2;
        }

        // Normalize
        return Math.max(0, Math.min(1, score));
    }

    private async storeValidationResult(result: ValidationResult): Promise<void> {
        const client = await this.pgPool.connect();

        try {
            await client.query(`
        INSERT INTO validated_addresses (
          id, street, street_number, unit, city, state, postal_code,
          country, country_name, formatted_address,
          latitude, longitude, timezone, accuracy,
          validation_score, provider, raw_response, usage_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 1
        ) ON CONFLICT (street, city, postal_code, country) 
        DO UPDATE SET
          validation_score = GREATEST(validated_addresses.validation_score, EXCLUDED.validation_score),
          usage_count = validated_addresses.usage_count + 1,
          updated_at = NOW()
      `, [
                randomUUID(),
                result.address.street,
                result.address.streetNumber,
                result.address.unit,
                result.address.city,
                result.address.state,
                result.address.postalCode,
                result.address.country,
                result.address.countryName,
                result.address.formattedAddress,
                result.address.latitude,
                result.address.longitude,
                result.address.timezone,
                result.address.accuracy,
                result.score,
                result.provider,
                JSON.stringify(result)
            ]);

        } catch (error) {
            logger.warn('Failed to store validation result', { error });
        } finally {
            client.release();
        }
    }

    async validateBatch(addresses: Address[], options?: any): Promise<ValidationResult[]> {
        const results = await Promise.all(addresses.map(async (addr) => {
            try {
                return await this.validateAddress(addr, options);
            } catch (e) {
                return {
                    address: addr,
                    valid: false,
                    score: 0,
                    issues: ['Validation failed'],
                    suggestions: [],
                    executionTimeMs: 0,
                    cached: false
                };
            }
        }));
        return results;
    }

    async standardizeAddress(address: Address): Promise<Address> {
        return {
            ...address,
            street: address.street.trim().toUpperCase(),
            city: address.city.trim().toUpperCase(),
            state: address.state.trim().toUpperCase(),
            country: address.country.trim().toUpperCase(),
            formattedAddress: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`.toUpperCase()
        };
    }

    async autocompleteAddress(query: string, options?: any): Promise<string[]> {
        if (!process.env.GOOGLE_MAPS_API_KEY) return [];
        try {
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=address&key=${process.env.GOOGLE_MAPS_API_KEY}`;
            const res = await axios.get(url);
            return res.data.predictions?.map((p: any) => p.description) || [];
        } catch (e) {
            logger.error('Autocomplete failed', e);
            return [];
        }
    }

    async validatePostalCode(postalCode: string, country: string): Promise<boolean> {
        if (country === 'US') return /^\d{5}(-\d{4})?$/.test(postalCode);
        if (country === 'MX') return /^\d{5}$/.test(postalCode);
        return postalCode.length >= 3;
    }

    async getCountryFormats(country: string): Promise<any> {
        const formats: Record<string, any> = {
            'US': { postalCode: '#####', state: 'Required', format: 'Street, City, State Zip' },
            'MX': { postalCode: '#####', state: 'Required', format: 'Street, Colony, City, State, Zip' }
        };
        return formats[country] || { format: 'Generic' };
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.pgPool.query('SELECT 1');
            return true;
        } catch (e) {
            return false;
        }
    }
}
