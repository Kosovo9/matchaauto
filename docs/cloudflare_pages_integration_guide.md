# MATCH-AUTO: GUÍA DE INTEGRACIÓN CLOUDFLARE PAGES & WRANGLER (100X)

Esta guía detalla cómo desplegar el Dashboard de Alertas de PagerDuty como una aplicación estática en **Cloudflare Pages**, conectada a la lógica del Edge mediante **Wrangler**.

---

## 1. ESTRUCTURA DEL PROYECTO

Para un despliegue 100x optimizado, organizaremos el código de la siguiente manera:

```text
/match-auto-admin
├── /public
│   └── index.html (Tu pagerduty_alerts_dashboard.html)
├── /functions
│   └── api/alerts.js (Lógica del Edge para obtener alertas)
├── wrangler.toml (Configuración de despliegue)
└── package.json
```

---

## 2. DESPLIEGUE CON CLOUDFLARE PAGES

### Paso 1: Preparación del Frontend
1.  Renombra `pagerduty_alerts_dashboard.html` a `index.html` y colócalo en la carpeta `/public`.
2.  Asegúrate de que las llamadas a la API en el script de `index.html` apunten a los endpoints relativos de `/api/alerts`.

### Paso 2: Lógica del Edge (Functions)
Crea el archivo `functions/api/alerts.js` para manejar la comunicación segura con PagerDuty desde el Edge:

```javascript
export async function onRequest(context) {
  const { env } = context;
  
  // 1. Seguridad: Validar acceso (Cloudflare Access o Token)
  // 2. Fetch a PagerDuty API
  const response = await fetch("https://api.pagerduty.com/incidents", {
    headers: {
      "Authorization": `Token token=${env.PAGERDUTY_API_KEY}`,
      "Accept": "application/vnd.pagerduty+json;version=2"
    }
  });
  
  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}
```

### Paso 3: Despliegue con Wrangler
Ejecuta los siguientes comandos para subir tu dashboard al imperio de Cloudflare:

```bash
# Inicializar el proyecto de Pages
npx wrangler pages project create match-auto-admin

# Desplegar la carpeta public y las funciones
npx wrangler pages deploy public
```

---

## 3. OPTIMIZACIÓN 100X REAL

### 3.1. Cloudflare Access (Zero Trust)
No protejas el dashboard con un simple login. Usa **Cloudflare Access** para requerir autenticación de equipo (Google Workspace, GitHub, etc.) antes de que siquiera se cargue el primer byte del dashboard. Esto es seguridad nivel Dios.

### 3.2. Cache Purge Instantáneo
Configura un **Deploy Hook** para que, cada vez que Sentinel-X detecte una crisis, el dashboard se actualice e invalide la caché del Edge en milisegundos, asegurando que siempre veas la verdad absoluta.

### 3.3. WebSockets con Durable Objects
Para una actualización al milisegundo sin hacer polling, migra la lógica de alertas a **Cloudflare Durable Objects**. Esto permitirá que el dashboard reciba "pushes" de alertas instantáneos, eliminando cualquier lag.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Cloudflare Native Deployment 🚀💻🛡️
