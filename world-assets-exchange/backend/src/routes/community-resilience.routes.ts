
import { Hono } from 'hono';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { CommunityResilienceController } from '../modules/community-resilience/community-resilience.controller';

export function setupCommunityResilienceRoutes(
    app: Hono,
    redis: Redis,
    pgPool: Pool
) {
    const resilienceController = new CommunityResilienceController(pgPool, redis);
    const route = new Hono();

    // Unified Endpoint Strategy: /api/resilience/:module/:action
    // Example: POST /api/resilience/agri/offer
    // Example: POST /api/resilience/emergency/alert

    route.post('/:module/:action', (c) => resilienceController.handleRequest(c));
    route.get('/:module/:action', (c) => resilienceController.handleRequest(c)); // Support GET for search if body not required, though handleRequest parses body. Ideally separating Search to GET.

    app.route('/api/resilience', route);
}
