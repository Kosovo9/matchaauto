import { z } from 'zod';
import { BaseOfferSchema } from '../../types';

// ==================== CULTURAL BARTER TYPES ====================
export const CulturalOfferSchema = BaseOfferSchema.extend({
    category: z.literal('cultural'),
    details: z.object({
        type: z.enum(['workshop', 'performance', 'exhibition', 'event', 'space']),
        title: z.string(), // "Taller de Danza Folklórica"
        capacity: z.number(),
        date: z.string().optional(),
        needs: z.array(z.string()) // ["madera para tarima", "pintura", "transporte"]
    })
});

export type CulturalOffer = z.infer<typeof CulturalOfferSchema>;

// ==================== INDIGENOUS LANGUAGE TYPES ====================
export const LanguageSchema = z.object({
    code: z.string(), // ISO 639-3 or custom
    name: z.string(), // "Rarámuri"
    nativeName: z.string(), // "Ralámuli"
    country: z.string(), // "México"
    region: z.string(), // "Chihuahua"
    status: z.enum(['vulnerable', 'endangered', 'critically_endangered', 'extinct', 'revitalized']),
    speakers: z.number(),
    resources: z.array(z.object({
        type: z.enum(['audio', 'video', 'text', 'dictionary']),
        title: z.string(),
        url: z.string(),
        offlineAvailable: z.boolean().default(true)
    }))
});

export type Language = z.infer<typeof LanguageSchema>;
