-- Activar extensiones para RAG y GEO
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Tabla de listings unificada (Trinidad)
CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    domain TEXT NOT NULL CHECK (domain IN ('auto', 'marketplace', 'assets')),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'MXN',
    city TEXT,
    state TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    geom geometry(Point, 4326),
    attrs JSONB DEFAULT '{}'::jsonb,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Indices para performance 1000x
CREATE INDEX IF NOT EXISTS idx_listings_domain ON listings(domain);
CREATE INDEX IF NOT EXISTS idx_listings_geom ON listings USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_listings_embedding ON listings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING gin (title gin_trgm_ops);
-- Trigger para mantener el campo geom actualizado si cambian lat/lng
CREATE OR REPLACE FUNCTION update_listing_geom() RETURNS TRIGGER AS $$ BEGIN IF NEW.lat IS NOT NULL
    AND NEW.lng IS NOT NULL THEN NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_update_listing_geom ON listings;
CREATE TRIGGER trg_update_listing_geom BEFORE
INSERT
    OR
UPDATE OF lat,
    lng ON listings FOR EACH ROW EXECUTE FUNCTION update_listing_geom();