# 💎 Trinity Diamond - Plan Maestro 10x (MIT Senior Engineer Edition)
**Arquitecto:** Flight Director | **Status:** Mission Control Ready | **Target:** www.match-autos.com

## 1. Resumen Ejecutivo (Análisis 10x)
- **Diagnóstico:** El 80% de la lógica existe en el backend (`Hono/Edge`), pero está "huérfana" en el frontend.
- **Arquitectura:** Consolidación de 3 UIs (Auto, Marketplace, Assets) bajo un **Registry de Features** centralizado.
- **Seguridad:** Implementación de `honeypotTrap`, `EdgeCacheSupercharger` y `OnChainReputation`.
- **Monetización:** Activación de pasarelas PayPal/Mercado Pago para Boosts y Featured Listings.

## 2. Feature Map Consolidado (Radar Nivel Dios)

| Feature ID | Dominio | Estado Actual | Solución Arquitectónica | Flag |
| :--- | :--- | :--- | :--- | :--- |
| **F-GEO-NEARBY** | ALL | Orphan | Integrar `geo-fencing.controller.ts` con MapLibre en el Hero. | `FLAG_GEO` |
| **F-IMG-ZOOM** | ALL | Draft | Implementar `ProductGallery.tsx` con soporte HD y video MP4. | `FLAG_ZOOM` |
| **F-AR-PASS** | ASSETS/AUTO | Stub | Cablear placeholders de `_features_10x` a Three.js/WebXR. | `FLAG_AR` |
| **F-MOD-AI** | ALL | Draft | Conectar `AIOrchestrator` con Hugging Face API para moderación. | `FLAG_MOD` |
| **F-PAY-MX** | ALL | Wired (Mock) | Conectar `/api/payments/create-intent` a PayPal/MP SDKs. | `FLAG_PAY` |

## 3. Plan P0: Ejecución Inmediata (3 Horas para MX)

### Paso 1: Sincronización de Registry (Wiring)
- **Archivos:** `frontend/shared/core/features.ts`, `backend/src/index.ts`.
- **Acción:** Registrar las 900+ features. Mapear los botones detectados en `feature-audit-report.json` a las `actions.ts` reales.

### Paso 2: Core RAG Híbrido + Geo
- **Archivos:** `backend/src/services/rag.service.ts`, `backend/src/controllers/search.controller.ts`.
- **Solución:** Implementar el endpoint `/api/rag/search?domain=&q=&lat=&lng=&radiusKm=` usando `pgvector` para semántica y `PostGIS` para radio geoespacial.

### Paso 3: Seguridad Blindada Nivel 20,000
- **Archivos:** `backend/src/middleware/security.ts`, `backend/src/utils/honeypot.ts`.
- **Solución:** Activar `honeypotTrap` en rutas críticas (`/wp-admin`, `/.env`) y `request fingerprinting` para bloquear scrapers y bots.

## 4. Matriz de Seguridad (Capas de Defensa)

| Capa | Tecnología | Qué Bloquea |
| :--- | :--- | :--- |
| **Identidad** | Clerk + RBAC | Acceso no autorizado y escalada de privilegios. |
| **Red** | Cloudflare WAF | DDoS, SQLi, XSS y ataques de fuerza bruta. |
| **Datos** | Supabase RLS | Fuga de datos entre dominios (Auto/Market/Assets). |
| **Heurística** | AI Moderation | Scams, spam y contenido prohibido (NSFW). |

## 5. Plan de Deploy (Google Cloud Run)
1. **Local Test:** `docker-compose up --build` (Validar conexión Backend-Frontend).
2. **Build:** `docker build -t gcr.io/match-autos/trinity-diamond .`
3. **Push & Deploy:** `gcloud run deploy match-autos --image gcr.io/match-autos/trinity-diamond --env-vars-file .env.prod`.
4. **DNS:** Apuntar `www.match-autos.com` al balanceador de carga de Google Cloud.

## 6. Instrucciones para Agentes (DeepSeek & Antigravity)
- **DeepSeek:** Generar el código de los archivos listados en la Sección 3 siguiendo el patrón `UI → actions.ts → apiClient.ts → backend`.
- **Antigravity:** Acomodar la estructura de carpetas según el mono-repo y ejecutar el despliegue al 100% tras pasar los smoke tests.

---
**Lista "NO TOCAR":** `backend/src/index.ts` (Core Orchestrator), `Supabase RLS Policies`.
**Rollback Plan:** `git revert HEAD` + `gcloud run services update-traffic --to-revisions=LATEST=0,PREVIOUS=100`.
