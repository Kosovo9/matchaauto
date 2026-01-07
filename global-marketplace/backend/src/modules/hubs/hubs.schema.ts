import { z } from 'zod';

export const HubStatusSchema = z.enum(['active', 'dormant', 'archived']);

export const HubSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(3).max(100),
    purpose: z.string().min(10).max(500),
    createdAt: z.date().optional(),
    status: HubStatusSchema.default('active'),
    memberCount: z.number().default(0),
    completedExchanges: z.number().default(0),
    moderatorId: z.string().optional(),
    language: z.string().default('es'),
    metadata: z.record(z.string(), z.any()).optional()
});

export const SignalTypeSchema = z.enum(['offer', 'request', 'exchange-confirmed', 'viral-invite']);

export const SignalSchema = z.object({
    id: z.string().uuid().optional(),
    hubId: z.string().uuid(),
    type: SignalTypeSchema,
    content: z.string().min(1),
    senderId: z.string(),
    ttl: z.number().default(24), // hours
    delivery: z.enum(['sms', 'pwa', 'bluetooth', 'push']).default('pwa'),
    createdAt: z.date().optional()
});

export type Hub = z.infer<typeof HubSchema>;
export type Signal = z.infer<typeof SignalSchema>;
export type HubStatus = z.infer<typeof HubStatusSchema>;
export type SignalType = z.infer<typeof SignalTypeSchema>;
