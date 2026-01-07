import { z } from 'zod';
import { Env } from '../../../shared/types';

// Esquemas de eventos virales
const ViralEventSchema = z.object({
    userId: z.string(),
    type: z.enum(['invite_sent', 'invite_accepted', 'conversion', 'churn', 'share']),
    timestamp: z.string().datetime(),
    metadata: z.record(z.string(), z.any()).optional(),
    weight: z.number().min(0).max(1).default(1),
});

// Esquema de métricas K-Factor
const KFactorMetricsSchema = z.object({
    userId: z.string(),
    period: z.enum(['24h', '7d', '30d', 'all']),
    invitesSent: z.number().int().nonnegative(),
    invitesAccepted: z.number().int().nonnegative(),
    conversions: z.number().int().nonnegative(),
    churns: z.number().int().nonnegative(),
    shares: z.number().int().nonnegative(),
    calculatedAt: z.string().datetime(),
});

// Tipos
export type ViralEvent = z.infer<typeof ViralEventSchema>;
export type KFactorMetrics = z.infer<typeof KFactorMetricsSchema>;

export interface ViralGrowthMetrics {
    kFactor: number;
    viralCoefficient: number;
    retentionRate: number;
    conversionRate: number;
    growthVelocity: number;
    healthScore: number;
    percentile: number;
}

export class ViralService {
    private kv: KVNamespace;
    private readonly KV_PREFIX = 'viral_events';
    private readonly METRICS_TTL = 3600; // 1 hora en cache

    constructor(kvNamespace: KVNamespace) {
        this.kv = kvNamespace;
    }

    /**
     * Registra un evento viral con validación
     */
    public async recordEvent(event: Omit<ViralEvent, 'timestamp'>): Promise<void> {
        const validatedEvent = ViralEventSchema.parse({
            ...event,
            timestamp: new Date().toISOString(),
        });

        const eventKey = `${this.KV_PREFIX}:${event.userId}:${Date.now()}:${event.type}`;

        // Almacenar evento principal
        await this.kv.put(eventKey, JSON.stringify(validatedEvent), {
            metadata: {
                userId: event.userId,
                type: event.type,
                timestamp: validatedEvent.timestamp,
            },
        });

        // Actualizar contadores rápidos en atomic counters
        await this.updateCounters(event.userId, event.type);
    }

    /**
     * Actualiza contadores atómicos para consultas rápidas
     */
    private async updateCounters(userId: string, eventType: string): Promise<void> {
        const counterKey = `${this.KV_PREFIX}:counters:${userId}:${eventType}`;

        // Usar operaciones atómicas si están disponibles
        try {
            const current = await this.kv.get(counterKey);
            const newValue = current ? parseInt(current) + 1 : 1;
            await this.kv.put(counterKey, newValue.toString());
        } catch (error) {
            console.error(`Failed to update counter for ${userId}:${eventType}`, error);
        }
    }

    /**
     * Calcula el K-Factor real con datos históricos
     */
    public async calculateKFactor(userId: string, period: '24h' | '7d' | '30d' = '30d'): Promise<ViralGrowthMetrics> {
        // Verificar cache primero
        const cacheKey = `${this.KV_PREFIX}:metrics:${userId}:${period}`;
        const cached = await this.kv.get(cacheKey, 'json') as any;

        if (cached && this.isCacheValid(cached.calculatedAt)) {
            return cached.metrics;
        }

        // Obtener eventos del periodo
        const events = await this.getEventsForPeriod(userId, period);

        // Calcular métricas base
        const invitesSent = events.filter(e => e.type === 'invite_sent').length;
        const invitesAccepted = events.filter(e => e.type === 'invite_accepted').length;
        const conversions = events.filter(e => e.type === 'conversion').length;
        const churns = events.filter(e => e.type === 'churn').length;
        const shares = events.filter(e => e.type === 'share').length;

        // Calcular ratios
        const conversionRate = invitesSent > 0 ? conversions / invitesSent : 0;
        const acceptanceRate = invitesSent > 0 ? invitesAccepted / invitesSent : 0;
        const retentionRate = conversions > 0 ? (conversions - churns) / conversions : 0;

        // K-Factor fórmula: (invites * acceptance_rate * conversion_rate)
        const kFactor = invitesSent * acceptanceRate * conversionRate;

        // Coeficiente viral ajustado por retención
        const viralCoefficient = kFactor * retentionRate;

        // Velocidad de crecimiento (eventos por día normalizado)
        const growthVelocity = this.calculateGrowthVelocity(events, period);

        // Score de salud (0-100)
        const healthScore = this.calculateHealthScore({
            kFactor,
            retentionRate,
            conversionRate,
            growthVelocity,
        });

        // Percentil vs otros usuarios
        const percentile = await this.calculatePercentile(userId, kFactor, period);

        const metrics: ViralGrowthMetrics = {
            kFactor: Number(kFactor.toFixed(3)),
            viralCoefficient: Number(viralCoefficient.toFixed(3)),
            retentionRate: Number(retentionRate.toFixed(3)),
            conversionRate: Number(conversionRate.toFixed(3)),
            growthVelocity: Number(growthVelocity.toFixed(2)),
            healthScore: Math.min(100, Math.max(0, Math.round(healthScore))),
            percentile: Math.round(percentile * 100) / 100,
        };

        // Cachear resultados
        await this.kv.put(
            cacheKey,
            JSON.stringify({
                metrics,
                calculatedAt: new Date().toISOString(),
                rawCounts: { invitesSent, invitesAccepted, conversions, churns, shares }
            }),
            { expirationTtl: this.METRICS_TTL }
        );

        return metrics;
    }

    /**
     * Obtiene eventos para un período específico
     */
    private async getEventsForPeriod(userId: string, period: string): Promise<ViralEvent[]> {
        const now = Date.now();
        let cutoff: number;

        switch (period) {
            case '24h': cutoff = now - 24 * 60 * 60 * 1000; break;
            case '7d': cutoff = now - 7 * 24 * 60 * 60 * 1000; break;
            case '30d': cutoff = now - 30 * 24 * 60 * 60 * 1000; break;
            default: cutoff = 0;
        }

        // Listar todas las keys del usuario
        const prefix = `${this.KV_PREFIX}:${userId}:`;
        const keys = await this.kv.list({ prefix });

        const events: ViralEvent[] = [];

        // Obtener eventos recientes
        for (const key of keys.keys) {
            if (key.name.includes('counters')) continue;

            const timestampString = key.name.split(':')[2];
            const timestamp = parseInt(timestampString);
            if (timestamp >= cutoff) {
                const event = await this.kv.get(key.name, 'json');
                if (event) {
                    events.push(ViralEventSchema.parse(event));
                }
            }
        }

        return events.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    /**
     * Calcula velocidad de crecimiento normalizada
     */
    private calculateGrowthVelocity(events: ViralEvent[], period: string): number {
        if (events.length < 2) return 0;

        const sortedEvents = [...events].sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const firstDate = new Date(sortedEvents[0].timestamp);
        const lastDate = new Date(sortedEvents[sortedEvents.length - 1].timestamp);

        const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        return events.length / daysDiff;
    }

    /**
     * Calcula score de salud 0-100
     */
    private calculateHealthScore(params: {
        kFactor: number;
        retentionRate: number;
        conversionRate: number;
        growthVelocity: number;
    }): number {
        const { kFactor, retentionRate, conversionRate, growthVelocity } = params;

        // Pesos ajustados
        const weights = {
            kFactor: 0.4,
            retentionRate: 0.3,
            conversionRate: 0.2,
            growthVelocity: 0.1,
        };

        // Normalizar valores (asumiendo rangos óptimos)
        const normalizedKFactor = Math.min(kFactor * 10, 1); // K > 0.1 es bueno
        const normalizedRetention = retentionRate;
        const normalizedConversion = Math.min(conversionRate * 5, 1); // CR > 0.2 es bueno
        const normalizedVelocity = Math.min(growthVelocity / 10, 1); // >10 eventos/día es bueno

        return (
            normalizedKFactor * weights.kFactor +
            normalizedRetention * weights.retentionRate +
            normalizedConversion * weights.conversionRate +
            normalizedVelocity * weights.growthVelocity
        ) * 100;
    }

    /**
     * Calcula percentil vs otros usuarios
     */
    private async calculatePercentile(userId: string, kFactor: number, period: string): Promise<number> {
        // En producción, esto consultaría una base de datos de métricas agregadas
        // Por ahora, devolvemos un valor basado en rangos estándar
        if (kFactor <= 0.1) return 0.25;
        if (kFactor <= 0.5) return 0.5;
        if (kFactor <= 1.0) return 0.75;
        return 0.9;
    }

    /**
     * Verifica si el cache es válido
     */
    private isCacheValid(timestamp: string): boolean {
        const cacheTime = new Date(timestamp).getTime();
        const now = Date.now();
        return (now - cacheTime) < (this.METRICS_TTL * 1000 * 0.8); // 80% del TTL
    }

    /**
     * Obtiene tendencias de crecimiento
     */
    public async getGrowthTrends(userId: string): Promise<{
        daily: ViralGrowthMetrics[];
        weekly: ViralGrowthMetrics[];
        monthly: ViralGrowthMetrics[];
    }> {
        const [daily, weekly, monthly] = await Promise.all([
            this.calculateKFactor(userId, '24h'),
            this.calculateKFactor(userId, '7d'),
            this.calculateKFactor(userId, '30d'),
        ]);

        return { daily: [daily], weekly: [weekly], monthly: [monthly] };
    }
}

// Factory para crear instancia
export const createViralService = (env: Env) => {
    if (!env.VIRAL_DATA) {
        throw new Error('VIRAL_DATA KV namespace not configured');
    }
    return new ViralService(env.VIRAL_DATA);
};
