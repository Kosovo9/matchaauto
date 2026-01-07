import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../../utils/logger';

export const GeoOperationSchema = z.object({
    operation: z.enum(['buffer', 'intersection', 'union', 'difference', 'simplify', 'voronoi', 'envelope', 'centroid']),
    geometries: z.array(z.any()).min(1), // GeoJSON objects
    parameters: z.object({
        radius: z.number().optional(), // for buffer
        tolerance: z.number().optional(), // for simplify
        units: z.enum(['meters', 'kilometers', 'degrees']).default('meters').optional()
    }).optional()
});

export class GeospatialOperationsService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async executeOperation(op: z.infer<typeof GeoOperationSchema>) {
        const { operation, geometries, parameters } = op;
        const geomJson1 = JSON.stringify(geometries[0]);
        const geomJson2 = geometries.length > 1 ? JSON.stringify(geometries[1]) : null;

        let query = '';
        let params: any[] = [];

        switch (operation) {
            case 'buffer':
                // ST_Buffer(geom, radius)
                query = `SELECT ST_AsGeoJSON(ST_Buffer(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326)::geography, $2)::geometry) as result`;
                params = [geomJson1, parameters?.radius || 100];
                break;

            case 'intersection':
                // ST_Intersection(geom1, geom2)
                query = `SELECT ST_AsGeoJSON(ST_Intersection(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))) as result`;
                params = [geomJson1, geomJson2];
                break;

            case 'union':
                query = `SELECT ST_AsGeoJSON(ST_Union(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))) as result`;
                params = [geomJson1, geomJson2];
                break;

            case 'difference':
                query = `SELECT ST_AsGeoJSON(ST_Difference(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))) as result`;
                params = [geomJson1, geomJson2];
                break;

            case 'simplify':
                // ST_Simplify(geom, tolerance)
                // Use ::geometry for simplify as it's planar usually, or preserve topology
                query = `SELECT ST_AsGeoJSON(ST_SimplifyPreserveTopology(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326), $2)) as result`;
                params = [geomJson1, parameters?.tolerance || 0.001];
                break;

            case 'centroid':
                query = `SELECT ST_AsGeoJSON(ST_Centroid(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))) as result`;
                params = [geomJson1];
                break;

            case 'envelope':
                query = `SELECT ST_AsGeoJSON(ST_Envelope(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))) as result`;
                params = [geomJson1];
                break;

            case 'voronoi':
                // ST_VoronoiPolygons(geom) - Expects MultiPoint
                query = `SELECT ST_AsGeoJSON(ST_VoronoiPolygons(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))) as result`;
                params = [geomJson1];
                break;
        }

        if (!query) throw new Error('Unsupported operation');

        try {
            const res = await this.pool.query(query, params);
            return JSON.parse(res.rows[0].result);
        } catch (err) {
            logger.error(`GeoOperation ${operation} failed`, err);
            throw new Error(`GeoOperation Failed: ${(err as Error).message}`);
        }
    }
}
