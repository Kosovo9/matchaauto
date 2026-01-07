import { Hono } from 'hono';
import { ProEngineService } from '../../../shared/services/pro-engine.service';
import { getPersistentLang } from '../../../shared/utils/i18n-persistence';
import { FinTechSafeService } from '../../../shared/services/fintech-safe.service';
import { GrowthMasterService } from '../../../shared/services/growth-master.service';

const pro = new Hono();

/**
 * 🌐 GLOBAL MARKETPLACE PRO: 100x Optimized Wholesale & Trade
 */
pro.post('/all-in-one', async (c) => {
    const body = await c.req.json();
    const lang = getPersistentLang();
    const service = c.get('proService') as ProEngineService;

    // Titan Suite integration
    const [security, finance, geo, tax] = await Promise.all([
        service.secureAudit(body.id, body),
        service.getFinancialEstimate(body.price, body.currency, lang),
        service.registerSearchActivity(body.lat, body.lng, body.category),
        FinTechSafeService.estimateFinalPriceWithTaxes(body.price, body.country || 'MX', 'commodity')
    ]);

    return c.json({
        status: 'GLOBAL_TRADE_ULTRA_OPTIMIZED',
        security,
        finance,
        geo,
        tax,
        language: lang,
        metrics: await GrowthMasterService.getGlobalGrowthMetrics()
    });
});

/**
 * 🛒 WHOLESALE FLASH SALE (Growth Loop)
 */
pro.post('/wholesale/flash-sale', async (c) => {
    const { listingId } = await c.req.json();
    const result = await GrowthMasterService.triggerFlashSale(listingId, 200); // 200km radius for B2B
    return c.json(result);
});

// Feature 9: Chat con Traducción
pro.post('/chat/v2/translate', async (c) => {
    const { text, targetLang } = await c.req.json();
    const service = c.get('proService') as ProEngineService;
    const translated = await service.translateMessage(text, targetLang);
    return c.json({ translated });
});

export default pro;
