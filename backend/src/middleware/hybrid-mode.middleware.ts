
import { Context, Next } from 'hono';

// Estado global de conectividad (en memoria para velocidad extrema)
let isOnline = true;

// Función para verificar conectividad real (ping a DNS fiable)
async function checkConnectivity() {
    try {
        // Intentar resolver un dominio de alta disponibilidad (ej. Cloudflare/Google)
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 800); // 800ms timeout
        const response = await fetch('https://1.1.1.1', { signal: controller.signal });
        isOnline = response.ok;
        clearTimeout(id);
    } catch (error) {
        isOnline = false;
    }
}

// Polling ligero cada 10s para actualizar estado
setInterval(checkConnectivity, 10000);

export const hybridModeMiddleware = async (c: Context, next: Next) => {
    // Inyectar estado en el contexto
    c.set('isOnline', isOnline);

    // Headers para que el cliente sepa el estado del servidor
    c.header('X-Hybrid-Mode', isOnline ? 'ONLINE' : 'OFFLINE');
    c.header('X-AI-Source', isOnline ? 'CLOUD-QWEN3' : 'LOCAL-OLLAMA');

    await next();
};
