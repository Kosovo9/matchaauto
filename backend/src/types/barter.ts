import { z } from 'zod';

export const BaseOfferSchema = z.object({
    id: z.string().uuid().optional(),
    userId: z.string().uuid(),
    type: z.enum(['give', 'take', 'swap']),
    title: z.string().min(3),
    description: z.string(),
    location: z.object({
        lat: z.number(),
        lng: z.number()
    }),
    status: z.enum(['active', 'completed', 'cancelled']).default('active'),
    metadata: z.record(z.string(), z.any()).optional(),
    createdAt: z.date().optional()
});

export type BaseOffer = z.infer<typeof BaseOfferSchema>;
