-- ============================================
-- OPTIMIZED SPATIAL INDEXES FOR POSTGIS 1000x
-- ============================================
-- 1. Primary Spatial Indexes (GIST for geometry)
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_geo_gist ON vehicle_locations USING GIST (location) WITH (fillfactor = 90);
CREATE INDEX IF NOT EXISTS idx_user_locations_geo_gist ON user_locations USING GIST (location) WITH (fillfactor = 90);
CREATE INDEX IF NOT EXISTS idx_geofences_geo_gist ON geofences USING GIST (geometry) WITH (fillfactor = 90);
CREATE INDEX IF NOT EXISTS idx_geofence_events_location_gist ON geofence_events USING GIST (location) WITH (fillfactor = 85);
-- 2. BRIN Indexes for Time-Series Data (Large Tables)
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_time_brin ON vehicle_locations USING BRIN (last_updated) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_location_history_time_brin ON location_history USING BRIN (created_at) WITH (pages_per_range = 64);
-- 3. Composite Indexes for Common Query Patterns
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_active_geo ON vehicle_locations (is_active, last_updated DESC) INCLUDE (location, battery_level, metadata)
WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_locations_online_geo ON user_locations (is_online, last_ping DESC) INCLUDE (location, search_radius, preferences)
WHERE is_online = TRUE;
-- 4. Partial Indexes for Filtered Queries
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_high_battery ON vehicle_locations (last_updated DESC, location)
WHERE battery_level >= 80
    AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_low_battery ON vehicle_locations (last_updated DESC, location)
WHERE battery_level <= 20
    AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_moving ON vehicle_locations (last_updated DESC, location)
WHERE speed > 5
    AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_stationary ON vehicle_locations (last_updated DESC, location)
WHERE speed <= 1
    AND is_active = TRUE;
-- 5. Expression Indexes for Optimized Distance Queries
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_geo_3d ON vehicle_locations USING GIST (ST_Transform(location::geometry, 3857));
CREATE INDEX IF NOT EXISTS idx_geofences_center_proximity ON geofences USING GIST (center) WITH (fillfactor = 95);
-- 6. Indexes for JSONB fields (GIN for fast search)
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_metadata_gin ON vehicle_locations USING GIN (metadata jsonb_path_ops)
WHERE metadata IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_metadata_btree ON vehicle_locations ((metadata->>'type'), (metadata->>'model'))
WHERE metadata->>'type' IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_locations_preferences_gin ON user_locations USING GIN (preferences)
WHERE preferences IS NOT NULL;
-- 7. Covering Indexes for Critical Queries
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_covering_search ON vehicle_locations (is_active, last_updated DESC) INCLUDE (
    location,
    user_id,
    vehicle_id,
    battery_level,
    speed,
    metadata
)
WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_locations_covering_match ON user_locations (
    is_online,
    last_ping DESC,
    search_radius
) INCLUDE (location, user_id, preferences)
WHERE is_online = TRUE;
-- 9. Indexes for Geofence Operations
CREATE INDEX IF NOT EXISTS idx_geofences_active_radius ON geofences (is_active, radius) INCLUDE (geometry, center, rules)
WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_geofence_events_user_time ON geofence_events (user_id, created_at DESC) INCLUDE (geofence_id, event_type, location);
-- 10. Indexes for Spatial Analytics
CREATE INDEX IF NOT EXISTS idx_spatial_analytics_date_region ON spatial_analytics (date DESC, region NULLS LAST, hour DESC) INCLUDE (
    total_vehicles,
    active_vehicles,
    max_density_point
);
CREATE INDEX IF NOT EXISTS idx_spatial_analytics_heatmap ON spatial_analytics USING GIN (heatmap_data jsonb_path_ops)
WHERE heatmap_data IS NOT NULL;
-- 11. Functional Indexes for Case-Insensitive Search
CREATE INDEX IF NOT EXISTS idx_geofences_name_ci ON geofences (LOWER(name))
WHERE is_active = TRUE;
-- 13. Indexes for Vacuum Optimization
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vacuum ON vehicle_locations (last_updated)
WHERE is_active = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_locations_vacuum ON user_locations (last_ping)
WHERE is_online = FALSE;
-- 14. Indexes for Real-Time Aggregation
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_aggregation ON vehicle_locations (DATE_TRUNC('hour', last_updated), is_active) INCLUDE (location, battery_level, speed);
-- 15. Specialized Indexes for Distance-based Queries
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_distance_bbox ON vehicle_locations USING GIST (
    ST_Expand(location::geometry, 0.01) -- ~1km at equator
)
WHERE is_active = TRUE;
-- 16. Indexes for Clustering (improves cache locality)
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_cluster ON vehicle_locations (
    ST_GeoHash(location::geometry, 6),
    last_updated DESC
)
WHERE is_active = TRUE;
-- 18. Indexes for Polymorphic Relationships
CREATE INDEX IF NOT EXISTS idx_location_history_polymorphic ON location_history (entity_type, entity_id, created_at DESC) INCLUDE (location, user_id);
-- 19. Indexes for Backup/Restore Optimization
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_export ON vehicle_locations (id, last_updated) INCLUDE (location, metadata)
WHERE last_updated > NOW() - INTERVAL '7 days';
-- 21. Indexes for High-Frequency Updates
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_hot ON vehicle_locations (id) INCLUDE (location, last_updated, battery_level)
WHERE last_updated > NOW() - INTERVAL '1 hour';
CREATE INDEX IF NOT EXISTS idx_user_locations_hot ON user_locations (id) INCLUDE (location, last_ping, is_online)
WHERE last_ping > NOW() - INTERVAL '1 hour';
-- 22. Indexes for Spatial Joins
CREATE INDEX IF NOT EXISTS idx_spatial_join_vehicles_users ON vehicle_locations USING GIST (location) WITH (fillfactor = 80)
WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_spatial_join_users_geofences ON user_locations USING GIST (location) WITH (fillfactor = 80)
WHERE is_online = TRUE;
-- 23. Indexes for Statistical Queries
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_stats ON vehicle_locations (
    DATE_TRUNC('day', last_updated),
    is_active,
    (metadata->>'type')
) INCLUDE (location, battery_level, speed);
-- 25. Indexes for Temporal-Spatial Queries
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_temporal_spatial ON vehicle_locations (last_updated DESC, location)
WHERE is_active = TRUE;
-- 27. Indexes for Disaster Recovery
CREATE INDEX IF NOT EXISTS idx_recovery_vehicle_locations ON vehicle_locations (last_updated, user_id) INCLUDE (location, metadata)
WHERE last_updated > NOW() - INTERVAL '90 days';
-- 28. Indexes for Multi-Tenancy (if needed)
CREATE INDEX IF NOT EXISTS idx_tenant_vehicle_locations ON vehicle_locations ((metadata->>'tenant_id'), last_updated DESC)
WHERE metadata->>'tenant_id' IS NOT NULL;
-- 29. Indexes for Regulatory Compliance
CREATE INDEX IF NOT EXISTS idx_compliance_location_history ON location_history (user_id, created_at DESC, entity_type) INCLUDE (location)
WHERE created_at > NOW() - INTERVAL '365 days';
-- Final Optimization: Cluster Tables (Wait for initial data before clustering usually)
-- ANALYZE all tables
ANALYZE vehicle_locations;
ANALYZE user_locations;
ANALYZE geofences;
ANALYZE geofence_events;
ANALYZE location_history;
ANALYZE spatial_analytics;
-- Create index monitoring view
CREATE OR REPLACE VIEW vw_index_usage_stats AS
SELECT schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_relation_size(schemaname || '.' || indexname) as index_size_bytes,
    pg_size_pretty(pg_relation_size(schemaname || '.' || indexname)) as index_size,
    CASE
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 1000 THEN 'LOW_USAGE'
        WHEN idx_tup_read::float / idx_scan > 1000 THEN 'INEFFICIENT'
        ELSE 'HEALTHY'
    END as status
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC,
    index_size_bytes DESC;
COMMENT ON INDEX idx_vehicle_locations_geo_gist IS 'Primary spatial index for vehicle locations, optimized for radius searches';
COMMENT ON INDEX idx_user_locations_geo_gist IS 'Primary spatial index for user locations, optimized for proximity matching';
COMMENT ON INDEX idx_geofences_geo_gist IS 'Primary spatial index for geofence polygons, optimized for ST_Within queries';