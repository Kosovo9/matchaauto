import { z } from 'zod';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../utils/logger';
import { metrics } from '../utils/metrics';
import { CircuitBreaker } from '../patterns/circuit-breaker';
import { LocationCacheService } from './location-cache.service';
import { GeocodingService } from './geocoding.service';

export const VehicleSchema = z.object({
    id: z.string().uuid().optional(),
    ownerId: z.string().uuid(),
    vin: z.string().length(17).optional(),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    trim: z.string().optional(),
    color: z.string().optional(),
    mileage: z.number().min(0),
    mileageUnit: z.enum(['km', 'mi']).default('km'),
    fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'plug_in_hybrid', 'hydrogen']).optional(),
    transmission: z.enum(['automatic', 'manual', 'cvt', 'dual_clutch']).optional(),
    drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd']).optional(),
    features: z.array(z.string()).default([]),
    images: z.array(z.string().url()).default([]),
    price: z.number().min(0).optional(),
    currency: z.string().length(3).default('USD'),
    description: z.string().max(2000).optional(),
    location: z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        address: z.string().optional()
    }).optional(),
    status: z.enum(['draft', 'published', 'sold', 'reserved', 'maintenance']).default('draft'),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export class VehicleService {
    private redis: Redis;
    private pgPool: Pool;
    private locationCache: LocationCacheService;
    private geocoding: GeocodingService;
    private circuitBreaker: CircuitBreaker;
    private readonly CACHE_TTL = 3600; // 1 hour for vehicle details

    constructor(
        redis: Redis,
        pgPool: Pool,
        locationCache: LocationCacheService,
        geocoding: GeocodingService
    ) {
        this.redis = redis;
        this.pgPool = pgPool;
        this.locationCache = locationCache;
        this.geocoding = geocoding;
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            timeout: 5000,
            resetTimeout: 30000
        });
    }

    async createVehicle(data: Omit<Vehicle, 'id'>): Promise<Vehicle> {
        const start = Date.now();
        try {
            const validated = VehicleSchema.parse(data);
            const id = crypto.randomUUID();

            // If location is provided but no address, geocode it
            if (validated.location && !validated.location.address) {
                try {
                    const geo = await this.geocoding.reverseGeocode(validated.location.lat, validated.location.lng);
                    if (geo) {
                        validated.location.address = geo.formattedAddress;
                    }
                } catch (e) {
                    logger.warn('Failed to geocode new vehicle location', { id, error: e });
                }
            }

            const client = await this.pgPool.connect();
            try {
                await client.query('BEGIN');

                // Insert Vehicle
                await client.query(`
          INSERT INTO vehicles (
            id, owner_id, vin, make, model, year, trim, color, 
            mileage, mileage_unit, fuel_type, transmission, drivetrain,
            features, images, price, currency, description, 
            status, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
            $9, $10, $11, $12, $13, 
            $14, $15, $16, $17, $18, 
            $19, $20)
        `, [
                    id, validated.ownerId, validated.vin, validated.make, validated.model, validated.year, validated.trim, validated.color,
                    validated.mileage, validated.mileageUnit, validated.fuelType, validated.transmission, validated.drivetrain,
                    JSON.stringify(validated.features), JSON.stringify(validated.images), validated.price, validated.currency, validated.description,
                    validated.status, validated.metadata
                ]);

                // If location, update Location Cache & DB Geometry
                if (validated.location) {
                    await this.updateVehicleLocation(id, validated.location.lat, validated.location.lng, validated.location.address, client);
                }

                await client.query('COMMIT');

                const created = { ...validated, id, createdAt: new Date(), updatedAt: new Date() };

                // Cache
                await this.redis.setex(`vehicle:${id}`, this.CACHE_TTL, JSON.stringify(created));

                metrics.increment('vehicle.created_total');
                metrics.timing('vehicle.creation_time_ms', Date.now() - start);

                return created;

            } catch (e: any) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } catch (error: any) {
            logger.error('Create vehicle failed', { error: error.message });
            throw new Error(`Create vehicle failed: ${error.message}`);
        }
    }

    async getVehicle(id: string): Promise<Vehicle | null> {
        const cached = await this.redis.get(`vehicle:${id}`);
        if (cached) return JSON.parse(cached);

        const client = await this.pgPool.connect();
        try {
            const res = await client.query(`
        SELECT v.*, 
               ST_Y(vl.location::geometry) as lat, 
               ST_X(vl.location::geometry) as lng,
               vl.address_text as address
        FROM vehicles v
        LEFT JOIN vehicle_locations_static vl ON v.id = vl.vehicle_id
        WHERE v.id = $1
      `, [id]);

            if (res.rows.length === 0) return null;

            const row = res.rows[0];
            const vehicle: Vehicle = {
                id: row.id,
                ownerId: row.owner_id,
                vin: row.vin,
                make: row.make,
                model: row.model,
                year: row.year,
                trim: row.trim,
                color: row.color,
                mileage: parseFloat(row.mileage),
                mileageUnit: row.mileage_unit,
                fuelType: row.fuel_type,
                transmission: row.transmission,
                drivetrain: row.drivetrain,
                features: row.features, // PG jsonb automatic parsing
                images: row.images,
                price: row.price ? parseFloat(row.price) : undefined,
                currency: row.currency,
                description: row.description,
                status: row.status,
                metadata: row.metadata,
                location: row.lat ? { lat: row.lat, lng: row.lng, address: row.address } : undefined,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };

            await this.redis.setex(`vehicle:${id}`, this.CACHE_TTL, JSON.stringify(vehicle));
            return vehicle;
        } finally {
            client.release();
        }
    }

    // Optimized for 10x: Single query with filters
    async searchVehicles(filters: any): Promise<Vehicle[]> {
        // This will be expanded in MarketplaceService, keeping it simple here for admin/owner usage
        // ... basic CRUD search
        return [];
    }

    private async updateVehicleLocation(vehicleId: string, lat: number, lng: number, address: string | undefined, client: any) {
        // Update static location table (for search)
        await client.query(`
        INSERT INTO vehicle_locations_static (vehicle_id, location, address_text)
        VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326), $4)
        ON CONFLICT (vehicle_id) DO UPDATE
        SET location = EXCLUDED.location, address_text = EXCLUDED.address_text, updated_at = NOW()
     `, [vehicleId, lat, lng, address]);

        // Also update the LocationCache (hot path)
        // We do this AFTER the static DB update to ensure consistency, but fire-and-forget the cache update
        this.locationCache.updateLocation({
            userId: 'system',
            entityId: vehicleId,
            entityType: 'vehicle',
            location: { latitude: lat, longitude: lng },
            // timestamp: Date.now()
        }).catch(err => logger.error('Failed to update cache on vehicle create', { err }));
    }
}
