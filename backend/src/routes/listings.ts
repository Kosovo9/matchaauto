import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AIOrchestrator } from '../services/ai/engine';
import { Env } from '../../../shared/types';

// Esquema de creación de listing (marketplace)
const createListingSchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().max(5000).optional(),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    price: z.number().min(0),
    mileage: z.number().min(0).optional(),
    fuelType: z.enum(['gasoline', 'diesel', 'electric', 'hybrid', 'other']).optional(),
    transmission: z.enum(['manual', 'automatic']).optional(),
    images: z.array(z.string().url()).max(10).optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    category: z.enum([
        'electronics', 'fashion', 'home', 'vehicles',
        'real-estate', 'services', 'digital', 'collectibles'
    ]).default('vehicles'),
});

const listings = new Hono<{ Bindings: Env }>();

// GET /:id - Obtener un listing
listings.get('/:id', async (c) => {
    const id = c.req.param('id');
    // Implementación real llamaría a D1
    return c.json({ success: true, data: { id, title: "Sample Porsche 911" } });
});

// POST / - Crear listing con moderación AI
listings.post(
    '/',
    zValidator('json', createListingSchema),
    async (c) => {
        const data = c.req.valid('json');
        const userId = c.get('userId' as any) || 'anonymous';

        // Iniciar transacción
        const db = c.env.DB;

        try {
            // 1. Moderación de contenido con AI
            const orchestrator = new AIOrchestrator(c.env);
            const contentToModerate = `${data.title} ${data.description || ''}`;
            const moderationResult = await orchestrator.moderateText(contentToModerate);

            // 2. Validar toxicidad (threshold configurable)
            const TOXICITY_THRESHOLD = parseFloat(c.env.AI_TOXICITY_THRESHOLD || '0.7');

            if (!moderationResult.isSafe && moderationResult.confidence > TOXICITY_THRESHOLD) {
                return c.json({
                    success: false,
                    error: 'Content rejected',
                    code: 'CONTENT_MODERATION_FAILED',
                    details: {
                        toxicityScore: moderationResult.confidence,
                        threshold: TOXICITY_THRESHOLD,
                    },
                    suggestion: 'Please revise your content and remove any inappropriate language.',
                }, 422);
            }

            // 3. Simulación de guardado en D1 (ya que el esquema SQL exacto puede variar)
            const listingId = crypto.randomUUID();

            // En un escenario real, ejecutaríamos el INSERT aquí
            /*
            await db.prepare(`
              INSERT INTO listings (id, user_id, title, description, make, model, year, price, category, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              listingId, userId, data.title, data.description, data.make, data.model, data.year, data.price, data.category, new Date().toISOString()
            ).run();
            */

            // 4. Publicar evento de listing creado (para ViralService si existiera una cola)
            if (c.env.LISTING_EVENTS_QUEUE) {
                await c.env.LISTING_EVENTS_QUEUE.send({
                    userId,
                    type: 'listing_created',
                    listingId,
                    price: data.price,
                });
            }

            return c.json({
                success: true,
                message: 'Listing created successfully (Edge Moderated)',
                data: {
                    id: listingId,
                    ...data,
                    moderation: {
                        isSafe: moderationResult.isSafe,
                        score: moderationResult.confidence
                    }
                }
            }, 201);

        } catch (error: any) {
            console.error('Listing creation failed:', error);

            return c.json({
                success: false,
                error: 'Failed to create listing',
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message
            }, 500);
        }
    }
);

// GET / - Listar listings con filtros
listings.get('/', async (c) => {
    const { make, category, minPrice, maxPrice } = c.req.query();

    // Simulación de búsqueda
    return c.json({
        success: true,
        data: [],
        meta: {
            count: 0,
            filters: { make, category, minPrice, maxPrice }
        }
    });
});

export default listings;
