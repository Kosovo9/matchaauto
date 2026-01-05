# MATCH-AUTO: CONFIGURACIÓN ZERO TRUST & DURABLE OBJECTS (100X)

Esta guía detalla la implementación técnica para blindar el acceso y asegurar la sincronización al milisegundo del Dashboard de Alertas.

---

## 1. CONFIGURACIÓN CLOUDFLARE ZERO TRUST

### 1.1. Acceso Condicional (Cloudflare Access)
1.  **Dashboard:** Ve a Zero Trust > Access > Applications.
2.  **Add Application:** Selecciona "Self-hosted".
3.  **Domain:** Configura el subdominio de tu dashboard (ej. `admin-alerts.match-auto.com`).
4.  **Policies:** 
    *   **Action:** Allow.
    *   **Include:** Emails específicos o grupos de IdP (Okta, Google, etc.).
    *   **Require:** Autenticación de dos factores (2FA) obligatoria.

### 1.2. Túnel Seguro (Cloudflare Tunnel)
Usa `cloudflared` para conectar tu servidor de administración (si no es Pages) de forma privada sin abrir puertos públicos:
```bash
cloudflared tunnel create match-auto-admin
cloudflared tunnel route dns match-auto-admin admin-alerts.match-auto.com
```

---

## 2. IMPLEMENTACIÓN DE DURABLE OBJECTS (REAL-TIME)

Los **Durable Objects** permiten mantener un estado global y conexiones WebSocket persistentes en el Edge.

### 2.1. Clase del Durable Object (`AlertState.js`)
```javascript
export class AlertState {
  constructor(state, env) {
    this.state = state;
    this.sessions = []; // Almacena conexiones WebSocket activas
  }

  async fetch(request) {
    const upgradeHeader = request.headers.get("Upgrade");
    if (upgradeHeader !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const [client, server] = new WebSocketPair();
    this.sessions.push(server);
    server.accept();

    server.addEventListener("message", msg => {
      // Lógica para difundir alertas a todos los clientes conectados
      this.broadcast(msg.data);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(message) {
    this.sessions.forEach(s => s.send(message));
  }
}
```

### 2.2. Configuración en `wrangler.toml`
```toml
[durable_objects]
bindings = [{name = "ALERT_STATE", class_name = "AlertState"}]

[[migrations]]
tag = "v1"
new_classes = ["AlertState"]
```

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Zero Trust & Real-Time Edge 🛡️⚡
