# Trinity Diamond - Master Plan & Feature Map
**Status:** Flight Director Mode Active | **Architect:** MIT Senior Systems Engineer

## 1. Resumen Ejecutivo
- **Arquitectura:** Mono-repo con Backend compartido y 3 UIs (Auto, Marketplace, Assets).
- **Core Stack:** Clerk (Auth), Supabase/Postgres (DB), Redis (Cache), Google Cloud Run (Deploy).
- **RAG Híbrido:** Búsqueda semántica + Geoespacial (pgvector + PostGIS).
- **Seguridad:** Nivel 20,000 (WAF, Anti-Scam, Rate-limiting, RBAC).
- **Monetización:** Boosts, Featured, Pins, Verified Badges (PayPal/Mercado Pago).

## 2. Feature Map Inicial (Radar Nivel Dios)

| Feature ID | Dominio | Estado | Flag | UI Entrypoint | Action | Endpoint | Tabla/Servicio |
|------------|---------|--------|------|---------------|--------|----------|----------------|
| F-GEO-NEARBY| ALL | BETA | `FLAG_GEO` | `/search?near=true` | `getNearbyItems` | `/api/geo/search` | `locations` / PostGIS |
| F-IMG-ZOOM | ALL | BETA | `FLAG_ZOOM` | `ProductGallery.tsx` | N/A (Client) | N/A | S3 / CDN |
| F-AR-PASS | ASSETS/AUTO | OFF | `FLAG_AR` | `/view/360` | `loadModel` | `/api/assets/3d` | `media_assets` |
| F-PAY-MX | ALL | STABLE | `FLAG_PAY` | `/checkout` | `createPayment` | `/api/pay/init` | `transactions` |
| F-MOD-AI | ALL | STABLE | `FLAG_MOD` | `Upload.tsx` | `validateMedia` | `/api/mod/check` | `audit_logs` |

## 3. Plan P0: Ejecución Inmediata (3 Horas para MX)

### Paso 1: Wiring del 80% Huérfano
- **Archivos:** `shared/registry/feature-flags.ts`, `frontend/src/actions.ts`, `backend/src/apiClient.ts`.
- **Acción:** Registrar todas las features detectadas por el Radar. Mapear botones muertos a sus respectivos `actions.ts`.

### Paso 2: F-GEO-NEARBY (Core Search)
- **Archivos:** `backend/src/services/geo.service.ts`, `shared/types/geo.d.ts`.
- **Solución:** Implementar `fuzzy location` usando un grid de 500m para privacidad. Conectar con `pgvector` para que el RAG priorice cercanía + relevancia.

### Paso 3: Seguridad Blindada
- **Archivos:** `backend/src/middleware/security.ts`, `backend/src/utils/anti-scam.ts`.
- **Solución:** Implementar `request fingerprinting` y `honeypot fields` en todos los formularios de contacto/registro.

## 4. Matriz de Seguridad (Capas de Defensa)

| Capa | Tecnología | Qué Bloquea |
|------|------------|-------------|
| L7 (App) | Clerk + RBAC | Acceso no autorizado / Escalada de privilegios |
| L4/L3 (Net) | Cloud Armor / WAF | DDoS, SQLi, XSS, Bot Scraping |
| Data | RLS (Supabase) | Filtrado de datos entre usuarios (Multi-tenant) |
| Heurística | Custom AI Mod | Scams, Spam, Contenido Prohibido |

## 5. Plan de Deploy (Google Cloud Run)
1. `docker build -t gcr.io/match-autos/backend ./backend`
2. `docker build -t gcr.io/match-autos/frontend ./frontend`
3. `gcloud run deploy match-backend --image gcr.io/match-autos/backend --env-vars-file .env.prod`
4. Configurar **CORS_ALLOW_ORIGINS** para `https://www.match-autos.com`.

## 6. Lista "NO TOCAR"
- `shared/auth/clerk-config.ts` (Configuración de identidad crítica).
- `backend/db/migrations/001_initial_schema.sql` (Base de datos core).
- `infra/terraform/*` (Si existe, para evitar desajustes de red).

---
**Instrucciones para DeepSeek:** Generar código basado en los paths y lógica definida en la sección 3.
**Instrucciones para Antigravity:** Ejecutar despliegue siguiendo la sección 5 después de validar tests locales.
