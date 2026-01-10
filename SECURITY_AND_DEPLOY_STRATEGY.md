# 🛡️ Security & Deployment Strategy - Match-Autos.com
**Architect:** Flight Director | **Level:** 20,000 Blindado

## 1. Matriz de Seguridad (Capas de Defensa)
| Capa | Tecnología | Función |
| :--- | :--- | :--- |
| **WAF** | Cloudflare / Cloud Armor | Bloqueo de DDoS, SQLi, XSS y Bot Scraping. |
| **Auth** | Clerk + RBAC | Gating estricto para Admin/Master Admin. |
| **Data** | Supabase RLS | Aislamiento total de datos entre dominios. |
| **Heurística** | Custom AI Mod | Detección de Scams, Spam y contenido NSFW. |
| **Honeypot** | `honeypotTrap` | Captura de scrapers en rutas como `/.env` y `/wp-admin`. |

## 2. Estrategia de Despliegue (Live Launch)
### Fase 1: Local & Smoke Tests (T-Minus 2h)
- `docker-compose up --build`
- Validar conexión `UI -> Action -> API -> DB`.
- Ejecutar `scripts/smoke-test.sh`.

### Fase 2: Google Cloud Run (T-Minus 1h)
- **Build:** `gcloud builds submit --tag gcr.io/match-autos/trinity-diamond`.
- **Deploy:** `gcloud run deploy match-autos --image gcr.io/match-autos/trinity-diamond --env-vars-file .env.prod`.
- **CORS:** Configurar para permitir únicamente `https://www.match-autos.com`.

### Fase 3: Global Rollout (T-Plus 3 days)
- Escalar instancias en regiones LATAM, EU y CAN.
- Activar CDN Edge Caching para assets pesados (3D/360).

## 3. Plan de Rollback
- **Instant Revert:** `gcloud run services update-traffic --to-revisions=PREVIOUS=100`.
- **DB Safety:** Snapshots automáticos cada 6 horas en Supabase.
