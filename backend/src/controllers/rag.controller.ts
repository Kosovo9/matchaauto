
import { Context } from 'hono';
import { UniversalRAGService } from '../services/ai/universal-rag.service';
import { logger } from '../utils/logger';
import { RAGMetricsService } from '../services/rag-metrics.service';

export class RAGController {
    private metrics: RAGMetricsService;

    constructor(private ragService: UniversalRAGService, pgPool: any) {
        this.metrics = new RAGMetricsService(pgPool);
    }

    query = async (c: Context) => {
        const start = Date.now();
        const body = await c.req.json();
        const { domain, query, userId = 'anon' } = body;

        if (!domain || !query) return c.json({ error: 'Missing domain or query' }, 400);

        logger.info(`🔍 RAG Query [${domain}]: ${query}`);

        // 1. Recuperar contexto relevante
        const docs = await this.ragService.search(query, domain);

        // 2. (Simulado) Generar respuesta o usar contexto directo
        const answer = docs.length > 0
            ? `[RAG] Encontré ${docs.length} referencias. Top: ${docs[0].content.substring(0, 100)}...`
            : "No encontré información relevante en mis manuales.";

        const latency = Date.now() - start;

        // 3. Registrar Métricas
        const queryId = await this.metrics.logQuery(domain, query, answer, userId, latency);

        return c.json({
            success: true,
            queryId,
            domain,
            query,
            context: docs.map(d => ({
                text: d.content,
                source: d.metadata.source,
                similarity: d.similarity
            })),
            stats: { latency }
        });
    };

    ingest = async (c: Context) => {
        // Endpoint administrativo para cargar manuales
        const body = await c.req.json();
        const { id, content, domain, metadata } = body;

        await this.ragService.ingestDocument({ id, content, metadata }, domain);
        return c.json({ success: true, message: 'Document ingested' });
    }
}
