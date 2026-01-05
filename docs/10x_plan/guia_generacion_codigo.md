# Guía de Generación de Código para DeepSeek (Match-Auto 10x)

Copia y pega estos prompts en DeepSeek para generar los archivos optimizados.

## Prompt 1: Configuración de Entorno y Seguridad (Zod + Auth)
> "Genera el archivo `src/config/env.ts` usando Zod para validar las variables de entorno de Cloudflare Workers (RPC_URL, CLERK_SECRET_KEY, etc.). Luego, crea un middleware `src/middleware/auth.ts` que valide tokens JWT de Clerk de forma eficiente en el Edge."

## Prompt 2: Resiliencia 10x (Circuit Breaker + Retry)
> "Implementa una clase `CircuitBreaker` en `src/lib/circuitBreaker.ts` con estados Open, Half-Open y Closed. Además, crea una utilidad `src/lib/retry.ts` que implemente Exponential Backoff con Jitter para reintentar llamadas a la RPC de Solana."

## Prompt 3: Servicio de Billetera Optimizado
> "Crea `src/services/CryptoWallet.ts`. Debe integrar la conexión a Solana, usar el `CircuitBreaker` para las llamadas RPC, e implementar un sistema de caché usando la Cache API de Cloudflare para el método `getBalance`. Asegúrate de que use el `Priority Fees Optimizer` para enviar transacciones."

## Prompt 4: Infraestructura de Testing (Miniflare v4)
> "Configura `vitest.config.ts` y `test/setup.ts` para usar Miniflare v4. Asegúrate de que los tests puedan simular Durable Objects y KV de Cloudflare sin errores de dependencias deprecadas."
