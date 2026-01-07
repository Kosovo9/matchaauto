-- backend/db/schema.sql
-- Tabla principal de listings (vehículos)
CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    mileage INTEGER,
    fuel_type TEXT,
    transmission TEXT,
    images JSON DEFAULT '[]',
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    city TEXT,
    state TEXT,
    country TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Tabla de usuarios (integrada con Clerk)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    phone TEXT,
    preferences JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de búsquedas guardadas (para el motor de recomendaciones)
CREATE TABLE IF NOT EXISTS saved_searches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    filters JSON NOT NULL,
    name TEXT,
    alert_frequency TEXT DEFAULT 'daily',
    last_notified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- Tabla de auditoría de seguridad (Sentinel X)
CREATE TABLE IF NOT EXISTS security_audit (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    path TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Índices para performance
CREATE INDEX idx_listings_location ON listings(location_lat, location_lng);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
CREATE INDEX idx_security_audit_created ON security_audit(created_at DESC);