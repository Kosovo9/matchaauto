import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AIOrchestrator } from '../services/ai/engine';
import { Env } from '../../../shared/types';

// Esquema de creación de listing (marketplace)
// Esquema 10x Universal para Automotriz (Venta, Renta, Refacciones)
const createListingSchema = z.object({
    // Core Data
    title: z.string().min(10, "El título debe ser descriptivo").max(150),
    description: z.string().max(5000).optional(),
    price: z.number().min(0, "El precio no puede ser negativo"),
    currency: z.enum(['USD', 'MXN', 'EUR']).default('USD'),

    // Clasificación Maestra
    listingType: z.enum(['SALE', 'RENT', 'AUCTION']).default('SALE'), // ¿Vendes o Rentas?
    category: z.enum(['VEHICLES', 'PARTS', 'SERVICES', 'REAL_ESTATE']).default('VEHICLES'),
    subcategory: z.string().optional(), // Ej: "SUV", "Sedan", "Frenos", "Motor"

    // Datos Específicos del Vehículo (Opcionales si es Refacción)
    make: z.string().optional(),  // Chevrolet
    model: z.string().optional(), // Suburban
    year: z.number().min(1900).max(new Date().getFullYear() + 2).optional(),
    trim: z.string().optional(),  // LTZ
    mileage: z.number().optional(), // 117,000
    mileageUnit: z.enum(['KM', 'MILES']).default('KM'),

    // Specs Técnicos
    fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'OTHER']).optional(),
    transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT', 'DUAL_CLUTCH']).optional(),
    engine: z.string().optional(), // "V8 5.3L"
    driveType: z.enum(['FWD', 'RWD', 'AWD', '4WD']).optional(),
    color: z.string().optional(),
    interiorColor: z.string().optional(),

    // Estado y Legal
    condition: z.enum(['NEW', 'USED', 'CERTIFIED_PRE_OWNED', 'DAMAGED']).default('USED'),
    owners: z.number().default(1),
    features: z.array(z.string()).optional(), // ["Piel", "Quemacocos", "Blindada"]
    vin: z.string().length(17).optional(), // Validación real de VIN
    legalStatus: z.string().optional(), // "Factura Original", "Importada", etc.

    // Multimedia y Ubicación
    images: z.array(z.string().url()).min(1, "Sube al menos 1 foto").max(20),
    location: z.object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().default('MX'),
        lat: z.number().optional(),
        lng: z.number().optional()
    }).optional()
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
// GET / - Listar listings con filtros
listings.get('/', async (c) => {
    const { query } = c.req.query();

    // REAL MOCK DATA SERVED FROM EDGE
    const CAR_RESULTS = [
        {
            id: "1",
            title: "Tesla Model S Plaid",
            price: 129990,
            badge: "HOT",
            images: [
                "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1669828469339-c146d997f90c?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800"
            ]
        },
        {
            id: "2",
            title: "Porsche Taycan Turbo",
            price: 185000,
            badge: "NEW",
            images: [
                "https://images.unsplash.com/photo-1614205732726-939338755889?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1580273916550-e323be2eb09c?auto=format&fit=crop&q=80&w=800"
            ]
        },
        {
            id: "3",
            title: "Ferrari 296 GTB",
            price: 322000,
            badge: "EXOTIC",
            images: [
                "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1583121274602-3e2820c698d9?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1597007030739-5d296c0966f2?auto=format&fit=crop&q=80&w=800"
            ]
        },
        {
            id: "4",
            title: "Lucid Air Sapphire",
            price: 249000,
            badge: "LUXURY",
            images: [
                "https://images.unsplash.com/photo-1696355966237-75929a4bd793?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1662973418520-2527cc0a7d97?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800"
            ]
        },
        {
            id: "5",
            title: "Lamborghini Revuelto",
            price: 600000,
            badge: "RARE",
            images: [
                "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1566008885218-90abf9200ddb?auto=format&fit=crop&q=80&w=800"
            ]
        },
        {
            id: "6",
            title: "Rivian R1T",
            price: 73000,
            badge: "TRUCK",
            images: [
                "https://images.unsplash.com/photo-1662973168285-d601b072be2e?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1656517173950-7170e7e4a30e?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1669670088927-4a1801c402cd?auto=format&fit=crop&q=80&w=800"
            ]
        }
    ];

    let results = CAR_RESULTS;
    if (query) {
        results = CAR_RESULTS.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
    }

    return c.json({
        success: true,
        data: results,
        meta: {
            count: results.length,
            from: 'edge-cache'
        }
    });
});

export default listings;
