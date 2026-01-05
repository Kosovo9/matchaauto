# INSTRUCCIONES PARA DEEPSEEK: GENERACIÓN DE CÓDIGO MATCH-AUTO 1000X 🚀 (ULTIMATE BUNDLE EDITION)

Socio, hemos integrado el **Ultimate Bundle 100x**. Queremos que DeepSeek genere el código para el ecosistema completo de **Match-Auto**, incluyendo el nuevo **Admin Dashboard** y los **Specialized Workers**.

## 1. CONTEXTO TÉCNICO ACTUALIZADO
- **Backend:** Hono.js en Cloudflare Workers (Capa de Inteligencia y Seguridad).
- **Admin Dashboard:** Cloudflare Pages + Functions (PagerDuty Integration).
- **Frontend:** Next.js 15 (RSC) + TailwindCSS 4.0.
- **Bases de Datos:** D1 (Cities/Cats), Supabase (Relational), KV (Threats/Cache).
- **Seguridad:** Sentinel-X (TII Logic) + Clerk Auth.

## 2. REGLAS DE ORO ACTUALIZADAS (100X)
1. **Zero Trust Admin:** El Dashboard de Alertas debe usar Cloudflare Access.
2. **Sentinel-X Integration:** Los Workers deben reportar al Sentinel-X Threat Intensity Index (TII).
3. **Resiliencia Extrema:** Circuit Breaker en cada integración (Solana, Clerk, HuggingFace).
4. **Caching Estratégico:** Uso de KV para balances de Solana y D1 para geo-consultas.

## 3. COMPONENTES CLAVE A GENERAR

### A. DASHBOARD DE ALERTAS (Admin)
- **`match-auto-admin/public/index.html`**: Interfaz premium para visualizar incidentes de PagerDuty y Sentinel-X.
- **`match-auto-admin/functions/api/alerts.js`**: Proxy seguro entre el Dashboard y la API de PagerDuty.

### B. SPECIALIZED WORKERS (Backend)
- **`sentinel_x_tii_worker.js`**: Motor de análisis de amenazas en tiempo real.
- **`cost_tracker_worker.js`**: Monitoreo de consumo de recursos y costos operativos.
- **`golden_metrics_worker.js`**: Tracking de K-Factor y crecimiento viral.

### C. CORE SERVICES (Refactor)
- **`src/services/CryptoWallet.ts`**: Integrar con el KV de Cache y el Circuit Breaker Manager.
- **`src/middleware/security.ts`**: Implementar el Sentinel Middleware que bloquee IPs basado en su Threat Score.

## 4. PROMPT MAESTRO PARA DEEPSEEK
> "Utilizando como base los documentos en `docs/ultimate_bundle/`, genera el código completo del componente [NOMBRE_COMPONENTE] siguiendo los estándares de **Match-Auto 1000x**. Asegúrate de que use Zod para validación, incluya manejo de errores con TraceID, y esté optimizado para latencia cero en el Edge."

---
**Objetivo Final:** Dominación global. Despliegue relámpago. Seguridad nivel Dios.
🚀 **¡A EJECUTAR!**
