# 🌌 DEEPSEEK OMEGA INSTRUCTIONS: GENERACIÓN TOTAL 1000x

Socio Deepseek, hemos llegado a la fase final de construcción. El esqueleto está completo, la seguridad activa y el corazón viral latiendo. Ahora necesito que generes los **archivos maestros** para los puntos críticos que faltan.

## 🎯 DIRECTORIO DE MISIÓN: ARCHIVOS REQUERIDOS

### 💰 SISTEMA DE PAGOS (ROADMAP #11, #13)
- **`backend/src/routes/payments/checkout.ts`**: Endpoint que genere el `preference_id` de Mercado Pago o la `Session` de Stripe. Debe incluir webhooks de confirmación.
- **`backend/src/services/payments/paymentService.ts`**: Lógica para actualizar el estado de los listings (`isFeatured`, `isVP`) tras el éxito del pago.
- **`src/hooks/usePayments.ts`**: Hook para manejar el ciclo de vida del checkout en el frontend.

### 💬 COMUNICACIÓN REAL-TIME (ROADMAP #14)
- **`backend/src/routes/chat/messages.ts`**: Endpoints para enviar/recibir mensajes y listar conversaciones.
- **`backend/src/services/chat/chatService.ts`**: Lógica de almacenamiento de mensajes en D1 y notificaciones push.
- **`src/hooks/useChat.ts`**: Hook que maneje el estado local del chat y opcionalmente WebSockets (Cloudflare Durable Objects).

### 🤖 INTELIGENCIA ARTIFICIAL (ROADMAP #6, #9)
- **`backend/src/services/aiService.ts`**: Conexión con Hugging Face para:
  1. Sugerencia automática de precios.
  2. Moderación de imágenes (detección de contenido inapropiado).
- **`src/hooks/useAISuggestions.ts`**: Hook para mostrar sugerencias inteligentes al vendedor.

### 🛡️ INFRAESTRUCTURA & SEGURIDAD (ROADMAP #1, #5, #12)
- **`backend/src/middleware/auth.ts`**: Middleware de autenticación Clerk robusto para proteger rutas sensibles.
- **`src/components/features/admin/AffiliateDashboard.tsx`**: Panel premium para que los afiliados rastreen sus comisiones.
- **`src/components/features/social/ImpactTracker.tsx`**: Componente visual que muestre el 3% de impacto social (Refugios de Animales).

## ⚠️ REGLAS BEYOND-10x
1. **Durable Objects**: Para el chat, asume que estamos en Cloudflare y usa lógica compatible con Durable Objects si es posible.
2. **PostgreSQL Sharding**: Traduce esto en lógica de consultas optimizadas para Supabase.
3. **NASA Quality Control**: No se aceptan errores de tipos. Cada `interface` debe ser exportada y clara.
4. **Performance Absolute**: Usa técnicas de `Optimistic Updates` en el chat y los pagos para latencia percibida cero.

¡Adelante, Deepseek! Convierte estos puntos en el código que cerrará el círculo de **Match-Auto**. 🚀🏁
