import { Pool } from 'pg';
import { z } from 'zod';
import { MetricsCollector } from '../../../../utils/metrics-collector';
import { LanguageSchema, Language } from '../../cultural-types';

export class IndigenousLanguagesService {
    private pg: Pool;
    private metrics: MetricsCollector;

    constructor(pg: Pool) {
        this.pg = pg;
        this.metrics = MetricsCollector.getInstance();
    }

    // ==================== LANGUAGE CATALOG ====================
    async registerLanguage(lang: Language): Promise<string> {
        const validated = LanguageSchema.parse(lang);
        const client = await this.pg.connect();

        try {
            // Check if exists
            const existing = await client.query('SELECT id FROM indigenous_languages WHERE code = $1', [validated.code]);
            if (existing.rows.length > 0) {
                // Update resources
                await client.query(`
            UPDATE indigenous_languages 
            SET resources = $1, speakers = $2, status = $3 
            WHERE code = $4
        `, [JSON.stringify(validated.resources), validated.speakers, validated.status, validated.code]);
                return existing.rows[0].id;
            }

            const res = await client.query(`
        INSERT INTO indigenous_languages (
          code, name, native_name, country, region, status, speakers, resources, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id
      `, [
                validated.code,
                validated.name,
                validated.nativeName,
                validated.country,
                validated.region,
                validated.status,
                validated.speakers,
                JSON.stringify(validated.resources)
            ]);

            this.metrics.increment('indigenous_languages.registered', { code: validated.code });
            return res.rows[0].id;
        } finally {
            client.release();
        }
    }

    async findLanguagesByRegion(region: string): Promise<Language[]> {
        const client = await this.pg.connect();
        try {
            const res = await client.query(`
        SELECT * FROM indigenous_languages 
        WHERE region ILIKE $1 OR country ILIKE $1
      `, [`%${region}%`]);
            return res.rows.map(row => ({
                ...row,
                resources: row.resources // JSONB auto-parsed
            }));
        } finally {
            client.release();
        }
    }
}
