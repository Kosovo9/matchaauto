# MATCH-AUTO: GUÍA DE DESPLIEGUE SENTINEL-X (100X)

Esta guía detalla cómo poner en marcha el cerebro de seguridad de Match-Auto en Cloudflare.

---

## 1. CONFIGURACIÓN DEL WORKER
1.  **Despliegue:** Usa `wrangler deploy sentinel_x_tii_worker.js`.
2.  **Routes:** Configura el Worker para que intercepte todas las peticiones a la API: `api.match-auto.com/*`.

---

## 2. CONEXIÓN CON EL WAF Y RATE LIMITING
Para que Sentinel-X sea efectivo, debe trabajar en conjunto con las herramientas nativas de Cloudflare:

### 2.1. Cloudflare WAF (Web Application Firewall)
*   **Managed Rules:** Activar el conjunto de reglas "Cloudflare Managed" y "OWASP" en modo "Block".
*   **Custom Rules:** Crear una regla que bloquee cualquier petición donde el header `X-Sentinel-X-Status` sea `Challenge-Required`.

### 2.2. Rate Limiting Estricto
Configurar en el dashboard de Cloudflare:
*   **Umbral:** 50 peticiones en 10 segundos por IP.
*   **Acción:** Bloqueo por 1 hora si se excede el umbral.
*   **Excepción:** IPs de confianza (Googlebot, etc.) y usuarios con sesión activa de Clerk (validada por JWT).

---

## 3. MONITOREO DE LÍMITES
*   **Logpush:** Configurar el envío de logs de Workers a un bucket de R2 para auditoría forense en caso de ataque masivo.
*   **Health Checks:** Configurar alertas si el Worker de Sentinel-X experimenta un aumento en el tiempo de ejecución (>50ms).

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Sentinel-X Deployment 🛡️🚀
