# 🗺️ Match-Auto Unified Feature Map (The 1000x Discovery)

Tras auditar el repositorio, he descubierto que el **80% de la funcionalidad "desaparecida"** ya tiene cimientos sólidos en el backend (controllers, services e infraestructura) pero está **huérfana** en el frontend o desacoplada de la estructura central.

## 1. Módulos Detectados y Estado

| Feature ID | Dominio | Estado | Archivos Clave | Acción Requerida |
| :--- | :--- | :--- | :--- | :--- |
| `ads.plans` | Common | **Wired (Mock)** | `ads.controller.ts` | Conectar a pasarela de pagos real. |
| `geo.fencing` | Assets | **Orphan** | `geo-fencing.controller.ts` | Integrar con MapLibreView en frontend. |
| `ai.dynamic_pricing`| Auto | **Orphan** | `dynamic-pricing.controller.ts` | Añadir badge de "Precio IA" en tarjetas. |
| `comm.messaging` | Common | **Stub** | `quantum-chat.tsx` | Crear endpoints en Hono para persistencia. |
| `ai.moderation` | Common | **Draft** | `_features_10x/...` | Implementar `moderation.service.ts` real. |
| `assets.escrow` | Assets | **Draft** | `ads.controller.ts:escrow` | Flujo de validación para montos > 5M MXN. |
| `auto.vin_decoder` | Auto | **Placeholder**| `vehicle.controller.ts` | Integrar API externa de VIN. |

## 2. Plan de Implementación por Módulos (Feature Registry)

Para evitar que el código se vuelva "Frankenstein", usaremos el **Feature Registry** ya creado en `frontend/shared/core/features.ts`.

### Fase P0: Monetización y Confianza (ROI Directo)
1.  **Módulo Ads/Boost**: Habilitar en Dashboard la compra de "Featured" y "Hot" badges usando el endpoint `/api/ads/plans`.
2.  **Módulo Antifraude/Moderación**: Crear `backend/src/services/ai/moderation.service.ts` para escaneo de imágenes en el upload.
3.  **Módulo Messaging**: Conectar el `QuantumChat.tsx` huérfano a un nuevo `backend/src/controllers/chat.controller.ts`.

### Fase P1: WOW Factor (Diferenciadores)
1.  **360º & VR**: Cablear los placeholders de `_features_10x` a las páginas de listing.
2.  **Geofencing Real**: Notificaciones por ubicación cuando un usuario guarda una búsqueda ("Want to Buy" matching).

### Fase P2: Automatización (Scale)
1.  **OCR de Placas/VIN**: Integrar servicios de visión artificial para auto-llenado de datos.

## 3. Acciones Inmediatas (Hoy)
- [x] **Setup Trinity DB**: pgvector + PostGIS activos.
- [x] **Trinity Endpoints**: /featured, /search, /rag activos y reales.
- [ ] **Wiring de Botones Muertos**: Conectar los botones de `feature-audit-report.json` a las `actions` correspondientes.
- [ ] **Dashboard Hubs**: Revivir la página de control de geocercas y activos.
