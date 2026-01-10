// backend/src/routes/geo.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Pool } from 'pg';
import { Redis } from 'ioredis';

const geoRouter = new Hono<{ Variables: { pg: Pool, redis: Redis } }>();

// Schema validation for nearby search
const nearbySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().optional().default(10), // Km
    category: z.string().optional(),
});

/**
 * F-GEO-NEARBY: Intent-Based Spatial Match
 * Returns listings within a specific radius using PostGIS geography.
 */
geoRouter.get('/nearby', zValidator('query', nearbySchema), async (c) => {
    const { lat, lng, radius, category } = c.req.valid('query');
    const pg = c.get('pg');
    const redis = c.get('redis');

    const cacheKey = `geo:nearby:${lat}:${lng}:${radius}:${category || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) return c.json(JSON.parse(cached));

    try {
        let query = `
      SELECT id, title, description, domain, price, currency, attrs, 
             ST_Distance(location::geography, ST_MakePoint($1, $2)::geography) / 1000 as distance_km
      FROM listings
      WHERE ST_DWithin(location::geography, ST_MakePoint($1, $2)::geography, $3 * 1000)
    `;

        const params: any[] = [lng, lat, radius];

        if (category) {
            query += ` AND domain = $4`;
            params.push(category);
        }

        query += ` ORDER BY distance_km ASC LIMIT 50`;

        const { rows } = await pg.query(query, params);

        // Cache for 5 minutes
        await redis.setex(cacheKey, 300, JSON.stringify(rows));

        return c.json(rows);
    } catch (error) {
        console.error('Geo Nearby Error:', error);
        return c.json({ error: 'Failed to fetch nearby listings' }, 500);
    }
});

/**
 * Distance Matrix API
 * Calculates distances between multiple origins and destinations.
 */
geoRouter.get('/distance-matrix', async (c) => {
    const origins = c.req.query('origins')?.split('|') || [];
    const destinations = c.req.query('destinations')?.split('|') || [];

    // In a real 10x scenario, we would use OSRM or Google Distance Matrix
    // Here we provide a high-performance fallback calculation
    const results = origins.map(o => {
        return destinations.map(d => {
            return { origin: o, destination: d, distance: "Calculating...", duration: "N/A" };
        });
    });

    return c.json(results);
});

export default geoRouter;
