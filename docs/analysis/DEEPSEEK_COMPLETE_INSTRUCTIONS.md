# 🚀 DEEPSEEK: INSTRUCCIONES MAESTRAS - 67 ARCHIVOS COMPLETOS

**Proyecto**: MatchaAuto - Plataforma de Movilidad Global 10x  
**Objetivo**: Generar 67 archivos funcionales listos para producción  
**Stack**: Node.js + TypeScript + PostgreSQL + PostGIS + Redis + WebSockets + Stripe  
**Vehículos Soportados**: 17 categorías + 80+ subcategorías  
**Tiempo Estimado**: 2-3 horas  

---

## 🎯 INSTRUCCIÓN MAESTRA PARA DEEPSEEK

```
ERES UN INGENIERO DE SOFTWARE EXPERTO. 
TU TAREA: GENERAR 67 ARCHIVOS COMPLETOS Y FUNCIONALES PARA MATCHAAUTO.

REQUISITOS CRÍTICOS:
✅ Código 100% funcional, listo para producción
✅ TypeScript con tipos estrictos
✅ Validaciones con Zod
✅ Manejo de errores robusto
✅ Logging con Pino
✅ Tests unitarios con Vitest
✅ Documentación inline
✅ Soporte para 17 categorías de vehículos
✅ Geolocalización con PostGIS
✅ Caché inteligente con Redis
✅ Pagos con Stripe
✅ Real-time WebSockets
✅ Notificaciones multi-canal

STACK REQUERIDO:
- Node.js 22+
- Express/Fastify
- TypeScript 5.6+
- Prisma ORM
- PostgreSQL + PostGIS
- Redis
- Socket.io
- Stripe API
- Zod
- Pino
- Vitest

ARCHIVOS A GENERAR: 67 (Divididos en 4 sistemas)

SISTEMA 1: GEOLOCALIZACIÓN (28 ARCHIVOS)
├─ Base de datos (3)
├─ Servicios (2)
├─ Controladores (2)
├─ Rutas (2)
├─ Utilidades (3)
├─ Middleware (3)
├─ Configuración (4)
├─ Servidor (2)
├─ Tipos (1)
├─ Scripts (1)
├─ Tests (1)
└─ Configuración proyecto (3)

SISTEMA 2: PAGOS (12 ARCHIVOS)
├─ Servicios (3)
├─ Controladores (2)
├─ Rutas (2)
├─ Configuración (1)
├─ Webhooks (1)
├─ Migraciones (1)
├─ Tests (1)
└─ Tipos (1)

SISTEMA 3: REAL-TIME MATCHING (14 ARCHIVOS)
├─ Servicios (2)
├─ Controladores (1)
├─ Rutas (1)
├─ WebSocket (3)
├─ Jobs (1)
├─ Migraciones (1)
├─ Tests (1)
├─ Tipos (1)
├─ Scripts (1)
└─ Configuración (1)

SISTEMA 4: NOTIFICACIONES (13 ARCHIVOS)
├─ Servicios (4)
├─ Controladores (1)
├─ Rutas (1)
├─ Jobs (1)
├─ Migraciones (1)
├─ Templates (1)
├─ Configuración (2)
├─ Tests (1)
└─ Tipos (1)

INSTRUCCIONES ESPECÍFICAS POR ARCHIVO:
(Ver secciones detalladas abajo)

ENTREGABLES:
✅ Todos los 67 archivos generados
✅ Código funcional 100%
✅ Tests incluidos
✅ Documentación completa
✅ Listo para deploy
```

---

## 📋 SISTEMA 1: GEOLOCALIZACIÓN (28 ARCHIVOS)

### Archivos a Generar

**1. src/database/schema.ts**
```
Generar esquema Prisma con:
- Modelo Vehicle (17 tipos, 80+ subtipos)
- Modelo Location (país, estado, ciudad, pueblo, código postal)
- Modelo VehicleSearch (analytics)
- Modelo User, Seller, Review
- Relaciones completas
- Índices geoespaciales
- Validaciones
```

**2. src/services/geolocation.service.ts**
```
Clase GeoLocationService con métodos:
- searchNearby(lat, lon, radius, filters) → Búsqueda por radio
- searchByCity(city, state, country, filters) → Búsqueda por ciudad
- searchByHierarchy(country, state, city) → Jerarquía
- calculateDistance(lat1, lon1, lat2, lon2, unit) → Haversine
- geocodeAddress(address) → Dirección a coordenadas
- reverseGeocode(lat, lon) → Coordenadas a dirección
- getLocationHierarchy(country) → Jerarquía de ubicaciones
- fuzzySearchLocations(query) → Búsqueda aproximada
- autocompleteLocations(query) → Autocompletado
- getVehiclesByType(type, location, filters) → Por tipo
- getVehiclesByRadius(lat, lon, radius, type, filters) → Por radio + tipo
- getVehiclesByCity(city, type, filters) → Por ciudad + tipo

Incluir:
- Validaciones de entrada
- Caché en Redis (TTL 1 hora)
- Logging con Pino
- Manejo de errores
- Soporte para 17 categorías
```

**3. src/services/vehicle.service.ts**
```
Clase VehicleService con métodos:
- createVehicle(data) → Crear vehículo
- updateVehicle(id, data) → Actualizar
- deleteVehicle(id) → Eliminar
- getVehicleById(id) → Obtener por ID
- getVehiclesByType(type, filters) → Por tipo
- getVehiclesByBrand(brand, filters) → Por marca
- getVehiclesByPriceRange(min, max, filters) → Por precio
- filterVehicles(filters) → Filtrado avanzado
- getVehicleStats() → Estadísticas
- getVehiclesByCapacity(min, max) → Por capacidad
- getVehiclesByFuelType(type, filters) → Por combustible
- getVehiclesByYear(min, max, filters) → Por año

Incluir:
- Validaciones con Zod
- Paginación
- Ordenamiento
- Búsqueda full-text
- Caché
```

**4. src/controllers/geolocation.controller.ts**
```
Controladores para:
- searchNearby(req, res) → POST /api/vehicles/nearby
- searchByCity(req, res) → GET /api/vehicles/search/by-city
- searchByHierarchy(req, res) → GET /api/locations/hierarchy
- autocompleteLocations(req, res) → GET /api/locations/autocomplete
- getLocationDetails(req, res) → GET /api/locations/{id}
- advancedSearch(req, res) → POST /api/vehicles/search/advanced
- getVehiclesByType(req, res) → GET /api/vehicles/by-type/{type}
- searchMultiType(req, res) → POST /api/vehicles/search/multi-type

Incluir:
- Validación con Zod
- Autenticación JWT opcional
- Manejo de errores
- Logging
- Respuestas JSON estructuradas
```

**5. src/controllers/vehicle.controller.ts**
```
Controladores CRUD:
- createVehicle(req, res) → POST /api/vehicles
- updateVehicle(req, res) → PUT /api/vehicles/{id}
- deleteVehicle(req, res) → DELETE /api/vehicles/{id}
- getVehicleById(req, res) → GET /api/vehicles/{id}
- listVehicles(req, res) → GET /api/vehicles
- searchVehicles(req, res) → POST /api/vehicles/search
- getVehiclesByType(req, res) → GET /api/vehicles/type/{type}

Incluir:
- Validación con Zod
- Autenticación JWT requerida
- Autorización basada en roles
- Manejo de errores
```

**6. src/routes/geolocation.routes.ts**
```
Rutas:
- POST /api/vehicles/nearby
- GET /api/vehicles/search/by-city
- GET /api/locations/hierarchy
- GET /api/locations/autocomplete
- GET /api/locations/{id}
- POST /api/vehicles/search/advanced
- GET /api/vehicles/by-type/{type}
- POST /api/vehicles/search/multi-type

Con middleware de validación y autenticación opcional
```

**7. src/routes/vehicle.routes.ts**
```
Rutas CRUD:
- POST /api/vehicles
- GET /api/vehicles
- GET /api/vehicles/{id}
- PUT /api/vehicles/{id}
- DELETE /api/vehicles/{id}
- GET /api/vehicles/type/{type}
- POST /api/vehicles/search

Con autenticación y autorización
```

**8. src/utils/validators.ts**
```
Esquemas Zod para:
- CreateVehicleSchema
- UpdateVehicleSchema
- SearchNearbySchema
- SearchByCitySchema
- AdvancedSearchSchema
- LocationSchema
- PaginationSchema
- FilterSchema
- VehicleTypeSchema

Incluir validaciones de:
- Coordenadas GPS
- Distancia (radio)
- Precio (rango)
- Año (rango)
- Capacidad
- Combustible
- Transmisión
```

**9. src/utils/distance.ts**
```
Funciones:
- calculateHaversineDistance(lat1, lon1, lat2, lon2, unit) → Distancia
- calculateBoundingBox(lat, lon, radiusKm) → Caja delimitadora
- isPointInRadius(lat1, lon1, lat2, lon2, radiusKm) → Verificar radio
- formatDistance(distance, unit) → Formatear distancia
- convertKmToMiles(km) → Conversión
- convertMilesToKm(miles) → Conversión
- validateCoordinates(lat, lon) → Validar coordenadas
- getDistanceCategory(distance) → Categorizar distancia
```

**10. src/utils/geocoding.ts**
```
Funciones:
- geocodeAddress(address) → Dirección a coordenadas
- reverseGeocode(lat, lon) → Coordenadas a dirección
- parseAddress(address) → Parsear componentes
- formatAddress(components) → Formatear dirección
- fuzzyMatchCity(query, cities) → Búsqueda aproximada
- getLocationFromIP(ip) → Ubicación desde IP
- validateAddress(address) → Validar dirección
- normalizeAddress(address) → Normalizar dirección

Incluir:
- Integración Google Geocoding API
- Caché en Redis
- Manejo de errores
```

**11. src/middleware/auth.middleware.ts**
```
Middleware:
- verifyToken(req, res, next) → Verificar JWT
- verifyRole(roles)(req, res, next) → Verificar rol
- optionalAuth(req, res, next) → Autenticación opcional
- requireAuth(req, res, next) → Autenticación requerida

Incluir:
- Verificación JWT
- Manejo de errores
- Logging
```

**12. src/middleware/validation.middleware.ts**
```
Middleware:
- validateBody(schema)(req, res, next)
- validateQuery(schema)(req, res, next)
- validateParams(schema)(req, res, next)

Incluir:
- Validación con Zod
- Manejo de errores formateados
```

**13. src/middleware/error.middleware.ts**
```
Middleware:
- errorHandler(err, req, res, next)
- notFoundHandler(req, res, next)

Incluir:
- Tipos de errores personalizados
- Logging
- Respuestas formateadas
```

**14. src/config/database.ts**
```
Configuración:
- Inicialización Prisma
- Conexión PostgreSQL
- Manejo de conexiones
- Logging
- Variables de entorno
```

**15. src/config/redis.ts**
```
Configuración:
- Inicialización Redis
- Opciones de caché
- TTLs por defecto
- Manejo de errores
- Logging
```

**16. src/config/env.ts**
```
Validación de variables:
- DATABASE_URL
- REDIS_URL
- GOOGLE_GEOCODING_API_KEY
- JWT_SECRET
- NODE_ENV
- PORT
- LOG_LEVEL

Incluir:
- Validación con Zod
- Valores por defecto
- Documentación
```

**17. src/app.ts**
```
Configuración Express:
- Middleware global (CORS, logging, compresión)
- Rutas de geolocalización
- Rutas de vehículos
- Manejo de errores
- Middleware 404
```

**18. src/server.ts**
```
Servidor principal:
- Iniciar servidor
- Conectar base de datos
- Conectar Redis
- Logging
- Graceful shutdown
- Manejo de errores no capturados
```

**19. src/types/index.ts**
```
Tipos TypeScript:
- Vehicle
- Location
- User
- Seller
- SearchParams
- SearchResult
- ApiResponse
- Error types
- VehicleType
- VehicleSubtype
- Todos documentados
```

**20. prisma/schema.prisma**
```
Modelos:
- User
- Seller
- Vehicle (con 17 tipos)
- Location
- VehicleSearch
- Review
- PaymentMethod
- Transaction
- Escrow

Con:
- Relaciones
- Índices geoespaciales
- Validaciones
```

**21. prisma/migrations/init.sql**
```
Migración inicial:
- Extensión PostGIS
- Tablas
- Índices geoespaciales
- Índices de búsqueda
- Funciones de utilidad
- Documentación
```

**22. scripts/seed.ts**
```
Seeding de datos:
- Usuarios de prueba
- Vendedores
- Ciudades y pueblos (Colombia)
- Vehículos de prueba (todos los tipos)
- Ubicaciones variadas
- Datos realistas
```

**23. tests/geolocation.test.ts**
```
Tests para:
- searchNearby
- searchByCity
- calculateDistance
- geocodeAddress
- fuzzySearch
- autocomplete
- getLocationHierarchy
- Casos de éxito, error y límite
```

**24. tests/vehicle.test.ts**
```
Tests para:
- createVehicle
- updateVehicle
- deleteVehicle
- getVehicleById
- filterVehicles
- getVehiclesByType
- Casos de éxito, error y validaciones
```

**25. .env.example**
```
Variables de entorno:
- DATABASE_URL
- REDIS_URL
- GOOGLE_GEOCODING_API_KEY
- JWT_SECRET
- NODE_ENV
- PORT
- LOG_LEVEL
```

**26. package.json**
```
Dependencias y scripts:
- dev, build, start, test
- Todas las dependencias necesarias
- Versiones específicas
```

**27. tsconfig.json**
```
Configuración TypeScript:
- Target ES2020
- Strict mode
- Path aliases
- Outdir dist
```

**28. README.md**
```
Documentación:
- Descripción
- Características
- Instalación
- Endpoints
- Ejemplos de uso
```

---

## 💳 SISTEMA 2: PAGOS (12 ARCHIVOS)

**Generar archivos:**
1. src/services/payment.service.ts - Pagos con Stripe
2. src/services/escrow.service.ts - Escrow automático
3. src/services/billing.service.ts - Facturación
4. src/controllers/payment.controller.ts - Controladores
5. src/controllers/escrow.controller.ts - Controladores escrow
6. src/routes/payment.routes.ts - Rutas
7. src/routes/escrow.routes.ts - Rutas escrow
8. src/config/stripe.ts - Configuración Stripe
9. src/webhooks/stripe.webhook.ts - Webhooks
10. prisma/migrations/payments.sql - Migraciones
11. tests/payment.test.ts - Tests
12. src/types/payment.types.ts - Tipos

**Especificaciones:**
- Integración Stripe completa
- Escrow automático
- Facturación
- Webhooks
- Manejo de errores
- Tests completos

---

## 🤖 SISTEMA 3: REAL-TIME MATCHING (14 ARCHIVOS)

**Generar archivos:**
1. src/services/matching.service.ts - Matching
2. src/services/ai-matching.service.ts - IA/ML
3. src/services/websocket.service.ts - WebSockets
4. src/controllers/matching.controller.ts - Controladores
5. src/websocket/events.ts - Eventos
6. src/websocket/handlers.ts - Manejadores
7. src/websocket/server.ts - Servidor WebSocket
8. src/routes/matching.routes.ts - Rutas
9. prisma/migrations/matching.sql - Migraciones
10. src/jobs/matching.job.ts - Jobs
11. tests/matching.test.ts - Tests
12. src/types/matching.types.ts - Tipos
13. scripts/train-matching-model.ts - Entrenamiento ML
14. src/config/websocket.ts - Configuración

**Especificaciones:**
- Algoritmo ML para matching
- WebSockets real-time
- Scoring de compatibilidad
- Jobs de matching
- Estadísticas
- Tests completos

---

## 🔔 SISTEMA 4: NOTIFICACIONES (13 ARCHIVOS)

**Generar archivos:**
1. src/services/notification.service.ts - Notificaciones
2. src/services/email.service.ts - Email
3. src/services/sms.service.ts - SMS
4. src/services/push.service.ts - Push
5. src/controllers/notification.controller.ts - Controladores
6. src/routes/notification.routes.ts - Rutas
7. src/jobs/notification.job.ts - Jobs
8. prisma/migrations/notifications.sql - Migraciones
9. src/templates/email/ - Templates HTML
10. src/config/email.ts - Configuración Email
11. src/config/sms.ts - Configuración SMS
12. tests/notification.test.ts - Tests
13. src/types/notification.types.ts - Tipos

**Especificaciones:**
- Push notifications
- Email con templates
- SMS
- Preferencias de usuario
- Historial
- Tests completos

---

## ✅ CHECKLIST DE GENERACIÓN

### Paso 1: Geolocalización (28 archivos)
- [ ] Generar todos los archivos
- [ ] Validar sintaxis TypeScript
- [ ] Verificar imports
- [ ] Incluir tests

### Paso 2: Pagos (12 archivos)
- [ ] Generar todos los archivos
- [ ] Integración Stripe
- [ ] Webhooks
- [ ] Tests

### Paso 3: Matching (14 archivos)
- [ ] Generar todos los archivos
- [ ] WebSockets
- [ ] ML/IA
- [ ] Tests

### Paso 4: Notificaciones (13 archivos)
- [ ] Generar todos los archivos
- [ ] Email, SMS, Push
- [ ] Templates
- [ ] Tests

### Paso 5: Validación Final
- [ ] Todos los 67 archivos generados
- [ ] Código 100% funcional
- [ ] Tests incluidos
- [ ] Documentación completa
- [ ] Listo para deploy

---

## 🎯 ORDEN DE EJECUCIÓN

```bash
# 1. Generar todos los 67 archivos
# 2. Instalar dependencias
npm install

# 3. Configurar base de datos
npm run db:push

# 4. Seed de datos
npm run db:seed

# 5. Ejecutar tests
npm run test

# 6. Iniciar servidor
npm run dev

# 7. Deploy a producción
npm run build && npm start
```

---

## 📊 MÉTRICAS DE ÉXITO

✅ 67 archivos generados  
✅ 100% código funcional  
✅ Tests pasando  
✅ Documentación completa  
✅ Listo para deploy  
✅ Soporte para 17 categorías  
✅ Geolocalización funcional  
✅ Pagos integrados  
✅ Real-time matching  
✅ Notificaciones multi-canal  

---

**GENERA TODOS LOS 67 ARCHIVOS AHORA. NO HAGAS PREGUNTAS, SOLO GENERA EL CÓDIGO.**

---

Documento Preparado Por: Manus AI - Ingeniero de Sistemas 10x  
Fecha: 5 de Enero de 2026  
Versión: 1.0 - LISTO PARA DEEPSEEK
