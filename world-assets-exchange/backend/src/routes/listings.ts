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

import { getSupabase } from '../lib/supabase';

// GET /:id - Obtener un listing real de Supabase
listings.get('/:id', async (c) => {
    const id = c.req.param('id');
    const supabase = getSupabase(c.env);
    const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
    if (error) return c.json({ success: false, error: error.message }, 404);
    return c.json({ success: true, data });
});

// POST / - Crear listing con moderación AI y persistencia Supabase
listings.post(
    '/',
    zValidator('json', createListingSchema),
    async (c) => {
        const payload = c.req.valid('json');
        const supabase = getSupabase(c.env);

        try {
            // Moderación AI (Gemini)
            const orchestrator = new AIOrchestrator(c.env);
            const moderation = await orchestrator.moderateText(`${payload.title} ${payload.description}`);
            if (!moderation.isSafe) {
                return c.json({ success: false, error: 'Contenido inapropiado detectado por AI' }, 422);
            }

            // Persistencia Real en Supabase
            const { data, error } = await supabase
                .from('listings')
                .insert([{ ...payload, user_id: 'quantum-user' }]) // En prod usar auth real
                .select()
                .single();

            if (error) throw error;

            return c.json({ success: true, data, message: 'Listing Live en Supabase' }, 201);
        } catch (error: any) {
            return c.json({ success: false, error: error.message }, 500);
        }
    }
);

// GET / - Listar listings con filtros desde Supabase
listings.get('/', async (c) => {
    const { query, category } = c.req.query();
    const supabase = getSupabase(c.env);

    let dbQuery = supabase.from('listings').select('*');

    if (category && category !== 'ALL') {
        dbQuery = dbQuery.eq('category', category);
    }
    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) return c.json({ success: false, error: error.message }, 500);

    return c.json({
        success: true,
        data: data || [],
        meta: { count: data?.length || 0, source: 'Supabase Live' }
    });
});

export default listings;
