
import { pipeline } from '@xenova/transformers';
import { Pool } from 'pg';
import { logger } from '../../utils/logger';

export interface RAGDocument {
    id: string;
    content: string;
    metadata: Record<string, any>; // { title, source, domain: 'mechanic' | 'legal' ... }
}

export class UniversalRAGService {
    private embedder: any;
    private ready: boolean = false;

    constructor(private pg: Pool) {
        this.init();
    }

    private async init() {
        try {
            // Carga el modelo pequeño optimizado para CPU (Offline)
            this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            this.ready = true;
            logger.info('🧠 Universal RAG Embedder Initialized (Offline Ready)');
        } catch (error) {
            logger.error('Failed to load embedding model:', error);
        }
    }

    /**
     * Genera vectores para un texto
     */
    private async getEmbedding(text: string): Promise<number[]> {
        if (!this.ready) throw new Error('Embedder not ready');
        const output = await this.embedder(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    }

    /**
     * Ingesta un documento en la base de conocimiento
     */
    async ingestDocument(doc: RAGDocument, domain: string) {
        try {
            const vector = await this.getEmbedding(doc.content);
            const vectorStr = JSON.stringify(vector);

            // Guardar en Postgres con vector
            // Asume tabla: rag_documents (id, content, metadata, embedding vector(384), domain)
            const query = `
                INSERT INTO rag_documents (id, content, metadata, embedding, domain)
                VALUES ($1, $2, $3, $4::vector, $5)
                ON CONFLICT (id) DO UPDATE 
                SET content = EXCLUDED.content, embedding = EXCLUDED.embedding
            `;

            await this.pg.query(query, [doc.id, doc.content, doc.metadata, vectorStr, domain]);
            logger.info(`📄 Ingested doc [${domain}]: ${doc.id}`);
        } catch (error) {
            logger.error(`Ingest error for ${doc.id}:`, error);
            throw error;
        }
    }

    /**
     * Busca conocimiento relevante
     */
    async search(query: string, domain: string, limit: number = 3) {
        if (!this.ready) return []; // Fallback si el modelo no cargó

        try {
            const queryVector = await this.getEmbedding(query);
            const vectorStr = JSON.stringify(queryVector);

            // Búsqueda por similitud de coseno (operador <=>)
            const sql = `
                SELECT content, metadata, 1 - (embedding <=> $1::vector) as similarity
                FROM rag_documents
                WHERE domain = $2
                ORDER BY embedding <=> $1::vector
                LIMIT $3
            `;

            const result = await this.pg.query(sql, [vectorStr, domain, limit]);
            return result.rows;
        } catch (error) {
            logger.error('RAG Search Error:', error);
            return [];
        }
    }
}
