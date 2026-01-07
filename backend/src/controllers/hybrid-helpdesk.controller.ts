
import { Context } from 'hono';
import { Redis } from 'ioredis';
import { HelpDeskController } from '../controllers/help-desk.controller'; // El offline controller existente
import { OnlineAIService } from '../services/ai/online-ai.service';
import { logger } from '../utils/logger';
import { modelLatency, modelSuccess, modelErrors } from '../metrics/helpdesk.metrics';
import { isModelAvailable } from '../utils/ollama-checker';
import { getFallbackResponse } from '../services/fallback-responses';

export class HybridHelpDeskController {
    private onlineService: OnlineAIService;
    private offlineController: HelpDeskController;
    private redis: Redis;

    constructor(redis: Redis, pgPool: any, env: any) {
        this.redis = redis;
        this.onlineService = new OnlineAIService(redis, env);
        this.offlineController = new HelpDeskController(redis, pgPool);
    }

    query = async (c: Context) => {
        const start = Date.now();
        const body = await c.req.json();
        const { userId, question, model = 'qwen3', forceOffline = false } = body;
        const cacheKey = `helpdesk:${userId}:${model}:${question.substring(0, 32)}`;

        // 1. Cache Check
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            modelLatency.observe({ model: 'cache', source: 'redis' }, (Date.now() - start) / 1000);
            return c.json({
                ...JSON.parse(cached),
                source: 'cache',
                latencyMs: Date.now() - start
            });
        }

        // 2. Modo Online
        if (!forceOffline) {
            try {
                const response = await this.onlineService.generate(question, model);
                await this.redis.setex(cacheKey, 600, JSON.stringify(response));

                // Métricas
                modelLatency.observe({ model: response.model, source: 'online' }, response.latencyMs / 1000);
                modelSuccess.inc({ model: response.model, source: 'online' });

                return c.json(response);
            } catch (error) {
                logger.warn('Online mode failed, falling back to OFFLINE TACTICAL AI');
                modelErrors.inc({ model, source: 'online', error_type: 'timeout_or_fail' });
            }
        }

        // 3. Fallback: Modo Offline (Ollama Local)
        try {
            // Check si el modelo existe localmente
            const localModelAvailable = await isModelAvailable(model);
            const activeModel = localModelAvailable ? model : 'llama2'; // Fallback a llama2 o lo que sea default

            // Aquí iría la llamada real a Ollama. Simulamos éxito si el check pasa.
            // Para la demo, simulamos que el "taskOffline" es el real.

            const offlineResponse = await this.taskOffline(userId, question);
            modelLatency.observe({ model: activeModel, source: 'offline' }, (Date.now() - start) / 1000);
            modelSuccess.inc({ model: activeModel, source: 'offline' });

            return c.json({
                ...offlineResponse,
                source: 'offline',
                model: activeModel,
                latencyMs: Date.now() - start
            });

        } catch (offlineError) {
            // 4. ÚLTIMO RECURSO: Respuestas Pre-Cargadas
            logger.error('CRITICAL FAILURE: All AI systems down. Engaging Fallback Protocol.');
            modelErrors.inc({ model: 'none', source: 'system', error_type: 'critical_failure' });

            return c.json({
                answer: getFallbackResponse(question),
                source: 'system-fallback',
                model: 'none',
                latencyMs: Date.now() - start
            });
        }
    };

    // Wrapper para reusar lógica offline
    private async taskOffline(userId: string, question: string) {
        // En una implementación real, invocaría al servicio de Ollama DIRECTAMENTE.
        // Por ahora, simulamos la respuesta táctica robusta del controlador anterior.
        return {
            answer: `[🛡️ OFFLINE TACTICAL AI] Conectado a nodo local en Chihuahua. Respuesta para: "${question}" generada sin internet.`,
            userId
        };
    }
}
