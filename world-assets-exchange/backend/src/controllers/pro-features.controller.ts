import { Hono } from 'hono';
import { ProEngineService } from '../../../shared/services/pro-engine.service';
import { getPersistentLang } from '../../../shared/utils/i18n-persistence';
import { GeoIntelService } from '../../../shared/services/geo-intel.service';
import { FinTechSafeService } from '../../../shared/services/fintech-safe.service';

const pro = new Hono();

/**
 * 💎 WORLD ASSETS PRO: 100x Real Estate & High-Value Assets
 */
pro.post('/all-in-one', async (c) => {
    const body = await c.req.json();
    const lang = getPersistentLang();
    const service = c.get('proService') as ProEngineService;

    // Environmental & Market Analysis for Assets
    const [security, finance, geo, environmental, tax] = await Promise.all([
        service.secureAudit(body.id, body),
        service.getFinancialEstimate(body.price, body.currency, lang),
        service.registerSearchActivity(body.lat, body.lng, body.category),
        GeoIntelService.getPropertyEnvironmentalAnalysis(body.lat, body.lng),
        FinTechSafeService.estimateFinalPriceWithTaxes(body.price, body.country || 'US', 'real_estate')
    ]);

    return c.json({
        status: 'WORLD_ASSET_ULTRA_OPTIMIZED',
        security,
        finance,
        geo,
        asset_intelligence: environmental,
        final_estimate: tax,
        language: lang,
        verification_hash: "BPC_ASSET_" + Math.random().toString(36).substring(7)
    });
});

/**
 * 🗺️ ASSET SPATIAL ANALYSIS
 */
pro.get('/analysis/environmental', async (c) => {
    const { lat, lng } = c.req.query();
    const result = await GeoIntelService.getPropertyEnvironmentalAnalysis(parseFloat(lat), parseFloat(lng));
    return c.json(result);
});

export default pro;
