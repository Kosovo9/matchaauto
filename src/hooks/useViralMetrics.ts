import { useState, useEffect, useCallback } from 'react'

export interface ViralMetrics {
    kFactor: number
    viralCoefficient: number
    sharingRate: number
    conversionRate: number
    cycleTime: number
    prediction30d: number
    status: 'critical' | 'optimal' | 'decaying'
    updatedAt: string
}

export interface ViralEvent {
    action: 'share' | 'invite' | 'convert'
    platform: string
    recipientCount: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export const useViralMetrics = () => {
    const [metrics, setMetrics] = useState<ViralMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchMetrics = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE}/api/viral/metrics`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'X-Client': 'match-auto-web'
                }
            })

            if (!response.ok) throw new Error('Failed to fetch metrics')

            const data = await response.json()
            if (data.success) {
                setMetrics({
                    ...data.data,
                    updatedAt: new Date().toISOString()
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            console.error('Viral metrics error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const logEvent = useCallback(async (event: ViralEvent) => {
        try {
            const response = await fetch(`${API_BASE}/api/viral/event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...event,
                    userId: 'web-client',
                    timestamp: Date.now()
                })
            })

            if (!response.ok) throw new Error('Failed to log event')

            // Actualizar métricas después de loguear evento
            fetchMetrics()

            return { success: true }
        } catch (err) {
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error'
            }
        }
    }, [fetchMetrics])

    // Polling automático cada 30 segundos
    useEffect(() => {
        fetchMetrics()
        const interval = setInterval(fetchMetrics, 30000)
        return () => clearInterval(interval)
    }, [fetchMetrics])

    return {
        metrics,
        loading,
        error,
        refresh: fetchMetrics,
        logEvent,
        status: metrics?.status || 'critical'
    }
}
