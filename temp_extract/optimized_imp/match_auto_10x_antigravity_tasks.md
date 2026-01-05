# ⚡ Prioridades 10x para Agente Antigravity (VS Code)

Basado en la arquitectura de carpetas raíz, estas son las 5 tareas iniciales que el agente debe ejecutar en orden:

1.  **Tarea 1: Inicialización del Monorepo y Configuración de Tipos**
    *   *Acción*: Crear la estructura de carpetas `/apps` y `/packages`. Configurar `tsconfig.base.json` y los `package.json` de cada workspace.
    *   *Objetivo*: Establecer el cimiento para que los demás módulos se comuniquen sin errores de tipos.

2.  **Tarea 2: Implementación del Core de Validación (Zod + Env)**
    *   *Acción*: Crear `/packages/core-logic/src/schemas/` y definir los esquemas para Vehículos, Refacciones y Usuarios. Configurar la validación de variables de entorno.
    *   *Objetivo*: Asegurar que ningún dato corrupto entre al sistema desde el inicio.

3.  **Tarea 3: Setup del API Gateway (Hono en Cloudflare)**
    *   *Acción*: Implementar el servidor base en `/apps/api-gateway/src/index.ts` con middlewares de CORS, Error Handling y Logging estructurado.
    *   *Objetivo*: Tener el punto de entrada funcional para recibir peticiones.

4.  **Tarea 4: Motor de Decodificación VIN (vPIC Integration)**
    *   *Acción*: Implementar el código generado por el prompt de DeepSeek en `/packages/core-logic/src/vin-engine.ts`.
    *   *Objetivo*: Habilitar la funcionalidad estrella que diferencia a Match-Auto: la precisión en la búsqueda de piezas.

5.  **Tarea 5: Infraestructura de Base de Datos (Drizzle + Schema)**
    *   *Acción*: Definir el esquema relacional en `/packages/database/src/schema.ts` incluyendo las tablas de `listings`, `compatibility_matrix` y `escrow_states`.
    *   *Objetivo*: Permitir la persistencia de datos necesaria para el flujo de negocio.
