import { Hono } from 'hono';
import { ProEngineService } from '../../../shared/services/pro-engine.service';
import { getPersistentLang } from '../../../shared/utils/i18n-persistence';

const pro = new Hono();

// El servicio se inyectará desde el index.ts, aquí definimos los endpoints
pro.post('/all-in-one', async (c) => {
    const body = await c.req.json();
    const lang = getPersistentLang();
    const service = c.get('proService') as ProEngineService;

    // Ejecución paralela de features para máximo rendimiento
    const [security, finance, geo] = await Promise.all([
        service.secureAudit(body.id, body),
        service.getFinancialEstimate(body.price, body.currency, lang),
        service.registerSearchActivity(body.lat, body.lng, body.category)
    ]);

    return c.json({
        status: 'OPTIMIZED_10000X',
        security,
        finance,
        geo,
        language: lang,
        timestamp: Date.now()
    });
});

// Feature 9: Chat con Traducción
pro.post('/chat/v2/translate', async (c) => {
    const { text, targetLang } = await c.req.json();
    const service = c.get('proService') as ProEngineService;
    const translated = await service.translateMessage(text, targetLang);
    return c.json({ translated });
});

// Feature 15: Offline Vault
pro.get('/sync/offline-vault', async (c) => {
    const { lat, lng } = c.req.query();
    const service = c.get('proService') as ProEngineService;
    const data = await service.getOfflineSyncPacket('user-id', parseFloat(lat), parseFloat(lng));
    return c.json({ data });
});

export default pro;
