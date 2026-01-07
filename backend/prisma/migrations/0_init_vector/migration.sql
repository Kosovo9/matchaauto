-- Habilitar extensión vectorial
CREATE EXTENSION IF NOT EXISTS vector;
-- Tabla para Documentos RAG
CREATE TABLE IF NOT EXISTS rag_documents (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384),
    -- all-MiniLM-L6-v2 usa 384 dimensiones
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Índices IVFFlat para búsqueda rápida (cuando tengamos >2000 filas)
-- CREATE INDEX ON rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Tabla para Métricas / Feedback
CREATE TABLE IF NOT EXISTS rag_queries (
    id SERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    query TEXT NOT NULL,
    answer TEXT,
    user_id TEXT,
    helpful BOOLEAN,
    -- Feedback del usuario
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);