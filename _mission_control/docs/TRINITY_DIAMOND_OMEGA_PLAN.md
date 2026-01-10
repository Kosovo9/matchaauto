# 💎 Trinity Diamond Omega Plan (MIT Senior Engineer Edition)
**Arquitecto:** Flight Director | **Status:** Mission Control Ready | **Target:** www.match-autos.com

## 1. Resumen Ejecutivo (Análisis 10x)
- **Visión:** Unificación de 3 ecosistemas (AUTO, MARKETPLACE, ASSETS) bajo un solo backend (Hono/Edge) y una arquitectura de seguridad blindada nivel 20,000.
- **Core Tech:** RAG Híbrido (pgvector + PostGIS), WebXR (AR/360/3D), Clerk (Auth), Supabase (DB).
- **Monetización:** Lanzamiento en MX con PayPal y Mercado Pago (Boosts/Featured).
- **Estrategia:** "Descubrir, Mapear, Conectar". Revivir el 80% de features huérfanas mediante el Feature Radar.

## 2. Feature Radar 'Nivel Dios' (Mapeo 900+ Features)

| Feature ID | Dominio | Estado | Flag | UI Entrypoint | Action | Endpoint |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F-GEO-NEARBY** | ALL | BETA | `media.geoNearby` | `/search?near=true` | `getNearbyItems` | `/api/geo/search` |
| **F-IMG-ZOOM** | ALL | STABLE | `media.imageZoom` | `ProductGallery.tsx` | N/A | N/A |
| **F-AR-PASS** | ASSETS/AUTO | BETA | `media.arPass` | `/view/360` | `loadModel` | `/api/listings/:id/media` |
| **F-MOD-AI** | ALL | STABLE | `media.modAI` | `Upload.tsx` | `validateMedia` | `/api/ai/moderate` |
| **F-PAY-MX** | ALL | STABLE | `media.payMX` | `/checkout` | `createPayment` | `/api/payments/create-intent` |

### Pipeline de Assets Media:
- **Imágenes:** HD con Zoom Amazon-like.
- **360:** Viewer equirectangular WebGL.
- **3D:** Modelos GLB con Three.js.
- **AR:** WebXR opcional (Gating: `navigator.xr` + `immersive-ar`).

## 3. Estrategia Offline y Sincronización
- **Offline Real:**
  - **Caché de Búsqueda:** Almacenamiento local de resultados recientes.
  - **Drafts:** Guardado local de publicaciones y mensajes.
  - **Media:** Caché de modelos GLB y fotos HD para visualización sin red.
- **Sincronización (Conflict Policy):**
  - **Last-Write-Wins:** Para metadatos de listings.
  - **Queue Sync:** Cola de mensajes y publicaciones que se disparan al detectar conexión.
  - **Storage:** IndexedDB para assets pesados y LocalStorage para flags/preferencias.

## 4. Configuración Maestra para DeepSeek (Prompt 10x)

### Instrucciones de Implementación:
> "Actúa como Senior Engineer. Implementa el sistema 'Trinity Diamond' conectando el 80% de features huérfanas.
> 1. **Backend:** Crear endpoint `GET /api/listings/:id/media` con soporte para images[], videos[], tours360[], model3d_glb_url.
> 2. **Frontend:** Implementar `MediaGallery` (Zoom), `Viewer360` (WebGL), `Viewer3D` (Three.js) y `ARButton` (WebXR).
> 3. **Seguridad:** Activar `honeypotTrap` y `EdgeCacheSupercharger`.
> 4. **Registry:** No inyectar código en UI sin pasar por `shared/core/features.ts`."

## 5. Matriz de Seguridad (Capas de Defensa)
- **L7:** Clerk + RBAC (Gating Admin/Master).
- **L4:** Cloudflare WAF + Rate-limiting + Bot Management.
- **Data:** Supabase RLS (Aislamiento de dominios).
- **Anti-Scam:** Heurísticas de reputación y límites de contacto.

## 6. Plan de Despliegue (Google Cloud Run)
1. **Local:** `docker-compose up` + Smoke Tests.
2. **Build:** Docker multi-stage para optimizar el Edge Runtime.
3. **Deploy:** `gcloud run deploy` en la región `us-central1` (baja latencia para MX).
4. **Domain:** Configurar SSL y DNS para `https://www.match-autos.com`.

---
**Lista "NO TOCAR":** `backend/src/index.ts`, `Supabase RLS Policies`.
**Rollback:** `git revert HEAD` + Redirección de tráfico en Cloud Run.
