import { Pool } from 'pg';
import Redis from 'ioredis';
import { Hub, Signal, HubStatus } from './hubs.schema';
import { logger } from '../../utils/logger';

export class HubsService {
    constructor(private pg: Pool, private redis: Redis) { }

    async createHub(data: Partial<Hub>): Promise<Hub> {
        const query = `
            INSERT INTO hubs (name, purpose, status, language, metadata)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [data.name, data.purpose, data.status || 'active', data.language || 'es', JSON.stringify(data.metadata || {})];
        const res = await this.pg.query(query, values);

        await this.redis.set(`hub:${res.rows[0].id}`, JSON.stringify(res.rows[0]), 'EX', 3600);
        return res.rows[0];
    }

    async getHub(id: string): Promise<Hub | null> {
        const cached = await this.redis.get(`hub:${id}`);
        if (cached) return JSON.parse(cached);

        const res = await this.pg.query('SELECT * FROM hubs WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;

        await this.redis.set(`hub:${id}`, JSON.stringify(res.rows[0]), 'EX', 3600);
        return res.rows[0];
    }

    async listHubs(): Promise<Hub[]> {
        const res = await this.pg.query('SELECT * FROM hubs ORDER BY created_at DESC');
        return res.rows;
    }

    async sendSignal(signal: Signal): Promise<Signal> {
        const query = `
            INSERT INTO signals (hub_id, type, content, sender_id, ttl, delivery)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [signal.hubId, signal.type, signal.content, signal.senderId, signal.ttl, signal.delivery];
        const res = await this.pg.query(query, values);

        // Notify via Redis Pub/Sub for real-time (Signal-driven architecture)
        await this.redis.publish(`hub:${signal.hubId}:signals`, JSON.stringify(res.rows[0]));

        return res.rows[0];
    }

    async getHubSignals(hubId: string): Promise<Signal[]> {
        const res = await this.pg.query('SELECT * FROM signals WHERE hub_id = $1 ORDER BY created_at DESC LIMIT 50', [hubId]);
        return res.rows;
    }

    /**
     * 1000x Viralizer: Clones a hub structure for organic growth
     */
    async cloneHub(sourceId: string, newName: string): Promise<Hub | null> {
        const source = await this.getHub(sourceId);
        if (!source) return null;

        return this.createHub({
            name: newName,
            purpose: source.purpose,
            language: source.language,
            metadata: { ...source.metadata, clonedFrom: sourceId }
        });
    }
}
