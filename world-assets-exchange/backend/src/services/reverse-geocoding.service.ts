import { z } from 'zod';
import axios, { AxiosInstance } from 'axios';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { GeocodeResultSchema } from './geocoding.service';

export const ReverseGeocodeRequestSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    language: z.string().default('es'),
    resultType: z.array(z.enum([
        'street_address', 'route', 'intersection', 'political', 'country',
        'administrative_area_level_1', 'administrative_area_level_2',
        'administrative_area_level_3', 'administrative_area_level_4',
        'administrative_area_level_5', 'colloquial_area', 'locality',
        'sublocality', 'neighborhood', 'premise', 'subpremise',
        'postal_code', 'natural_feature', 'airport', 'park', 'point_of_interest'
    ])).optional(),
    locationType: z.array(z.enum([
        'ROOFTOP', 'RANGE_INTERPOLATED', 'GEOMETRIC_CENTER', 'APPROXIMATE'
    ])).optional(),
    radius: z.number().min(1).max(50000).default(100),
    maxResults: z.number().min(1).max(50).default(5)
});

export const ReverseGeocodeResponseSchema = z.object({
    results: z.array(GeocodeResultSchema),
    status: z.enum(['OK', 'ZERO_RESULTS', 'OVER_QUERY_LIMIT', 'REQUEST_DENIED', 'INVALID_REQUEST', 'UNKNOWN_ERROR']),
    errorMessage: z.string().optional(),
    provider: z.string(),
    cached: z.boolean().default(false),
    timestamp: z.date().default(() => new Date())
});

export type ReverseGeocodeRequest = z.infer<typeof ReverseGeocodeRequestSchema>;
export type ReverseGeocodeResponse = z.infer<typeof ReverseGeocodeResponseSchema>;

interface ReverseGeocodeProvider {
    name: string;
    priority: number;
    reverseGeocode(lat: number, lon: number, options?: any): Promise<ReverseGeocodeResponse>;
    getCoverage(): string[];
}

export class ReverseGeocodingService {
    private providers: ReverseGeocodeProvider[] = [];
    private redis: Redis;
    private pgPool: Pool;
    private httpClient: AxiosInstance;
    private cacheTTL = 604800; // 7 days for reverse geocoding (more stable)

    constructor(redis: Redis, pgPool: Pool) {
        this.redis = redis;
        this.pgPool = pgPool;

        this.httpClient = axios.create({
            timeout: 15000,
            maxRedirects: 3,
            headers: {
                'User-Agent': 'MatchaAuto-Geocoding/2.0',
                'Accept': 'application/json',
                'Accept-Language': 'es,en;q=0.9'
            }
        });

        this.initializeProviders();
    }

    private initializeProviders(): void {
        // 1. Google Maps Geocoding API (Highest quality)
        if (process.env.GOOGLE_MAPS_API_KEY) {
            this.providers.push({
                name: 'google',
                priority: 0,
                reverseGeocode: async (lat: number, lon: number, options?: any) => {
                    try {
                        const params: any = {
                            latlng: `${lat},${lon}`,
                            key: process.env.GOOGLE_MAPS_API_KEY,
                            language: options?.language || 'es',
                            location_type: (options?.locationType || ['ROOFTOP', 'RANGE_INTERPOLATED']).join('|'),
                            result_type: (options?.resultType || ['street_address', 'route']).join('|')
                        };

                        const response = await this.httpClient.get(
                            'https://maps.googleapis.com/maps/api/geocode/json',
                            { params }
                        );

                        const data = response.data;

                        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                            throw new Error(`Google Reverse Geocoding failed: ${data.status}`);
                        }

                        const results = data.results?.map((result: any) => this.parseGoogleResult(result, lat, lon)) || [];

                        return {
                            results: results.slice(0, options?.maxResults || 5),
                            status: data.status === 'OK' ? 'OK' : 'ZERO_RESULTS',
                            provider: 'google',
                            cached: false
                        };
                    } catch (error: any) {
                        logger.error('Google reverse geocoding failed:', {
                            lat, lon, error: error.message
                        });
                        throw error;
                    }
                },
                getCoverage: () => ['global']
            });
        }

        // 2. Mapbox Geocoding API
        if (process.env.MAPBOX_ACCESS_TOKEN) {
            this.providers.push({
                name: 'mapbox',
                priority: 1,
                reverseGeocode: async (lat: number, lon: number, options?: any) => {
                    try {
                        const response = await this.httpClient.get(
                            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json`,
                            {
                                params: {
                                    access_token: process.env.MAPBOX_ACCESS_TOKEN,
                                    language: options?.language || 'es',
                                    types: (options?.resultType || ['address', 'poi']).join(','),
                                    limit: options?.maxResults || 5,
                                    country: options?.countryCode || 'all'
                                }
                            }
                        );

                        const data = response.data;

                        const results = data.features?.map((feature: any) =>
                            this.parseMapboxResult(feature, lat, lon)
                        ) || [];

                        return {
                            results: results.slice(0, options?.maxResults || 5),
                            status: results.length > 0 ? 'OK' : 'ZERO_RESULTS',
                            provider: 'mapbox',
                            cached: false
                        };
                    } catch (error: any) {
                        logger.error('Mapbox reverse geocoding failed:', {
                            lat, lon, error: error.message
                        });
                        throw error;
                    }
                },
                getCoverage: () => ['global', 'premium_quality']
            });
        }

        // 3. OpenStreetMap Nominatim
        this.providers.push({
            name: 'nominatim',
            priority: 2,
            reverseGeocode: async (lat: number, lon: number, options?: any) => {
                try {
                    // Respect Nominatim usage policy (1 request per second, no bulk)
                    await new Promise(resolve => setTimeout(resolve, 1100));

                    const response = await this.httpClient.get(
                        'https://nominatim.openstreetmap.org/reverse',
                        {
                            params: {
                                lat: lat.toString(),
                                lon: lon.toString(),
                                format: 'jsonv2',
                                'accept-language': options?.language || 'es',
                                addressdetails: 1,
                                zoom: this.calculateZoomFromRadius(options?.radius || 100),
                                namedetails: 1,
                                polygon_text: 0
                            },
                            headers: {
                                'Referer': 'https://matchaauto.com',
                                'User-Agent': 'MatchaAuto/2.0 (contact@matchaauto.com)'
                            }
                        }
                    );

                    const data = response.data;

                    const result = this.parseNominatimResult(data, lat, lon);

                    return {
                        results: [result],
                        status: data.error ? 'ZERO_RESULTS' : 'OK',
                        provider: 'nominatim',
                        cached: false
                    };
                } catch (error: any) {
                    logger.error('Nominatim reverse geocoding failed:', {
                        lat, lon, error: error.message
                    });
                    throw error;
                }
            },
            getCoverage: () => ['global', 'free']
        });

        // 4. Local Database Cache
        this.providers.push({
            name: 'database',
            priority: 3,
            reverseGeocode: async (lat: number, lon: number, options?: any) => {
                return this.reverseGeocodeFromDatabase(lat, lon, options);
            },
            getCoverage: () => ['cached_locations']
        });

        // Sort by priority
        this.providers.sort((a, b) => a.priority - b.priority);
    }

    private calculateZoomFromRadius(radius: number): number {
        // Convert radius in meters to zoom level (0-18)
        if (radius <= 50) return 18;   // Building level
        if (radius <= 200) return 17;  // Street level
        if (radius <= 1000) return 16; // Neighborhood
        if (radius <= 5000) return 15; // City district
        if (radius <= 20000) return 14; // City
        if (radius <= 50000) return 13; // Region
        return 12; // Country level
    }

    private parseGoogleResult(result: any, lat: number, lon: number) {
        const addressComponents: any = {};

        result.address_components?.forEach((component: any) => {
            const types = component.types;
            if (types.includes('street_number')) {
                addressComponents.houseNumber = component.long_name;
            } else if (types.includes('route')) {
                addressComponents.street = component.long_name;
            } else if (types.includes('locality')) {
                addressComponents.city = component.long_name;
            } else if (types.includes('administrative_area_level_2')) {
                addressComponents.county = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                addressComponents.state = component.long_name;
            } else if (types.includes('country')) {
                addressComponents.country = component.long_name;
                addressComponents.countryCode = component.short_name;
            } else if (types.includes('postal_code')) {
                addressComponents.postalCode = component.long_name;
            } else if (types.includes('sublocality')) {
                addressComponents.district = component.long_name;
            }
        });

        // Calculate confidence based on location type
        let confidence = 0.5;
        switch (result.geometry.location_type) {
            case 'ROOFTOP':
                confidence = 0.95;
                break;
            case 'RANGE_INTERPOLATED':
                confidence = 0.85;
                break;
            case 'GEOMETRIC_CENTER':
                confidence = 0.75;
                break;
            case 'APPROXIMATE':
                confidence = 0.6;
                break;
        }

        return {
            formattedAddress: result.formatted_address,
            latitude: lat,
            longitude: lon,
            ...addressComponents,
            confidence,
            locationType: result.geometry.location_type,
            provider: 'google',
            cached: false,
            timestamp: new Date()
        };
    }

    private parseMapboxResult(feature: any, lat: number, lon: number) {
        const context = feature.context || [];
        const addressComponents: any = {};

        context.forEach((ctx: any) => {
            const id = ctx.id.split('.')[0];
            switch (id) {
                case 'country':
                    addressComponents.country = ctx.text;
                    addressComponents.countryCode = ctx.short_code?.toUpperCase();
                    break;
                case 'region':
                    addressComponents.state = ctx.text;
                    break;
                case 'district':
                case 'county':
                    addressComponents.county = ctx.text;
                    break;
                case 'place':
                case 'locality':
                    addressComponents.city = ctx.text;
                    break;
                case 'postcode':
                    addressComponents.postalCode = ctx.text;
                    break;
                case 'neighborhood':
                    addressComponents.district = ctx.text;
                    break;
            }
        });

        // Extract street address if available
        if (feature.properties.address) {
            addressComponents.houseNumber = feature.properties.address;
        }
        if (feature.text) {
            addressComponents.street = feature.text;
        }

        // Calculate confidence based on feature relevance
        const confidence = Math.min(0.9, feature.relevance || 0.7);

        return {
            formattedAddress: feature.place_name,
            latitude: lat,
            longitude: lon,
            ...addressComponents,
            confidence,
            locationType: this.mapMapboxTypeToLocationType(feature.place_type?.[0]),
            provider: 'mapbox',
            cached: false,
            timestamp: new Date()
        };
    }

    private parseNominatimResult(data: any, lat: number, lon: number) {
        const address = data.address || {};

        return {
            formattedAddress: data.display_name,
            latitude: lat,
            longitude: lon,
            country: address.country,
            countryCode: address.country_code?.toUpperCase(),
            state: address.state,
            county: address.county,
            city: address.city || address.town || address.village || address.hamlet,
            district: address.suburb || address.neighbourhood,
            street: address.road,
            houseNumber: address.house_number,
            postalCode: address.postcode,
            confidence: data.importance ? Math.min(0.9, data.importance * 2) : 0.7,
            locationType: this.mapNominatimTypeToLocationType(data.type || data.category),
            provider: 'nominatim',
            cached: false,
            timestamp: new Date()
        };
    }

    private mapMapboxTypeToLocationType(type: string) {
        const mapping: Record<string, any> = {
            'address': 'ROOFTOP',
            'poi': 'GEOMETRIC_CENTER',
            'neighborhood': 'GEOMETRIC_CENTER',
            'locality': 'GEOMETRIC_CENTER',
            'place': 'GEOMETRIC_CENTER',
            'district': 'GEOMETRIC_CENTER',
            'region': 'APPROXIMATE',
            'country': 'APPROXIMATE'
        };
        return mapping[type] || 'APPROXIMATE';
    }

    private mapNominatimTypeToLocationType(type: string) {
        if (typeof type !== 'string') return 'APPROXIMATE';

        if (type.includes('house') || type.includes('building')) {
            return 'ROOFTOP';
        } else if (type.includes('street') || type.includes('road')) {
            return 'RANGE_INTERPOLATED';
        } else if (type.includes('place') || type.includes('locality')) {
            return 'GEOMETRIC_CENTER';
        }
        return 'APPROXIMATE';
    }

    private async reverseGeocodeFromDatabase(
        lat: number,
        lon: number,
        options?: any
    ): Promise<ReverseGeocodeResponse> {
        const client = await this.pgPool.connect();

        try {
            const query = `
        WITH nearby_addresses AS (
          SELECT 
            a.*,
            ST_Distance(
              ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
              ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
            ) as distance_meters,
            CASE 
              WHEN ST_Distance(
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
              ) < 50 THEN confidence * 1.2
              WHEN ST_Distance(
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
              ) < 500 THEN confidence * 1.1
              ELSE confidence
            END as adjusted_confidence
          FROM reverse_geocode_cache a
          WHERE ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
            $3
          )
        )
        SELECT 
          full_address as formatted_address,
          latitude,
          longitude,
          country,
          country_code,
          state,
          county,
          city,
          district,
          street,
          house_number,
          postal_code,
          adjusted_confidence as confidence,
          location_type,
          provider,
          updated_at,
          distance_meters
        FROM nearby_addresses
        WHERE adjusted_confidence >= 0.6
        ORDER BY distance_meters ASC, adjusted_confidence DESC
        LIMIT $4;
      `;

            const result = await client.query(query, [
                lat,
                lon,
                options?.radius || 100,
                options?.maxResults || 5
            ]);

            const results = result.rows.map(row => ({
                formattedAddress: row.formatted_address,
                latitude: parseFloat(row.latitude),
                longitude: parseFloat(row.longitude),
                country: row.country,
                countryCode: row.country_code,
                state: row.state,
                county: row.county,
                city: row.city,
                district: row.district,
                street: row.street,
                houseNumber: row.house_number,
                postalCode: row.postal_code,
                confidence: parseFloat(row.confidence),
                locationType: row.location_type,
                provider: row.provider,
                cached: true,
                timestamp: new Date(row.updated_at)
            }));

            return {
                results,
                status: results.length > 0 ? 'OK' : 'ZERO_RESULTS',
                provider: 'database',
                cached: true
            };
        } catch (error: any) {
            logger.error('Database reverse geocoding failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    private async cacheReverseGeocodeResult(
        lat: number,
        lon: number,
        results: ReverseGeocodeResponse['results']
    ): Promise<void> {
        if (!results.length) return;

        const client = await this.pgPool.connect();

        try {
            for (const result of results) {
                if (result.confidence >= 0.7) { // Only cache high confidence results
                    const query = `
            INSERT INTO reverse_geocode_cache (
              latitude, longitude, full_address, country, country_code,
              state, county, city, district, street, house_number,
              postal_code, confidence, location_type, provider, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
            ON CONFLICT (latitude, longitude, full_address) 
            DO UPDATE SET
              confidence = GREATEST(reverse_geocode_cache.confidence, EXCLUDED.confidence),
              updated_at = NOW()
            WHERE reverse_geocode_cache.confidence < EXCLUDED.confidence;
          `;

                    await client.query(query, [
                        result.latitude,
                        result.longitude,
                        result.formattedAddress,
                        result.country,
                        result.countryCode,
                        result.state,
                        result.country,
                        result.city,
                        result.district,
                        result.street,
                        result.houseNumber,
                        result.postalCode,
                        result.confidence,
                        result.locationType,
                        result.provider
                    ]);
                }
            }
        } catch (error: any) {
            logger.error('Failed to cache reverse geocode result:', error);
        } finally {
            client.release();
        }
    }

    private getCacheKey(lat: number, lon: number, options?: any): string {
        const optionsHash = options ?
            Buffer.from(JSON.stringify(options)).toString('base64').substring(0, 20) :
            'default';
        return `reverse_geocode:${lat.toFixed(6)}:${lon.toFixed(6)}:${optionsHash}`;
    }

    private async getFromCache<T>(key: string): Promise<T | null> {
        try {
            const cached = await this.redis.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            logger.warn('Redis cache read failed for reverse geocode:', error);
            return null;
        }
    }

    private async setInCache(key: string, data: any, ttl: number = this.cacheTTL): Promise<void> {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(data));
        } catch (error) {
            logger.warn('Redis cache write failed for reverse geocode:', error);
        }
    }

    async reverseGeocode(request: ReverseGeocodeRequest): Promise<ReverseGeocodeResponse> {
        // Validate request
        const validatedRequest = ReverseGeocodeRequestSchema.parse(request);

        // Generate cache key
        const cacheKey = this.getCacheKey(
            validatedRequest.latitude,
            validatedRequest.longitude,
            {
                language: validatedRequest.language,
                radius: validatedRequest.radius
            }
        );

        // Try cache first
        const cached = await this.getFromCache<ReverseGeocodeResponse>(cacheKey);
        if (cached) {
            logger.debug('Cache hit for reverse geocode:', {
                lat: validatedRequest.latitude,
                lon: validatedRequest.longitude
            });
            return { ...cached, cached: true };
        }

        // Try providers in order
        let lastError: Error | null = null;
        let lastResponse: ReverseGeocodeResponse | null = null;

        for (const provider of this.providers) {
            try {
                logger.debug('Trying reverse geocode provider:', {
                    provider: provider.name,
                    lat: validatedRequest.latitude,
                    lon: validatedRequest.longitude
                });

                const response = await provider.reverseGeocode(
                    validatedRequest.latitude,
                    validatedRequest.longitude,
                    {
                        language: validatedRequest.language,
                        resultType: validatedRequest.resultType,
                        locationType: validatedRequest.locationType,
                        radius: validatedRequest.radius,
                        maxResults: validatedRequest.maxResults
                    }
                );

                if (response.status === 'OK' && response.results.length > 0) {
                    // Cache successful response
                    await this.setInCache(cacheKey, response);

                    // Store in database cache
                    await this.cacheReverseGeocodeResult(
                        validatedRequest.latitude,
                        validatedRequest.longitude,
                        response.results
                    );

                    logger.info('Reverse geocode successful:', {
                        provider: provider.name,
                        lat: validatedRequest.latitude,
                        lon: validatedRequest.longitude,
                        results: response.results.length
                    });

                    return response;
                }

                lastResponse = response;

            } catch (error: any) {
                lastError = error;
                logger.warn(`Reverse geocode provider ${provider.name} failed:`, {
                    error: error.message,
                    lat: validatedRequest.latitude,
                    lon: validatedRequest.longitude
                });
                continue;
            }
        }

        // If we have a response but no results, return it
        if (lastResponse) {
            return lastResponse;
        }

        // All providers failed
        throw lastError || new Error('All reverse geocoding providers failed');
    }

    async batchReverseGeocode(
        coordinates: Array<{ latitude: number, longitude: number }>,
        options?: Partial<ReverseGeocodeRequest>
    ): Promise<ReverseGeocodeResponse[]> {
        const batchSize = 5; // To respect rate limits
        const results: ReverseGeocodeResponse[] = [];

        for (let i = 0; i < coordinates.length; i += batchSize) {
            const batch = coordinates.slice(i, i + batchSize);
            const batchPromises = batch.map(coord =>
                this.reverseGeocode({
                    latitude: coord.latitude,
                    longitude: coord.longitude,
                    language: options?.language || 'es',
                    radius: options?.radius || 100,
                    maxResults: options?.maxResults || 5
                }).catch(error => {
                    logger.error('Batch reverse geocode failed for coordinate:', {
                        lat: coord.latitude,
                        lon: coord.longitude,
                        error: error.message
                    });

                    return {
                        results: [],
                        status: 'UNKNOWN_ERROR' as const,
                        errorMessage: error.message,
                        provider: 'unknown',
                        cached: false,
                        timestamp: new Date()
                    };
                })
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Respect rate limits (especially for Nominatim)
            if (i + batchSize < coordinates.length) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return results;
    }

    async getAddressFromCoordinates(
        lat: number,
        lon: number,
        level: 'street' | 'city' | 'region' | 'country' = 'street'
    ): Promise<string | null> {
        try {
            const response = await this.reverseGeocode({
                latitude: lat,
                longitude: lon,
                language: 'es',
                maxResults: 1
            });

            if (response.results.length === 0) {
                return null;
            }

            const result = response.results[0];

            switch (level) {
                case 'street':
                    return [
                        result.houseNumber,
                        result.street,
                        result.district
                    ].filter(Boolean).join(', ') || result.formattedAddress;

                case 'city':
                    return [
                        result.city,
                        result.state,
                        result.country
                    ].filter(Boolean).join(', ') || result.formattedAddress;

                case 'region':
                    return [
                        result.state,
                        result.country
                    ].filter(Boolean).join(', ');

                case 'country':
                    return result.country || result.countryCode || 'Unknown';

                default:
                    return result.formattedAddress;
            }
        } catch (error) {
            logger.error('Failed to get address from coordinates:', {
                lat, lon, level, error
            });
            return null;
        }
    }

    async calculateAddressDensity(
        bounds: {
            minLat: number;
            minLon: number;
            maxLat: number;
            maxLon: number;
        },
        gridSize: number = 10
    ): Promise<Array<{
        cellIndex: number;
        centerLat: number;
        centerLon: number;
        addressCount: number;
        avgConfidence: number;
        dominantType: string;
    }>> {
        const client = await this.pgPool.connect();

        try {
            const query = `
        WITH bounds AS (
          SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) as geom
        ),
        grid AS (
          SELECT 
            (ST_SquareGrid($5, bounds.geom)).*,
            bounds.geom as bounds_geom
          FROM bounds
        ),
        cell_stats AS (
          SELECT 
            g.i,
            g.j,
            COUNT(rc.id) as address_count,
            AVG(rc.confidence) as avg_confidence,
            MODE() WITHIN GROUP (ORDER BY rc.location_type) as dominant_type,
            ST_Centroid(g.geom) as center
          FROM grid g
          LEFT JOIN reverse_geocode_cache rc ON ST_Within(
            ST_SetSRID(ST_MakePoint(rc.longitude, rc.latitude), 4326),
            g.geom
          )
          WHERE ST_Within(g.geom, g.bounds_geom)
          GROUP BY g.i, g.j, g.geom
        )
        SELECT 
          (i * 1000 + j) as cell_index,
          ST_Y(center) as center_lat,
          ST_X(center) as center_lon,
          address_count,
          COALESCE(avg_confidence, 0) as avg_confidence,
          COALESCE(dominant_type, 'unknown') as dominant_type
        FROM cell_stats
        ORDER BY address_count DESC;
      `;

            const result = await client.query(query, [
                bounds.minLon,
                bounds.minLat,
                bounds.maxLon,
                bounds.maxLat,
                gridSize
            ]);

            return result.rows;
        } catch (error: any) {
            logger.error('Failed to calculate address density:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getCoverageStats(): Promise<{
        totalCached: number;
        byProvider: Array<{ provider: string; count: number; avgConfidence: number }>;
        byCountry: Array<{ country: string; count: number }>;
        lastUpdate: Date;
    }> {
        const client = await this.pgPool.connect();

        try {
            const [totalStats, providerStats, countryStats] = await Promise.all([
                client.query(`
          SELECT 
            COUNT(*) as total,
            AVG(confidence) as avg_confidence,
            MAX(updated_at) as last_updated
          FROM reverse_geocode_cache
        `),
                client.query(`
          SELECT 
            provider,
            COUNT(*) as count,
            AVG(confidence) as avg_confidence
          FROM reverse_geocode_cache
          GROUP BY provider
          ORDER BY count DESC
        `),
                client.query(`
          SELECT 
            country,
            COUNT(*) as count
          FROM reverse_geocode_cache
          WHERE country IS NOT NULL
          GROUP BY country
          ORDER BY count DESC
          LIMIT 20
        `)
            ]);

            return {
                totalCached: parseInt(totalStats.rows[0]?.total || '0'),
                byProvider: providerStats.rows,
                byCountry: countryStats.rows,
                lastUpdate: totalStats.rows[0]?.last_updated || new Date()
            };
        } catch (error: any) {
            logger.error('Failed to get coverage stats:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async clearCache(olderThanDays: number = 90): Promise<{ deletedCount: number }> {
        const client = await this.pgPool.connect();

        try {
            const result = await client.query(
                `DELETE FROM reverse_geocode_cache 
         WHERE updated_at < NOW() - $1 * INTERVAL '1 day' 
         RETURNING COUNT(*) as deleted_count`,
                [olderThanDays]
            );

            const deletedCount = parseInt(result.rows[0]?.deleted_count || '0');

            logger.info(`Cleared ${deletedCount} reverse geocode cache entries older than ${olderThanDays} days`);

            // Also clear Redis cache for consistency
            try {
                const keys = await this.redis.keys('reverse_geocode:*');
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
            } catch (redisError) {
                logger.warn('Failed to clear Redis cache:', redisError);
            }

            return { deletedCount };
        } catch (error: any) {
            logger.error('Failed to clear reverse geocode cache:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
