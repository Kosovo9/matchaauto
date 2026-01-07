import { Hono } from 'hono';
import { DeliveryIntelService } from '@shared/services/delivery-intel.service';

const delivery = new Hono();

/**
 * 🚚 MARKETPLACE DELIVERY HUB
 * Focused on low-friction coordination and cost transparency.
 */

// Estimación de costos externos (Sin logística propia)
delivery.post('/quote', async (c) => {
    const { origin, destination, size } = await c.req.json();
    const quotes = await DeliveryIntelService.getExternalQuotes(
        origin.lat, origin.lng,
        destination.lat, destination.lng,
        size
    );

    return c.json({
        success: true,
        quotes,
        note: "Precios referenciales de terceros. Match-Auto facilita la conexión pero no opera el envío."
    });
});

// Sugerencia de puntos de encuentro seguros (Safe Zones)
delivery.get('/safe-meetups', async (c) => {
    const { lat, lng } = c.req.query();
    const points = await DeliveryIntelService.getSafeMeetupPoints(parseFloat(lat), parseFloat(lng));

    return c.json({
        success: true,
        points,
        message: "Recomendamos usar puntos con Safety Score > 80 para entregas personales."
    });
});

// Generar Pin de Entrega (Escrow Release)
delivery.post('/handshake/init', async (c) => {
    const pin = DeliveryIntelService.generateHandshakePin();
    return c.json({
        success: true,
        pin_instructions: "Comparte este PIN con el vendedor/comprador solo al momento de la entrega física.",
        pin
    });
});

export default delivery;
