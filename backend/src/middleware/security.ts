import { Context, Next } from 'hono'
import CryptoJS from 'crypto-js'

export interface SecurityMetrics {
    threatsBlocked: number
    lastAttack: number
    botDetectionRate: number
}

class SentinelSecurity {
    private threatsBlocked = 0
    private knownBotPatterns = [
        /bot|spider|crawler|scraper/i,
        /HeadlessChrome|PhantomJS/i
    ]

    private suspiciousHeaders = [
        'x-scraper',
        'x-crawler',
        'x-bot-token'
    ]

    async analyzeRequest(c: Context): Promise<{
        isThreat: boolean
        threatLevel: 'low' | 'medium' | 'high'
        reason?: string
    }> {
        const request = c.req
        const userAgent = request.header('user-agent') || ''
        const ip = request.header('x-forwarded-for') || 'unknown'

        // Detección de bots conocidos
        const isKnownBot = this.knownBotPatterns.some(pattern => pattern.test(userAgent))
        if (isKnownBot) {
            return { isThreat: true, threatLevel: 'high', reason: 'Known bot pattern' }
        }

        // Verificación de headers sospechosos
        const hasSuspiciousHeaders = this.suspiciousHeaders.some(header =>
            request.header(header) !== undefined
        )
        if (hasSuspiciousHeaders) {
            return { isThreat: true, threatLevel: 'high', reason: 'Suspicious headers detected' }
        }

        // Análisis de frecuencia de solicitudes (simplificado)
        // const requestSignature = CryptoJS.SHA256(`${ip}:${userAgent}`).toString()
        // Aquí integraríamos con Redis para tracking en producción

        return { isThreat: false, threatLevel: 'low' }
    }

    getMetrics(): SecurityMetrics {
        return {
            threatsBlocked: this.threatsBlocked,
            lastAttack: Date.now(),
            botDetectionRate: 0.98 // Simulado, en producción sería calculado
        }
    }

    blockThreat() {
        this.threatsBlocked++
    }
}

// Middleware de seguridad
export const sentinelMiddleware = async (c: Context, next: Next) => {
    const sentinel = new SentinelSecurity()
    const analysis = await sentinel.analyzeRequest(c)

    if (analysis.isThreat) {
        sentinel.blockThreat()

        // Log threat to KV for God View Dashboard
        const ip = c.req.header('x-forwarded-for') || 'unknown'
        const threatLog = {
            timestamp: Date.now(),
            ip,
            reason: analysis.reason,
            level: analysis.threatLevel,
            path: c.req.path
        }

        // Push threat log to KV (placeholder for VIRAL_DATA or real THREAT_DATA KV)
        if (c.env?.VIRAL_DATA) {
            const currentThreats = await c.env.VIRAL_DATA.get('threat_logs') || '[]'
            const logs = JSON.parse(currentThreats)
            logs.unshift(threatLog)
            await c.env.VIRAL_DATA.put('threat_logs', JSON.stringify(logs.slice(0, 50)))
        }

        // Respuesta genérica para scrapers (evita disclosure)
        if (analysis.threatLevel === 'high') {
            return c.json({
                error: 'Forbidden',
                code: 403,
                request_id: crypto.randomUUID()
            }, 403)
        }

        // Rate limiting silencioso para amenazas medias
        await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Headers de seguridad NASA
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    c.header('X-Sentinel-Status', analysis.isThreat ? 'blocked' : 'clean')
    c.header('X-Match-Auto-Speed', '10x')

    await next()
}
