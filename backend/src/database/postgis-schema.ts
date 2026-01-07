import { z } from 'zod';
import { Pool } from 'pg';

// Fallback logic for PostGIS extensions if not provided yet
export const GeoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()])
    .refine(([lng, lat]) =>
      lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
      { message: 'Coordenadas inválidas' }
    )
});

export const BoundingBoxSchema = z.object({
  minLng: z.number().min(-180).max(180),
  minLat: z.number().min(-90).max(90),
  maxLng: z.number().min(-180).max(180),
  maxLat: z.number().min(-90).max(90)
});

export const VehicleLocationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  location: GeoPointSchema,
  accuracy: z.number().min(0).max(100).optional(), // metros
  altitude: z.number().optional(),
  speed: z.number().min(0).optional(), // km/h
  heading: z.number().min(0).max(360).optional(), // grados
  batteryLevel: z.number().min(0).max(100).optional(),
  lastUpdated: z.date().default(() => new Date()),
  isActive: z.boolean().default(true),
  metadata: z.record(z.string(), z.any()).optional()
});

export const UserLocationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  location: GeoPointSchema,
  sessionId: z.string(),
  deviceType: z.enum(['mobile', 'web', 'api']),
  accuracy: z.number().min(0).max(100),
  lastPing: z.date(),
  isOnline: z.boolean().default(false),
  geofenceId: z.string().uuid().optional(),
  searchRadius: z.number().min(1).max(50000).default(10000), // metros
  preferences: z.object({
    unit: z.enum(['km', 'miles']).default('km'),
    maxDistance: z.number().min(1).max(500).default(50)
  }).optional()
});

export const GeofenceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()])))
  }),
  center: GeoPointSchema,
  radius: z.number().min(10).max(50000), // metros
  isActive: z.boolean().default(true),
  rules: z.object({
    notifyOnEntry: z.boolean().default(true),
    notifyOnExit: z.boolean().default(true),
    autoMatch: z.boolean().default(false),
    restrictions: z.array(z.string()).optional()
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional()
});

export const SpatialIndexSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['gist', 'gin', 'brin']),
  tableName: z.string(),
  columnName: z.string(),
  dimensions: z.number().min(2).max(3).default(2),
  isActive: z.boolean().default(true),
  stats: z.object({
    sizeBytes: z.number(),
    lastUpdated: z.date(),
    hitRate: z.number().min(0).max(1)
  }).optional()
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;
export type VehicleLocation = z.infer<typeof VehicleLocationSchema>;
export type UserLocation = z.infer<typeof UserLocationSchema>;
export type Geofence = z.infer<typeof GeofenceSchema>;
export type SpatialIndex = z.infer<typeof SpatialIndexSchema>;

export class PostGISDatabase {
  private pool: Pool;

  constructor(config: any) {
    this.pool = new Pool({
      ...config,
      types: {
        getTypeParser: (oid: number) => {
          if (oid === 600) { // point type
            return (val: string) => {
              const match = val.match(/\(([^)]+)\)/);
              if (match) {
                const [lng, lat] = match[1].split(',').map(Number);
                return { type: 'Point', coordinates: [lng, lat] };
              }
              return null;
            };
          }
          return null;
        }
      }
    });
  }

  async createSpatialTables(): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Enable PostGIS extension
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis_topology');

      // Create vehicle_locations table with spatial index
      await client.query(`
        CREATE TABLE IF NOT EXISTS vehicle_locations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          vehicle_id UUID NOT NULL,
          location GEOGRAPHY(Point, 4326) NOT NULL,
          accuracy INTEGER,
          altitude DOUBLE PRECISION,
          speed DOUBLE PRECISION,
          heading DOUBLE PRECISION,
          battery_level INTEGER,
          last_updated TIMESTAMPTZ DEFAULT NOW(),
          is_active BOOLEAN DEFAULT TRUE,
          metadata JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT fk_vehicle FOREIGN KEY(vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
        );
      `);

      // Create spatial index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_vehicle_locations_geo 
        ON vehicle_locations USING GIST (location);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_vehicle_locations_active 
        ON vehicle_locations (is_active, last_updated DESC);
      `);

      // Create user_locations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_locations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE NOT NULL,
          location GEOGRAPHY(Point, 4326) NOT NULL,
          session_id VARCHAR(255),
          device_type VARCHAR(50),
          accuracy INTEGER,
          last_ping TIMESTAMPTZ DEFAULT NOW(),
          is_online BOOLEAN DEFAULT FALSE,
          geofence_id UUID,
          search_radius INTEGER DEFAULT 10000,
          preferences JSONB DEFAULT '{"unit": "km", "maxDistance": 50}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          
          CONSTRAINT fk_user_location FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_user_locations_geo 
        ON user_locations USING GIST (location);
      `);

      // Create geofences table
      await client.query(`
        CREATE TABLE IF NOT EXISTS geofences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          geometry GEOGRAPHY(Polygon, 4326) NOT NULL,
          center GEOGRAPHY(Point, 4326) NOT NULL,
          radius INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT TRUE,
          rules JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          
          CHECK (radius >= 10 AND radius <= 50000)
        );
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_geofences_geo 
        ON geofences USING GIST (geometry);
      `);

      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_geofences_center 
        ON geofences USING GIST (center);
      `);

      // Create spatial analytics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS spatial_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          date DATE NOT NULL,
          hour INTEGER NOT NULL,
          region VARCHAR(100),
          total_vehicles INTEGER DEFAULT 0,
          active_vehicles INTEGER DEFAULT 0,
          total_users INTEGER DEFAULT 0,
          active_users INTEGER DEFAULT 0,
          avg_speed DOUBLE PRECISION,
          max_density_point GEOGRAPHY(Point, 4326),
          heatmap_data JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          
          UNIQUE(date, hour, region)
        );
      `);

      console.log('✅ Spatial tables created successfully');

    } catch (error) {
      console.error('❌ Error creating spatial tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getNearestVehicles(
    point: GeoPoint,
    radius: number = 10000,
    limit: number = 50,
    filters: any = {}
  ): Promise<VehicleLocation[]> {
    const client = await this.pool.connect();

    try {
      const { coordinates: [lng, lat] } = point;

      const query = `
        SELECT 
          vl.*,
          ST_Distance(vl.location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
        FROM vehicle_locations vl
        WHERE vl.is_active = TRUE
          AND ST_DWithin(
            vl.location,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
            $3
          )
          ${filters.vehicleType ? 'AND vl.metadata->>\'type\' = $5' : ''}
          ${filters.minBattery ? 'AND vl.battery_level >= $6' : ''}
          ${filters.maxPrice ? 'AND (vl.metadata->>\'price\')::numeric <= $7' : ''}
        ORDER BY distance_meters ASC
        LIMIT $4;
      `;

      const params: any[] = [lng, lat, radius, limit];

      if (filters.vehicleType) params.push(filters.vehicleType);
      if (filters.minBattery) params.push(filters.minBattery);
      if (filters.maxPrice) params.push(filters.maxPrice);

      const result = await client.query(query, params);

      return result.rows.map(row => ({
        ...row,
        location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location
      }));
    } finally {
      client.release();
    }
  }

  async calculateDensityHeatmap(
    boundingBox: z.infer<typeof BoundingBoxSchema>,
    gridSize: number = 100
  ): Promise<any[]> {
    const client = await this.pool.connect();

    try {
      const query = `
        WITH grid AS (
          SELECT 
            ST_SetSRID(ST_MakeEnvelope($1, $2, $3, $4, 4326), 4326) as bbox,
            generate_series(1, $5) as grid_x,
            generate_series(1, $5) as grid_y
        ),
        cells AS (
          SELECT 
            grid_x,
            grid_y,
            ST_SetSRID(
              ST_MakeEnvelope(
                ST_XMin(bbox) + (ST_XMax(bbox) - ST_XMin(bbox)) * (grid_x - 1) / $5,
                ST_YMin(bbox) + (ST_YMax(bbox) - ST_YMin(bbox)) * (grid_y - 1) / $5,
                ST_XMin(bbox) + (ST_XMax(bbox) - ST_XMin(bbox)) * grid_x / $5,
                ST_YMin(bbox) + (ST_YMax(bbox) - ST_YMin(bbox)) * grid_y / $5,
                4326
              ),
              4326
            )::geography as cell
          FROM grid
          CROSS JOIN generate_series(1, $5) as grid_x
          CROSS JOIN generate_series(1, $5) as grid_y
        )
        SELECT 
          c.grid_x,
          c.grid_y,
          COUNT(vl.id) as vehicle_count,
          COUNT(ul.id) as user_count,
          ST_AsGeoJSON(ST_Centroid(c.cell::geometry)) as center
        FROM cells c
        LEFT JOIN vehicle_locations vl ON ST_Within(vl.location::geometry, c.cell::geometry)
          AND vl.is_active = TRUE
        LEFT JOIN user_locations ul ON ST_Within(ul.location::geometry, c.cell::geometry)
          AND ul.is_online = TRUE
        GROUP BY c.grid_x, c.grid_y, c.cell
        ORDER BY c.grid_x, c.grid_y;
      `;

      const result = await client.query(query, [
        boundingBox.minLng,
        boundingBox.minLat,
        boundingBox.maxLng,
        boundingBox.maxLat,
        gridSize
      ]);

      return result.rows;
    } finally {
      client.release();
    }
  }

  async updateUserLocation(
    userId: string,
    location: GeoPoint,
    sessionId: string,
    deviceType: string,
    accuracy: number = 50
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      const { coordinates: [lng, lat] } = location;

      const query = `
        INSERT INTO user_locations (user_id, location, session_id, device_type, accuracy, last_ping, is_online)
        VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5, $6, NOW(), TRUE)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          location = EXCLUDED.location,
          session_id = EXCLUDED.session_id,
          device_type = EXCLUDED.device_type,
          accuracy = EXCLUDED.accuracy,
          last_ping = NOW(),
          is_online = TRUE,
          updated_at = NOW()
        RETURNING id;
      `;

      await client.query(query, [userId, lng, lat, sessionId, deviceType, accuracy]);

      // Check geofence triggers
      await this.checkGeofenceTriggers(userId, location);

    } finally {
      client.release();
    }
  }

  private async checkGeofenceTriggers(userId: string, location: GeoPoint): Promise<void> {
    const client = await this.pool.connect();

    try {
      const { coordinates: [lng, lat] } = location;

      const query = `
        SELECT g.*,
          ST_Distance(
            g.center,
            ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
          ) as distance_meters
        FROM geofences g
        WHERE g.is_active = TRUE
          AND EXISTS (
            SELECT 1 FROM user_locations ul
            WHERE ul.user_id = $1
              AND ul.geofence_id IS DISTINCT FROM g.id
              AND ST_Within(
                ul.location::geometry,
                g.geometry::geometry
              )
          );
      `;

      const result = await client.query(query, [userId, lng, lat]);

      // Trigger events if user entered new geofence
      for (const geofence of result.rows) {
        // Update user's current geofence
        await client.query(
          'UPDATE user_locations SET geofence_id = $1 WHERE user_id = $2',
          [geofence.id, userId]
        );

        // Log geofence event
        await client.query(`
          INSERT INTO geofence_events (user_id, geofence_id, event_type, location)
          VALUES ($1, $2, 'entry', ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)
        `, [userId, geofence.id, lng, lat]);
      }
    } finally {
      client.release();
    }
  }

  async optimizeSpatialIndexes(): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Analyze tables for better query planning
      await client.query('ANALYZE vehicle_locations');
      await client.query('ANALYZE user_locations');
      await client.query('ANALYZE geofences');

      console.log('✅ Spatial indexes optimized');
    } finally {
      client.release();
    }
  }
}
