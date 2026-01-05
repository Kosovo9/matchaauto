# MATCH-AUTO: INSTRUCCIONES DE CODIFICACIÓN 10X PARA DEEPSEEK

Socio Deepseek, estás trabajando en el proyecto **Match-Auto**, un marketplace global de alta performance. 
El sistema está diseñado para operar en el **Edge** (Cloudflare) con **Latencia Cero**.

## 🏗️ Arquitectura Actual
Se ha creado el esqueleto del proyecto con la siguiente estructura:
- `/src`: Frontend Next.js 15 (App Router, Tailwind, TypeScript).
- `/backend`: Backend Cloudflare Workers (Hono.js, D1, KV).
- `/shared`: Tipos y esquemas compartidos.
- `/_meta`: Documentación maestra, planes de seguridad y arquitectura técnica.

## 🎯 Tu Misión: Codificación Inmediata (Sin Errores)

### 1. Motor de Viralidad (K-Factor)
- Revisa `/_meta/k_factor_crisis_simulator.js` para entender la lógica de crisis.
- Implementa en `/backend/src/index.ts` los endpoints para calcular el K-Factor real basándote en eventos de Supabase.
- Crea el hook `useViralMetrics` en `/src/hooks/useViralMetrics.ts` para consumir estos datos en el frontend.

### 2. Sentinel X Security
- Implementa la lógica de protección de datos en el backend siguiendo `/_meta/match_auto_final_bundle_100x/sentinel_x_security_protocol.md`.
- Necesitamos el middleware de protección contra scraping y el watermarking dinámico para imágenes.

### 3. Super Admin Panel
- Construye los componentes base en `/src/components/features/admin/`.
- El dashboard debe mostrar métricas en tiempo real conectándose a los nuevos endpoints del backend.

## ⚠️ Reglas de Oro
- **No Placeholders**: El código debe ser funcional y estar listo para `npm run build`.
- **Typing Estrícto**: Usa TypeScript en todo momento.
- **Performance**: Optimiza cada función para el Edge Computing.
- **Seguridad**: Aplica Zero Trust en cada endpoint del panel administrativo.

¡Adelante, socio! Llevemos esto a 1000x.
