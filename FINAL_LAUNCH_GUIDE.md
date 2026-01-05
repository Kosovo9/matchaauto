# 🚀 GUÍA DE LANZAMIENTO FINAL: MATCH-AUTO v1.0

Socio, estamos listos para encender los motores y poner a Match-Auto en órbita. Sigue estos pasos exactos para el deploy más limpio de la historia.

## 1. PREPARACIÓN DE SECRETOS (CLAVE)
Necesitamos configurar los secretos en la infraestructura de Cloudflare para que el backend funcione al 100%.

**Comando para el backend:**
```bash
cd backend
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put MP_ACCESS_TOKEN
npx wrangler secret put HF_TOKEN
```

## 2. DESPLIEGUE DEL BACKEND (Cloudflare Workers)
El corazón de la bestia se hospeda en el búnker de Cloudflare.
```bash
cd backend
npm run deploy
```
*Si es la primera vez, el CLI te pedirá crear la base de datos D1 y el espacio KV.*

## 3. DESPLIEGUE DEL FRONTEND (Vercel / Cloudflare Pages)
La cara visible con Next.js 15.
- Ve a [Vercel](https://vercel.com) o [Cloudflare Pages](https://dash.cloudflare.com).
- Importa el repositorio: `https://github.com/Kosovo9/Match-auto`.
- Configura las variables de entorno:
    - `NEXT_PUBLIC_API_URL`: URL de tu worker de Cloudflare (ej: `https://match-auto-api.tudominio.workers.dev`)
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Tu clave de Clerk.
    - `CLERK_SECRET_KEY`: Tu secreto de Clerk.

## 4. VERIFICACIÓN POST-LANZAMIENTO
Una vez desplegado, entra a tu URL y prueba:
1. **Beast Mode**: `Alt + Shift + B` (Debe activarse el overlay rojo).
2. **Ghost Negotiator**: Haz una oferta del 50% del precio en el "Test Lab" (Debe ser rechazada).
3. **AR Inspector**: Verifica que el visor 3D inicialice correctamente.

## 5. MODO IMPERIO ACTIVADO
Match-Auto ya está en la red. A partir de ahora, Sentinel X protegerá la nave y el K-Factor empezará a traer usuarios.

---
**ESTADO: READY FOR TAKEOFF** 🛰️🏁
