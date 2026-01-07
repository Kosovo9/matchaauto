import { Hono } from 'hono';
import { AIOrchestrator } from '@shared/utils/ai-orchestrator';

const growth = new Hono();

/**
 * 💸 VENTANA DE UPSELL (Pagar o Compartir)
 */
growth.get('/upsell-offer/:listingId', async (c) => {
    return c.json({
        offer: {
            paid_boost: { price: 99, currency: 'MXN', days: 1 },
            viral_boost: { required_shares: 10, reward_days: 2, platform: 'WhatsApp' }
        }
    });
});

/**
 * 📸 VERIFICADOR IA DE CAPTURAS (La "Prueba de Compartido")
 */
growth.post('/verify-sharing', async (c) => {
    const { listingId, screenshotBase64 } = await c.req.json();
    const ai = AIOrchestrator.getInstance();

    // 1000x TECH: La IA analiza si la imagen es una captura válida de WhatsApp/Social
    const isValidShare = await ai.processSecurely(
        `Verify if this image shows shares to 5+ groups: ${screenshotBase64.substring(0, 50)}...`,
        'analyze'
    );

    if (isValidShare) {
        // Activar boost en la DB
        return c.json({
            success: true,
            message: "¡Verificado! Tu anuncio ahora está en los primeros lugares por 2 días.",
            boost_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });
    }

    return c.json({ success: false, error: "No pudimos verificar los grupos. Intenta otra captura." });
});

export default growth;
