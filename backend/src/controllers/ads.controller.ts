import { Hono } from 'hono';

const ads = new Hono();

// Umbral para Escrow VIP (5 Millones de Pesos)
const ESCROW_THRESHOLD_MXN = 5000000;

/**
 * 📢 Sistema de Ads (97% del Ingreso)
 */
ads.post('/plans', async (c) => {
    return c.json({
        success: true,
        plans: [
            { id: 'basic', name: 'Gratis', price: 0, features: ['Publicación estándar', '10 fotos'] },
            { id: 'premium', name: 'Premium', price: 899, currency: 'MXN', features: ['Featured #1', 'Short Video Clips', '360º Product Tour'] },
            { id: 'diamond', name: 'Elite Diamond', price: 2500, currency: 'MXN', features: ['Regional Blast', 'VR 3D Tour', 'Prioridad AI-Search'] }
        ]
    });
});

/**
 * 🔒 Escrow Elite (Solo Inmobiliaria > 5M)
 */
ads.post('/escrow/verify-eligibility', async (c) => {
    const { price, category } = await c.req.json();

    if (category === 'real_estate' && price >= ESCROW_THRESHOLD_MXN) {
        return c.json({
            eligible: true,
            message: "Este activo califica para Escrow de Alta Seguridad (Opcional).",
            disclaimer: "Match-Autos NO se hace responsable de la finalidad de la venta ni participará en disputas legales."
        });
    }

    return c.json({
        eligible: false,
        message: "Transacción directa habilitada. Use Ads para vender más rápido."
    });
});

export default ads;
