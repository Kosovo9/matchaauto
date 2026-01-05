# 🤖 MATCH-AUTO: PROTOCOLO DE GENERACIÓN TOTAL PARA DEEPSEEK

Socio Deepseek, la nave ya está en órbita y los cimientos están listos. Ahora tu misión es generar el **cuerpo completo del sistema**. No queremos snippets, queremos archivos productivos listos para el deploy.

## 🛠️ Estructura del Proyecto Sincronizada
- `src/app`: Page Router (Next.js 15).
- `src/components/features`: Componentes de negocio (Listings, Search, Admin).
- `src/services`: Lógica de comunicación frontend-backend.
- `backend/src`: Lógica de Cloudflare Workers (Hono.js).
- `shared/types`: Definiciones de TypeScript compartidas.

## 🎯 Tu Misión de Codificación (Prioridad 10x)

### 1. Sistema de Listings (Frontend)
Genera el código para los siguientes componentes en sus respectivas rutas:
- `src/components/features/listings/ListingCard.tsx`: Card premium con blur, gradientes NASA y badges de estado.
- `src/components/features/listings/ListingForm.tsx`: Formulario de publicación con validación Zod y drag-and-drop para imágenes.
- `src/services/listingService.ts`: Implementa la conexión real con el backend usando `/api/listings`.

### 2. Motor de Búsqueda (Geo-Search)
- `src/components/features/search/SearchBar.tsx`: Buscador con autocompletado de ciudades (usa el plan de `_meta/match-auto-architecture.md`).
- `src/components/features/search/Filters.tsx`: Filtros dinámicos por marca, año y precio.

### 3. Backend Robusto (Sentinel X + Viral)
- `backend/src/services/viralService.ts`: Lógica profunda del K-Factor conectada a Redis (Upstash).
- `backend/src/services/securityService.ts`: Implementación de auditoría inmutable y Sentinel X.
- `backend/src/db/schema.sql`: Esquema completo para D1 (referenciando `_meta/database_schema_100x.md`).

### 4. Shared Sovereignty
- `shared/types/index.ts`: Asegúrate de que todos los tipos (Listing, User, Ad, Event) estén perfectamente tipados para evitar errores de compilación.

## ⚠️ Reglas de Ejecución Implacable
1. **Sin Placeholders**: Cada archivo debe estar completo. Si necesitas una variable de entorno, úsala (`process.env.VARIABLE`).
2. **Next.js 15 Standards**: Usa `use client` solo donde sea necesario. Optimiza con RSC (React Server Components).
3. **NASA Aesthetics**: Cada componente debe tener el look & feel premium (vibrant colors, dark mode, glassmorphism).
4. **Cero Errores**: Todo el código debe pasar el linter y el build.

¡Deepseek, tienes el control total! Transforma los planes de la carpeta `_meta` en el código que dominará el mercado global. 🚀🏁
