# Protocolo de Respuesta a Incidentes (IRP) - Sentinel X

## 1. Clasificación de Alertas
| Nivel | Descripción | Acción Automática |
|-------|-------------|-------------------|
| **CRÍTICO** | Múltiples fallos de firma / Ataque XSS | Bloqueo IP + Notificación Owner |
| **ALTO** | Scraper detectado en Honeypot | Ban permanente en KV/D1 |
| **MEDIO** | Rate limit excedido | Desaceleración silenciosa (2s delay) |

## 2. Acciones de Remediación
1. **IP Blacklisting**: `SentinelSecurity.blockIP(ip)`
2. **Account Suspension**: Si se detecta comportamiento de bot en cuenta autenticada.
3. **Emergency Brake**: `app.use('*', lockdownMiddleware)` si hay una brecha masiva.

## 3. Contacto de Emergencia
- **Comandante**: roberto27979 (Vía Push Alert)
- **AI SRE**: Antigravity Alpha (Auto-reparación activa)
