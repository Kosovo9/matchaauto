# 🚀 INSTRUCCIONES ADICIONALES PARA DEEPSEEK: SISTEMAS COMPLEMENTARIOS

**Proyecto**: MatchaAuto - Sistemas Avanzados  
**Objetivo**: Generar instrucciones para 3 sistemas complementarios críticos  
**Stack**: Node.js + TypeScript + PostgreSQL + Redis + WebSockets

---

## 📋 SISTEMAS A GENERAR

### 1. SISTEMA DE PAGOS (Stripe Integration)
### 2. SISTEMA DE REAL-TIME MATCHING (AI + WebSockets)
### 3. SISTEMA DE NOTIFICACIONES (Push + Email + SMS)

---

## 🏦 SISTEMA 1: PAGOS (STRIPE INTEGRATION)

### Descripción

Sistema de pagos integrado con Stripe que permite:
- Pagos seguros con tarjeta de crédito
- Billetera digital
- Escrow automático
- Reembolsos
- Facturación
- Reportes de transacciones

### Archivos a Generar (12 archivos)

#### 1. `src/services/payment.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/payment.service.ts` que implemente la clase PaymentService con métodos para:
> - createPaymentIntent(amount, currency, metadata)
> - confirmPayment(paymentIntentId, paymentMethodId)
> - refundPayment(paymentIntentId, amount)
> - createCustomer(userId, email, name)
> - savePaymentMethod(customerId, paymentMethodId)
> - getPaymentHistory(userId)
> - createInvoice(transactionId, items)
> - getInvoice(invoiceId)
> 
> Incluye:
> - Integración con Stripe API
> - Manejo de errores
> - Logging
> - Validaciones
> - Caché de transacciones en Redis

#### 2. `src/services/escrow.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/escrow.service.ts` que implemente la clase EscrowService con métodos para:
> - createEscrow(buyerId, sellerId, amount, vehicleId)
> - releaseEscrow(escrowId)
> - holdEscrow(escrowId)
> - refundEscrow(escrowId, reason)
> - getEscrowStatus(escrowId)
> - getEscrowHistory(userId)
> 
> Incluye:
> - Estados de escrow (PENDING, HELD, RELEASED, REFUNDED)
> - Validaciones
> - Logging
> - Notificaciones a compradores/vendedores

#### 3. `src/services/billing.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/billing.service.ts` que implemente la clase BillingService con métodos para:
> - calculateCommission(amount, type)
> - createBillingRecord(transactionId, amount, commission)
> - generateInvoice(billingId)
> - sendInvoice(billingId, email)
> - getMonthlyReport(userId, month)
> - getAnnualReport(userId, year)
> 
> Incluye:
> - Cálculo de comisiones (8-15% según tipo)
> - Generación de PDFs
> - Envío de emails
> - Reportes

#### 4. `src/controllers/payment.controller.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/controllers/payment.controller.ts` con controladores para:
> - POST /api/payments/create-intent
> - POST /api/payments/confirm
> - POST /api/payments/refund
> - GET /api/payments/history
> - POST /api/payments/methods
> - GET /api/payments/methods
> - DELETE /api/payments/methods/{id}
> - GET /api/payments/invoices/{id}
> 
> Incluye:
> - Validación con Zod
> - Autenticación JWT
> - Manejo de errores
> - Logging

#### 5. `src/controllers/escrow.controller.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/controllers/escrow.controller.ts` con controladores para:
> - POST /api/escrow/create
> - POST /api/escrow/{id}/release
> - POST /api/escrow/{id}/refund
> - GET /api/escrow/{id}/status
> - GET /api/escrow/history
> 
> Incluye:
> - Validación
> - Autenticación
> - Autorización
> - Manejo de errores

#### 6. `src/routes/payment.routes.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/routes/payment.routes.ts` que defina todas las rutas de pagos. Incluye:
> - POST /api/payments/create-intent
> - POST /api/payments/confirm
> - POST /api/payments/refund
> - GET /api/payments/history
> - POST /api/payments/methods
> - GET /api/payments/methods
> - DELETE /api/payments/methods/{id}
> - GET /api/payments/invoices/{id}
> 
> Con middleware de autenticación y validación.

#### 7. `src/routes/escrow.routes.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/routes/escrow.routes.ts` que defina todas las rutas de escrow. Incluye:
> - POST /api/escrow/create
> - POST /api/escrow/{id}/release
> - POST /api/escrow/{id}/refund
> - GET /api/escrow/{id}/status
> - GET /api/escrow/history
> 
> Con middleware de autenticación y validación.

#### 8. `src/config/stripe.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/stripe.ts` que configure Stripe. Incluye:
> - Inicialización de cliente Stripe
> - Configuración de webhooks
> - Manejo de eventos
> - Variables de entorno
> - Logging

#### 9. `src/webhooks/stripe.webhook.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/webhooks/stripe.webhook.ts` que maneje webhooks de Stripe. Incluye:
> - payment_intent.succeeded
> - payment_intent.payment_failed
> - charge.refunded
> - customer.subscription.updated
> - Validación de firmas
> - Logging

#### 10. `prisma/migrations/payments.sql`

**Instrucción para DeepSeek**:
> Genera un archivo `prisma/migrations/payments.sql` que cree las tablas de pagos:
> - payments (id, userId, amount, status, stripePaymentIntentId, etc.)
> - payment_methods (id, userId, stripePaymentMethodId, type, last4, etc.)
> - escrow (id, buyerId, sellerId, amount, vehicleId, status, etc.)
> - billing_records (id, transactionId, amount, commission, etc.)
> - invoices (id, billingId, number, pdf_url, etc.)
> 
> Con índices y relaciones.

#### 11. `tests/payment.test.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `tests/payment.test.ts` con tests para:
> - createPaymentIntent
> - confirmPayment
> - refundPayment
> - createEscrow
> - releaseEscrow
> - calculateCommission
> 
> Incluye casos de éxito, error y límite.

#### 12. `src/types/payment.types.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/types/payment.types.ts` con tipos TypeScript para:
> - Payment
> - PaymentMethod
> - Escrow
> - BillingRecord
> - Invoice
> - Transaction
> 
> Con documentación.

---

## 🤖 SISTEMA 2: REAL-TIME MATCHING (AI + WebSockets)

### Descripción

Sistema de matching en tiempo real que:
- Empareja compradores con vendedores automáticamente
- Usa IA para calcular compatibilidad
- Notifica en tiempo real con WebSockets
- Maneja preferencias y filtros
- Mantiene historial de matches

### Archivos a Generar (14 archivos)

#### 1. `src/services/matching.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/matching.service.ts` que implemente la clase MatchingService con métodos para:
> - calculateMatchScore(buyer, seller, vehicle)
> - findMatches(userId, preferences, limit)
> - rankMatches(matches)
> - createMatch(buyerId, sellerId, vehicleId, score)
> - acceptMatch(matchId)
> - rejectMatch(matchId, reason)
> - getMatchHistory(userId)
> - getActiveMatches(userId)
> 
> Incluye:
> - Algoritmo ML para scoring
> - Caché de matches en Redis
> - Validaciones
> - Logging

#### 2. `src/services/ai-matching.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/ai-matching.service.ts` que implemente la clase AIMatchingService con métodos para:
> - trainMatchingModel(trainingData)
> - predictMatchScore(buyer, seller, vehicle)
> - getFeatureImportance()
> - evaluateModelPerformance()
> - updateModel(newData)
> 
> Incluye:
> - Integración con TensorFlow.js o similar
> - Cálculo de features (precio, ubicación, preferencias, etc.)
> - Normalización de datos
> - Predicción de compatibilidad

#### 3. `src/services/websocket.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/websocket.service.ts` que implemente la clase WebSocketService con métodos para:
> - connectUser(userId, socket)
> - disconnectUser(userId)
> - broadcastMatch(match)
> - sendNotification(userId, notification)
> - getConnectedUsers()
> - getActiveConnections()
> 
> Incluye:
> - Manejo de conexiones
> - Broadcast de eventos
> - Manejo de desconexiones
> - Logging

#### 4. `src/controllers/matching.controller.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/controllers/matching.controller.ts` con controladores para:
> - POST /api/matching/find
> - GET /api/matching/active
> - GET /api/matching/history
> - POST /api/matching/{id}/accept
> - POST /api/matching/{id}/reject
> - GET /api/matching/stats
> 
> Incluye:
> - Validación
> - Autenticación
> - Manejo de errores

#### 5. `src/websocket/events.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/websocket/events.ts` que defina eventos WebSocket:
> - match:found
> - match:accepted
> - match:rejected
> - user:online
> - user:offline
> - notification:new
> - message:new
> 
> Con tipos y documentación.

#### 6. `src/websocket/handlers.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/websocket/handlers.ts` que maneje eventos WebSocket:
> - handleConnect(socket)
> - handleDisconnect(socket)
> - handleMatchFound(socket, data)
> - handleMatchAccepted(socket, data)
> - handleMatchRejected(socket, data)
> - handleMessage(socket, data)
> 
> Incluye:
> - Validación de datos
> - Logging
> - Manejo de errores

#### 7. `src/websocket/server.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/websocket/server.ts` que configure el servidor WebSocket. Incluye:
> - Inicialización de Socket.io
> - Namespaces
> - Rooms
> - Middleware
> - Eventos globales

#### 8. `src/routes/matching.routes.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/routes/matching.routes.ts` que defina rutas de matching:
> - POST /api/matching/find
> - GET /api/matching/active
> - GET /api/matching/history
> - POST /api/matching/{id}/accept
> - POST /api/matching/{id}/reject
> - GET /api/matching/stats
> 
> Con autenticación y validación.

#### 9. `prisma/migrations/matching.sql`

**Instrucción para DeepSeek**:
> Genera un archivo `prisma/migrations/matching.sql` que cree tablas:
> - matches (id, buyerId, sellerId, vehicleId, score, status, etc.)
> - match_history (id, matchId, action, timestamp, etc.)
> - user_preferences (id, userId, preferences_json, etc.)
> - match_stats (id, userId, matches_count, success_rate, etc.)
> 
> Con índices.

#### 10. `src/jobs/matching.job.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/jobs/matching.job.ts` que implemente jobs de matching:
> - runMatchingJob() - Ejecuta matching cada 5 minutos
> - cleanExpiredMatches() - Limpia matches expirados
> - updateMatchScores() - Actualiza scores
> - generateMatchStats() - Genera estadísticas
> 
> Incluye:
> - Bull queue
> - Scheduling
> - Logging

#### 11. `tests/matching.test.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `tests/matching.test.ts` con tests para:
> - calculateMatchScore
> - findMatches
> - rankMatches
> - createMatch
> - acceptMatch
> - rejectMatch
> 
> Incluye casos de éxito, error y límite.

#### 12. `src/types/matching.types.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/types/matching.types.ts` con tipos:
> - Match
> - MatchScore
> - UserPreferences
> - MatchStats
> - WebSocketEvent
> 
> Con documentación.

#### 13. `scripts/train-matching-model.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `scripts/train-matching-model.ts` que entrene el modelo de matching. Incluye:
> - Cargar datos de entrenamiento
> - Normalizar features
> - Entrenar modelo
> - Guardar modelo
> - Evaluar performance

#### 14. `src/config/websocket.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/websocket.ts` que configure WebSocket. Incluye:
> - Configuración de Socket.io
> - CORS
> - Autenticación
> - Eventos
> - Logging

---

## 🔔 SISTEMA 3: NOTIFICACIONES (Push + Email + SMS)

### Descripción

Sistema de notificaciones multi-canal que:
- Envía push notifications
- Envía emails
- Envía SMS
- Maneja preferencias de usuario
- Implementa rate limiting
- Mantiene historial

### Archivos a Generar (13 archivos)

#### 1. `src/services/notification.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/notification.service.ts` que implemente la clase NotificationService con métodos para:
> - sendNotification(userId, notification)
> - sendPushNotification(userId, title, body, data)
> - sendEmail(email, subject, template, data)
> - sendSMS(phone, message)
> - getNotificationHistory(userId)
> - markAsRead(notificationId)
> - deleteNotification(notificationId)
> - getUserPreferences(userId)
> - updatePreferences(userId, preferences)
> 
> Incluye:
> - Validaciones
> - Rate limiting
> - Logging
> - Caché

#### 2. `src/services/email.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/email.service.ts` que implemente la clase EmailService con métodos para:
> - sendWelcomeEmail(email, name)
> - sendVerificationEmail(email, token)
> - sendPasswordResetEmail(email, token)
> - sendTransactionEmail(email, transaction)
> - sendMatchNotificationEmail(email, match)
> - sendInvoiceEmail(email, invoice)
> - sendMonthlyReportEmail(email, report)
> 
> Incluye:
> - Integración con SendGrid/Mailgun
> - Templates HTML
> - Manejo de errores
> - Logging

#### 3. `src/services/sms.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/sms.service.ts` que implemente la clase SMSService con métodos para:
> - sendVerificationSMS(phone, code)
> - sendTransactionSMS(phone, message)
> - sendMatchNotificationSMS(phone, message)
> - sendAlertSMS(phone, message)
> 
> Incluye:
> - Integración con Twilio
> - Validación de números
> - Manejo de errores
> - Logging

#### 4. `src/services/push.service.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/services/push.service.ts` que implemente la clase PushService con métodos para:
> - registerDevice(userId, deviceToken, platform)
> - unregisterDevice(deviceToken)
> - sendPush(userId, title, body, data)
> - sendBroadcastPush(title, body, data, filter)
> - getDevices(userId)
> 
> Incluye:
> - Integración con Firebase Cloud Messaging
> - Manejo de tokens
> - Logging

#### 5. `src/controllers/notification.controller.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/controllers/notification.controller.ts` con controladores para:
> - GET /api/notifications
> - GET /api/notifications/{id}
> - POST /api/notifications/{id}/read
> - DELETE /api/notifications/{id}
> - GET /api/notifications/preferences
> - PUT /api/notifications/preferences
> - POST /api/devices/register
> - POST /api/devices/unregister
> 
> Incluye:
> - Validación
> - Autenticación
> - Manejo de errores

#### 6. `src/routes/notification.routes.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/routes/notification.routes.ts` que defina rutas:
> - GET /api/notifications
> - GET /api/notifications/{id}
> - POST /api/notifications/{id}/read
> - DELETE /api/notifications/{id}
> - GET /api/notifications/preferences
> - PUT /api/notifications/preferences
> - POST /api/devices/register
> - POST /api/devices/unregister
> 
> Con autenticación y validación.

#### 7. `src/jobs/notification.job.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/jobs/notification.job.ts` que implemente jobs:
> - sendPendingNotifications() - Envía notificaciones pendientes
> - cleanOldNotifications() - Limpia notificaciones antiguas
> - sendDailyDigest() - Envía resumen diario
> - sendWeeklyReport() - Envía reporte semanal
> 
> Incluye:
> - Bull queue
> - Scheduling
> - Logging

#### 8. `prisma/migrations/notifications.sql`

**Instrucción para DeepSeek**:
> Genera un archivo `prisma/migrations/notifications.sql` que cree tablas:
> - notifications (id, userId, type, title, body, read, etc.)
> - notification_preferences (id, userId, preferences_json, etc.)
> - devices (id, userId, deviceToken, platform, etc.)
> - notification_history (id, notificationId, status, etc.)
> 
> Con índices.

#### 9. `src/templates/email/` (Múltiples templates)

**Instrucción para DeepSeek**:
> Genera templates HTML de email en `src/templates/email/`:
> - welcome.html
> - verification.html
> - password-reset.html
> - transaction.html
> - match-notification.html
> - invoice.html
> - monthly-report.html
> 
> Todos con estilos CSS inline y responsive.

#### 10. `src/config/email.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/email.ts` que configure email. Incluye:
> - Configuración de SendGrid/Mailgun
> - Variables de entorno
> - Plantillas
> - Logging

#### 11. `src/config/sms.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/config/sms.ts` que configure SMS. Incluye:
> - Configuración de Twilio
> - Variables de entorno
> - Validación de números
> - Logging

#### 12. `tests/notification.test.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `tests/notification.test.ts` con tests para:
> - sendNotification
> - sendEmail
> - sendSMS
> - sendPush
> - getUserPreferences
> - updatePreferences
> 
> Incluye casos de éxito, error y límite.

#### 13. `src/types/notification.types.ts`

**Instrucción para DeepSeek**:
> Genera un archivo `src/types/notification.types.ts` con tipos:
> - Notification
> - NotificationPreferences
> - Device
> - EmailTemplate
> - PushPayload
> 
> Con documentación.

---

## 📋 RESUMEN TOTAL

| Sistema | Archivos | Funcionalidades |
|---------|----------|-----------------|
| **Pagos** | 12 | Stripe, Escrow, Facturación, Webhooks |
| **Matching** | 14 | AI, WebSockets, Real-time, Scoring |
| **Notificaciones** | 13 | Push, Email, SMS, Preferencias |
| **TOTAL** | **39 archivos** | **Sistemas completos** |

---

## 🎯 INSTRUCCIÓN MAESTRA PARA DEEPSEEK

> Eres un ingeniero de software experto. Tu tarea es generar **3 sistemas complementarios completos** para MatchaAuto:
>
> **SISTEMA 1: PAGOS (12 archivos)**
> - Integración con Stripe
> - Escrow automático
> - Facturación
> - Webhooks
> - Manejo de transacciones
>
> **SISTEMA 2: REAL-TIME MATCHING (14 archivos)**
> - Algoritmo de matching con IA
> - WebSockets para tiempo real
> - Scoring de compatibilidad
> - Jobs de matching
> - Estadísticas
>
> **SISTEMA 3: NOTIFICACIONES (13 archivos)**
> - Push notifications
> - Email
> - SMS
> - Preferencias de usuario
> - Historial
>
> **Total: 39 archivos completos, funcionales y listos para producción**
>
> Genera todos los archivos ahora. No hagas preguntas, solo genera el código.

---

**Documento Preparado Por**: Manus AI - Ingeniero de Sistemas 10x  
**Fecha**: 5 de Enero de 2026  
**Versión**: 1.0  
**Estado**: Listo para DeepSeek
