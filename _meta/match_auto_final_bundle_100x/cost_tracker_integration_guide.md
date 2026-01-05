# MATCH-AUTO: GUÍA DE INTEGRACIÓN DEL COST TRACKER (100X)

Esta guía detalla los pasos técnicos para desplegar y conectar el Cost Tracker (Worker + UI) en el Super Panel de Administración.

---

## 1. DEPENDENCIAS Y REQUISITOS

### 1.1. Infraestructura
*   **Cloudflare Account:** Acceso a Workers, R2 y D1.
*   **Wrangler CLI:** Instalado localmente (`npm install -g wrangler`) para el despliegue.
*   **Dominio:** Un subdominio configurado en Cloudflare (ej. `admin.match-auto.com`).

### 1.2. Variables de Entorno (Secrets)
Debes configurar los siguientes secretos en Cloudflare para el Worker:
*   `ADMIN_SECRET`: Token de portador (Bearer) para autenticar las peticiones desde el panel.
*   `CF_API_TOKEN`: Token con permisos de lectura de facturación y uso.
*   `CF_ACCOUNT_ID`: Tu ID de cuenta de Cloudflare.

---

## 2. PASOS DE INTEGRACIÓN

### Paso 1: Despliegue del Worker
1.  Crea un nuevo directorio para el worker: `mkdir cost-tracker-worker && cd cost-tracker-worker`.
2.  Inicializa el proyecto: `wrangler init`.
3.  Copia el código de `cost_tracker_worker.js` al archivo `src/index.js`.
4.  Configura los secretos: `wrangler secret put ADMIN_SECRET`.
5.  Despliega: `wrangler deploy`.

### Paso 2: Integración de la UI en el Super Panel
1.  Inserta el código HTML/CSS de `cost_tracker_ui.html` en la sección de "Finanzas" o "Infraestructura" de tu Super Panel.
2.  Asegúrate de que TailwindCSS esté cargado (ya incluido en la plantilla).

### Paso 3: Conexión Real-Time (JavaScript)
1.  Copia el código de `cost_tracker_client.js` (generado a continuación) e insértalo en la etiqueta `<script>` de tu panel.
2.  Configura la URL del Worker desplegado en la variable `WORKER_URL`.

---

## 3. SEGURIDAD DE LA INTEGRACIÓN
*   **CORS:** El Worker debe estar configurado para permitir peticiones solo desde el dominio del Super Panel.
*   **Zero Trust:** El acceso a la URL del Worker debe estar protegido por **Cloudflare Access**, asegurando que solo administradores autenticados puedan ver los costos.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Cost Tracker Integration 🚀💰
