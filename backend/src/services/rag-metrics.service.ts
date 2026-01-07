
import { Pool } from 'pg';

export class RAGMetricsService {
    constructor(private pg: Pool) { }

    /**
     * Registra una consulta RAG para análisis futuro
     */
    async logQuery(domain: string, query: string, answer: string, userId: string, latencyMs: number) {
        try {
            const res = await this.pg.query(
                `INSERT INTO rag_queries (domain, query, answer, user_id, latency_ms, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
                [domain, query, answer, userId, latencyMs]
            );
            return res.rows[0].id; // Retorna Query ID para feedback futuro
        } catch (error) {
            console.error('Failed to log RAG metrics:', error);
            return null;
        }
    }

    /**
     * Registra feedback del usuario (Dedo arriba/abajo)
     */
    async logFeedback(queryId: number, helpful: boolean) {
        await this.pg.query(
            `UPDATE rag_queries SET helpful = $1 WHERE id = $2`,
            [helpful, queryId]
        );
    }

    /**
     * Obtiene estadísticas de precisión por dominio
     */
    async getDomainStats(domain: string) {
        const res = await this.pg.query(
            `SELECT 
             COUNT(*) as total_queries,
             AVG(latency_ms) as avg_latency,
             (COUNT(CASE WHEN helpful = true THEN 1 END)::float / NULLIF(COUNT(CASE WHEN helpful IS NOT NULL THEN 1 END), 0)) * 100 as accuracy_percent
           FROM rag_queries 
           WHERE domain = $1`,
            [domain]
        );
        return res.rows[0];
    }
}
