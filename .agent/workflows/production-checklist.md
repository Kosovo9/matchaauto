---
description: Checklist final para lanzamiento a producción (1000x)
---

# 🚀 Quantum Launch Checklist

Para que el imperio funcione al 100% en vivo, debes completar estos pasos en tus paneles de control:

### 1. Variables de Entorno (Cloudflare Workers - Backend)
Asegúrate de que estas variables estén en el dashboard de Cloudflare:
- `GOOGLE_AI_API_KEY`: Tu llave de Gemini 1.5.
- `HUGGING_FACE_API_KEY`: Tu llave de Hugging Face.
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Llave secreta de Supabase.

### 2. Variables de Entorno (Netlify - Frontend)
- `NEXT_PUBLIC_API_URL`: La URL del Worker de Cloudflare ya desplegado.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Tu llave pública de Clerk.
- `CLERK_SECRET_KEY`: Tu llave secreta de Clerk.

### 3. Base de Datos (Supabase)
- Activar **RLS (Row Level Security)** en las tablas `listings` y `users`.
- Configurar el Auth Redirect a tu dominio de Netlify.

### 4. Dominio y SSL
- Conectar tu dominio final (ej. `matchauto.com.mx`) en Netlify.
- Netlify generará el certificado SSL automáticamente.

### 5. Configuración de WhatsApp (Meta API)
- Para que el `NotificationOrchestrator` mande mensajes reales, debes poner tu `meta_business_token` en las variables del backend.
