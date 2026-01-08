-- 🚀 UNIFIED TRINITY SCHEMA (1000X)
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 📋 UNIFIED LISTINGS TABLE
-- Esta tabla centraliza Autos, Marketplace y Assets para búsquedas híbridas (Vectores + Geo)
CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    domain TEXT NOT NULL CHECK (domain IN ('auto', 'marketplace', 'assets')),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(15, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    city TEXT,
    state TEXT,
    attrs JSONB DEFAULT '{}',
    embedding vector(768),
    -- nomic-embed-text es 768
    geom geometry(Point, 4326),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- 🔍 ÍNDICES PARA PERFORMANCE 10X
CREATE INDEX IF NOT EXISTS idx_listings_domain ON listings(domain);
CREATE INDEX IF NOT EXISTS idx_listings_geom ON listings USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_listings_attrs ON listings USING GIN (attrs);
-- 🧠 ÍNDICE VECTORIAL (HNSW para búsquedas semánticas ultrarrápidas)
CREATE INDEX IF NOT EXISTS idx_listings_embedding ON listings USING hnsw (embedding vector_cosine_ops);
-- 🧪 DATOS MOCK DE ALTA CALIDAD (DIAMOND LEVEL)
INSERT INTO listings (
        id,
        domain,
        title,
        description,
        price,
        currency,
        city,
        state,
        attrs,
        geom
    )
VALUES (
        'auto-1',
        'auto',
        'Tesla Model S Plaid 2024',
        '1,020 HP, Tri-Motor AWD. Beyond Ludicrous.',
        89900,
        'USD',
        'Mexico City',
        'CDMX',
        '{"make": "Tesla", "model": "S Plaid", "year": 2024}',
        ST_SetSRID(ST_MakePoint(-99.1332, 19.4326), 4326)
    ),
    (
        'asset-1',
        'assets',
        'Penthouse in Santa Fe',
        'Ultra-luxury penthouse with private helipad and 360 view.',
        2500000,
        'USD',
        'Santa Fe',
        'CDMX',
        '{"type": "Penthouse", "rooms": 5, "area": 850}',
        ST_SetSRID(ST_MakePoint(-99.2599, 19.3622), 4326)
    ),
    (
        'item-1',
        'marketplace',
        'MacBook Pro M3 Max 128GB',
        'The most powerful laptop for AI and video production.',
        4500,
        'USD',
        'Guadalajara',
        'JAL',
        '{"brand": "Apple", "ram": "128GB", "storage": "2TB"}',
        ST_SetSRID(ST_MakePoint(-103.3496, 20.6597), 4326)
    ) ON CONFLICT (id) DO NOTHING;