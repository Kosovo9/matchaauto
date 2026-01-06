import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';

// Specialized Services
import { LocationCacheService, LocationCacheRequest, CachedLocation } from './location-cache.service';
import { RadiusSearchService, RadiusSearchRequest, RadiusSearchResponse } from './radius-search.service';
import { GeoAnalyticsService, AnalyticsRequest } from './geo-analytics.service';
import { GeoFencingService, GeoFencingRequest } from './geo-fencing.service';
import { AddressValidationService, AddressValidationRequest } from './address-validation.service';
import { GeocodingService } from './geocoding.service';
import { TimezoneService } from './timezone.service';

/**
 * Geolocation Orchestrator Service
 * Facade that integrates all specialized geolocation services (10x Architecture).
 * Provides a single entry point for the API to access location features.
 */
export class GeolocationService {
    public locationCache: LocationCacheService;
    public radiusSearch: RadiusSearchService;
    public analytics: GeoAnalyticsService;
    public geoFencing: GeoFencingService;
    public addressValidation: AddressValidationService;
    public geocoding: GeocodingService;
    public timezone: TimezoneService;

    constructor(pgPool: Pool, redis: Redis) {
        // Initialize all specialized services
        this.locationCache = new LocationCacheService(redis, pgPool);
        this.radiusSearch = new RadiusSearchService(redis, pgPool);
        this.analytics = new GeoAnalyticsService(pgPool, redis);
        this.geoFencing = new GeoFencingService(redis, pgPool);
        this.geocoding = new GeocodingService(redis, pgPool);
        this.addressValidation = new AddressValidationService(redis, pgPool, this.geocoding);
        this.timezone = new TimezoneService(redis);

        logger.info('GeolocationService Orchestrator initialized with 10x architecture');
    }

    /**
     * Updates vehicle location in real-time (Cache + Async DB Persistence)
     */
    async updateVehicleLocation(vehicleId: string, lat: number, lng: number): Promise<void> {
        return this.locationCache.setLocation({
            vehicleId,
            location: { latitude: lat, longitude: lng },
            timestamp: new Date()
        });
    }

    /**
     * Search for nearby vehicles or services with advanced filters
     */
    async searchNearby(request: RadiusSearchRequest): Promise<RadiusSearchResponse> {
        return this.radiusSearch.search(request);
    }

    /**
     * Get density heatmap data for analytics
     */
    async getDensityMap(request: AnalyticsRequest): Promise<any[]> {
        return this.analytics.getDensityStats(request);
    }

    /**
     * Process Geofence checks (e.g. entering/leaving zones)
     */
    async checkGeofence(vehicleId: string, fenceId: string, lat: number, lng: number): Promise<boolean> {
        return this.geoFencing.isInsideFence({
            vehicleId,
            fenceId,
            location: { latitude: lat, longitude: lng }
        });
    }

    /**
     * Validate and normalize an address
     */
    async validateAddress(request: AddressValidationRequest) {
        return this.addressValidation.validate(request);
    }

    /**
     * Get legacy density format (for backward compatibility if needed)
     */
    async getLegacyDensityMap(boundingBox: any): Promise<any[]> {
        // Adapt old bounding box to new schema
        return this.analytics.getDensityStats({
            boundingBox: {
                minLat: boundingBox.minLat,
                maxLat: boundingBox.maxLat,
                minLng: boundingBox.minLng,
                maxLng: boundingBox.maxLng
            },
            gridSize: 0.01
        });
    }

    /**
     * Unified search for Nearby items (Facade method)
     * Wraps RadiusSearch with simplified arguments
     */
    async simpleSearch(lat: number, lng: number, radiusMeters: number = 5000) {
        return this.radiusSearch.search({
            latitude: lat,
            longitude: lng,
            radius: radiusMeters,
            unit: 'meters'
        });
    }
}
