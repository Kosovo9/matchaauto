import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', cors({
    origin: ['https://admin.match-auto.com', 'http://localhost:3000'],
    allowMethods: ['GET'],
    credentials: true,
}));

// GET /api/sentinel/dashboard - Dashboard principal de Sentinel-X
app.get('/', async (c) => {
    try {
        const kv = c.env.SENTINEL_KV;

        // Obtener métricas recientes
        const [threats, blocks, incidents] = await Promise.all([
            kv.get('threats:recent', 'json'),
            kv.get('blocks:recent', 'json'),
            kv.get('incidents:recent', 'json'),
        ]);

        // Calcular Threat Intensity Index (TII)
        const tii = calculateTII(threats || []);

        // Obtener top amenazas
        const topThreats = await getTopThreats(kv);

        // Obtener actividad geográfica
        const geoActivity = await getGeoActivity(kv);

        return c.json({
            success: true,
            data: {
                threatIntensityIndex: tii,
                summary: {
                    activeThreats: threats?.length || 0,
                    totalBlocks: blocks?.length || 0,
                    incidents24h: incidents?.length || 0,
                    avgThreatScore: calculateAverage(threats),
                },
                topThreats,
                geoActivity,
                recentActivity: threats?.slice(0, 10) || [],
                recommendations: generateRecommendations(tii, threats || []),
            },
        });

    } catch (error) {
        console.error('Sentinel dashboard error:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch sentinel dashboard',
            code: 'SENTINEL_DASHBOARD_FAILED',
        }, 500);
    }
});

// GET /api/sentinel/dashboard/threats - Lista de amenazas detallada
app.get('/threats', async (c) => {
    try {
        const { page = 1, limit = 50, severity, status } = c.req.query();
        const kv = c.env.SENTINEL_KV;

        const allThreats = await kv.list({ prefix: 'threat:' });
        const threats = [];

        // Procesar threats (simplificado)
        for (const key of allThreats.keys) {
            const threat = await kv.get(key.name, 'json');
            if (threat) {
                threats.push(threat);
            }
        }

        // Filtrar
        let filtered = threats;
        if (severity) {
            filtered = filtered.filter(t => t.severity === severity);
        }
        if (status) {
            filtered = filtered.filter(t => t.status === status);
        }

        // Paginar
        const start = (parseInt(page) - 1) * parseInt(limit);
        const end = start + parseInt(limit);
        const paginated = filtered.slice(start, end);

        return c.json({
            success: true,
            data: paginated,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: filtered.length,
                totalPages: Math.ceil(filtered.length / parseInt(limit)),
            },
        });

    } catch (error) {
        console.error('Threats fetch error:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch threats',
            code: 'THREATS_FAILED',
        }, 500);
    }
});

// Funciones auxiliares
function calculateTII(threats) {
    if (!threats || threats.length === 0) return 0;
    const scores = threats.map(t => t.threatScore || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.min(100, avgScore * 1.5);
}

async function getTopThreats(kv) {
    const threats = await kv.get('threats:top', 'json');
    return threats || [
        { type: 'brute_force', count: 45, severity: 'high' },
        { type: 'scraping', count: 32, severity: 'medium' },
        { type: 'spam', count: 28, severity: 'low' },
    ];
}

async function getGeoActivity(kv) {
    const geo = await kv.get('geo:activity', 'json');
    return geo || [
        { country: 'US', count: 124, threatScore: 65 },
        { country: 'CN', count: 89, threatScore: 72 },
        { country: 'RU', count: 67, threatScore: 81 },
        { country: 'BR', count: 45, threatScore: 58 },
    ];
}

function calculateAverage(threats) {
    if (!threats || threats.length === 0) return 0;
    const scores = threats.map(t => t.threatScore || 0);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function generateRecommendations(tii, threats) {
    const recommendations = [];
    if (tii > 80) {
        recommendations.push({
            severity: 'critical',
            title: 'High Threat Intensity',
            action: 'Enable enhanced protection mode',
            priority: 1,
        });
    }
    return recommendations;
}

export default app;
