# 🚀 Prompt 10x: Motor de Precisión VIN-to-Part

**Ubicación Exacta:** `/packages/core-logic/src/vin-engine.ts`

### Prompt para DeepSeek:
> "Actúa como un Ingeniero Senior de Software Automotriz y Web3. Genera el código para `vin-engine.ts` que implemente un motor de precisión VIN-to-Part. 
> 
> **Requerimientos Técnicos:**
> 1. **Decodificación Multi-Fuente**: Implementa una función asíncrona que consuma la API de la NHTSA (vPIC) y, como fallback, una estructura de datos local para decodificar el VIN (Año, Marca, Modelo, Motor, Tipo de Combustible).
> 2. **Mapeo de Compatibilidad**: Crea una lógica que traduzca los atributos del vehículo a un 'CompatibilityKey' único.
> 3. **Integración con Catálogo**: Implementa un método `findCompatibleParts(vin: string, category: string)` que consulte una base de datos (simula la interfaz de Drizzle ORM) filtrando por el `CompatibilityKey`.
> 4. **Validación Estricta**: Usa Zod para validar el formato del VIN (17 caracteres, exclusión de I, O, Q) y el esquema de respuesta.
> 5. **Optimización de Rendimiento**: Implementa un sistema de caché simple (Map o Cloudflare KV) para evitar llamadas repetidas a la API externa para el mismo VIN.
> 
> **Salida**: Código TypeScript limpio, modular, con tipos estrictos y comentarios técnicos."
