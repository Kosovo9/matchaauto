import { Pool } from 'pg';

export class SpatialFunctions {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async installFunctions(): Promise<void> {
        const client = await this.pool.connect();

        try {
            // 1. FUNCIÓN: Búsqueda por radio con filtros avanzados
            await client.query(`
        CREATE OR REPLACE FUNCTION matcha_find_nearby_advanced(
          search_lon DOUBLE PRECISION,
          search_lat DOUBLE PRECISION,
          radius_meters DOUBLE PRECISION,
          max_results INTEGER DEFAULT 100,
          vehicle_type VARCHAR DEFAULT NULL,
          min_battery INTEGER DEFAULT 10,
          max_price NUMERIC DEFAULT NULL
        ) RETURNS TABLE(
          id UUID,
          vehicle_id UUID,
          distance_meters DOUBLE PRECISION,
          battery_level INTEGER,
          metadata JSONB,
          match_score DOUBLE PRECISION
        ) AS $$
        DECLARE
          search_point GEOGRAPHY;
        BEGIN
          search_point := ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography;
          
          RETURN QUERY
          SELECT 
            vl.id,
            vl.vehicle_id,
            ST_Distance(vl.location, search_point) as distance_meters,
            vl.battery_level,
            vl.metadata,
            (
              (CASE WHEN vehicle_type IS NULL OR vl.metadata->>'type' = vehicle_type THEN 1.0 ELSE 0.2 END) *
              (CASE WHEN vl.battery_level >= min_battery THEN 1.0 ELSE 0.1 END) *
              EXP(-ST_Distance(vl.location, search_point) / (radius_meters * 2.0))
            ) as match_score
          FROM vehicle_locations vl
          WHERE vl.is_active = TRUE
            AND ST_DWithin(vl.location, search_point, radius_meters)
            AND (vehicle_type IS NULL OR vl.metadata->>'type' = vehicle_type)
          ORDER BY match_score DESC
          LIMIT max_results;
        END;
        $$ LANGUAGE plpgsql STABLE;
      `);

            // 2. FUNCIÓN: Detección de clusters espaciales
            await client.query(`
        CREATE OR REPLACE FUNCTION matcha_detect_clusters(
          epsilon_meters DOUBLE PRECISION DEFAULT 1000.0,
          min_points INTEGER DEFAULT 5
        ) RETURNS TABLE(
          cluster_id INTEGER,
          center_lon DOUBLE PRECISION,
          center_lat DOUBLE PRECISION,
          point_count INTEGER
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            ST_ClusterDBSCAN(location::geometry, eps := epsilon_meters / 111320.0, minpts := min_points) OVER () as cluster_id,
            ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lon,
            ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
            COUNT(*) OVER (PARTITION BY ST_ClusterDBSCAN(location::geometry, eps := epsilon_meters / 111320.0, minpts := min_points) OVER ()) as point_count
          FROM vehicle_locations
          WHERE is_active = TRUE;
        END;
        $$ LANGUAGE plpgsql STABLE;
      `);

            console.log('✅ Spatial functions installed successfully');
        } catch (error) {
            console.error('❌ Error installing spatial functions:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}
