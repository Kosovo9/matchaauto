import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

const app = new Hono();

// Schema de validación
const AlertSchema = z.object({
    incident_id: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.enum(['triggered', 'acknowledged', 'resolved']),
    urgency: z.enum(['high', 'low']),
    created_at: z.string().datetime(),
    service: z.object({
        id: z.string(),
        name: z.string(),
    }),
    assignees: z.array(z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
    })),
    last_status_change_at: z.string().datetime(),
    html_url: z.string().url(),
});

// Configuración de CORS y seguridad
app.use('*', cors({
    origin: ['https://admin.match-auto.com', 'http://localhost:3000'],
    allowMethods: ['GET', 'POST'],
    credentials: true,
}));

// Middleware de autenticación Cloudflare Access
app.use('*', async (c, next) => {
    const jwt = c.req.header('CF-Access-JWT-Assertion');

    if (!jwt) {
        return c.json({
            success: false,
            error: 'Access denied',
            code: 'ACCESS_DENIED',
        }, 401);
    }

    // Aquí validaríamos el JWT con Cloudflare Access
    // Por simplicidad, asumimos que está presente y es válido
    await next();
});

// GET /api/pagerduty/alerts - Listar alertas recientes
app.get('/', async (c) => {
    try {
        const PAGERDUTY_API_KEY = c.env.PAGERDUTY_API_KEY;
        const PAGERDUTY_EMAIL = c.env.PAGERDUTY_EMAIL;

        const response = await fetch('https://api.pagerduty.com/incidents', {
            headers: {
                'Authorization': `Token token=${PAGERDUTY_API_KEY}`,
                'Accept': 'application/vnd.pagerduty+json;version=2',
                'From': PAGERDUTY_EMAIL,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`PagerDuty API error: ${response.status}`);
        }

        const data = await response.json();
        const alerts = data.incidents.map(incident => ({
            id: incident.id,
            title: incident.title,
            description: incident.description,
            status: incident.status,
            urgency: incident.urgency,
            createdAt: incident.created_at,
            service: incident.service,
            assignees: incident.assignees || [],
            lastUpdated: incident.last_status_change_at,
            url: incident.html_url,
        }));

        return c.json({
            success: true,
            data: alerts,
            meta: {
                count: alerts.length,
                critical: alerts.filter(a => a.urgency === 'high' && a.status !== 'resolved').length,
                unresolved: alerts.filter(a => a.status !== 'resolved').length,
            },
        });

    } catch (error) {
        console.error('PagerDuty fetch error:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch alerts',
            code: 'PAGERDUTY_FETCH_FAILED',
            message: error.message,
        }, 500);
    }
});

// POST /api/pagerduty/alerts/acknowledge - Reconocer alerta
app.post('/acknowledge', async (c) => {
    try {
        const body = await c.req.json();
        const { incidentId, userId } = body;

        const PAGERDUTY_API_KEY = c.env.PAGERDUTY_API_KEY;
        const PAGERDUTY_EMAIL = c.env.PAGERDUTY_EMAIL;

        const response = await fetch(`https://api.pagerduty.com/incidents/${incidentId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token token=${PAGERDUTY_API_KEY}`,
                'Accept': 'application/vnd.pagerduty+json;version=2',
                'From': PAGERDUTY_EMAIL,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                incident: {
                    type: 'incident_reference',
                    status: 'acknowledged',
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`PagerDuty API error: ${response.status}`);
        }

        // Registrar la acción en logs
        await c.env.ADMIN_LOGS.put(`acknowledge:${Date.now()}`, JSON.stringify({
            incidentId,
            userId,
            timestamp: new Date().toISOString(),
            action: 'acknowledge',
        }));

        return c.json({
            success: true,
            message: 'Incident acknowledged successfully',
        });

    } catch (error) {
        console.error('PagerDuty acknowledge error:', error);
        return c.json({
            success: false,
            error: 'Failed to acknowledge incident',
            code: 'PAGERDUTY_ACKNOWLEDGE_FAILED',
        }, 500);
    }
});

export default app;
