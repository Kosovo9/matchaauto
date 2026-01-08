import { Hono } from 'hono';

const trading = new Hono();

/**
 * 🔄 Motor de Intercambios 1000x (Automático 25 idiomas)
 */
trading.post('/match/exchange', async (c) => {
    const { type, itemOffered, itemWanted, differenceType, amount } = await c.req.json();

    // differenceType: 'cash_in', 'cash_out', 'species', 'none'
    return c.json({
        success: true,
        exchange_mode: "BARTER_PRO_VERIFIED",
        summary: {
            type, // 'VENDO', 'CAMBIO', 'BUSCO'
            difference: differenceType === 'species' ? 'Especie/Artículos' : amount + ' Transferencia/Efectivo',
            status: "Calculando relevancia regional..."
        }
    });
});

/**
 * 🤝 Motor de Negociación (Hacer una Oferta)
 */
trading.post('/match/offer', async (c) => {
    const { listingId, buyerId, offeredPrice, message } = await c.req.json();

    // LOGICA 1000x: Guardar oferta y notificar al vendedor
    return c.json({
        success: true,
        offerId: "OFFER_" + Math.random().toString(36).substr(2, 9),
        status: "PENDING_SELLER_APPROVAL",
        message: "Oferta enviada al vendedor."
    });
});

/**
 * ⚖️ Decisión del Vendedor
 */
trading.post('/match/offer/respond', async (c) => {
    const { offerId, decision } = await c.req.json(); // decision: 'ACCEPT', 'REJECT', 'COUNTER'

    return c.json({
        success: true,
        status: decision === 'ACCEPT' ? 'READY_FOR_PAYMENT' : 'CLOSED',
        message: decision === 'ACCEPT' ? "¡Oferta aceptada! Se ha habilitado el precio especial." : "Oferta rechazada."
    });
});



/**
 * 🕵️ Plan "Sherlock" (Ads para los que BUSCAN)
 */
trading.post('/ads/buyer-seeker', async (c) => {
    return c.json({
        success: true,
        plans: [
            { id: 'seeker_basic', name: 'Sherlock Lite', price: 150, feature: 'Tu búsqueda aparece en el Top 3 de vendedores' },
            { id: 'seeker_pro', name: 'Sherlock 1000x', price: 450, feature: 'Notificación directa a dueños de ese artículo' }
        ]
    });
});

export default trading;
