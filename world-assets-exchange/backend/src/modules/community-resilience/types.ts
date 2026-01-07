
import { z } from 'zod';

// ==================== GEO TYPES ====================
export const GeoPointSchema = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().optional(), // en metros
    timestamp: z.number().optional()
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;

// ==================== BARTER TYPES ====================
export type BarterType = 'goods' | 'service' | 'knowledge' | 'emergency';
export type BarterStatus = 'active' | 'pending' | 'completed' | 'cancelled' | 'expired';

export const BaseOfferSchema = z.object({
    id: z.string().uuid(),
    userId: z.string(),
    type: z.enum(['goods', 'service', 'knowledge', 'emergency']),
    category: z.string(), // e.g., 'agriculture', 'fishing', 'health'
    title: z.string(),
    description: z.string(),
    images: z.array(z.string()).optional(),
    location: GeoPointSchema,
    region: z.string(), // e.g., 'mx-chihuahua'
    createdAt: z.date(),
    expiresAt: z.date().optional(),
    status: z.enum(['active', 'pending', 'completed', 'cancelled', 'expired']),
    metadata: z.record(z.string(), z.any()).optional()
});

export type BaseOffer = z.infer<typeof BaseOfferSchema>;

// ==================== SPECIFIC DOMAIN SCHEMAS ====================

// 🌾 Agri-Barter
export const CropOfferSchema = BaseOfferSchema.extend({
    category: z.literal('agriculture'),
    details: z.object({
        cropName: z.string(),
        quantity: z.number(),
        unit: z.string(), // kg, ton, costal
        harvestDate: z.string().optional(),
        isOrganic: z.boolean().default(false)
    })
});

// 🎣 Fisher-Barter
export const FishOfferSchema = BaseOfferSchema.extend({
    category: z.literal('fishing'),
    details: z.object({
        species: z.string(), // Totoaba, Camarón
        preservation: z.enum(['fresh', 'frozen', 'dried', 'salted']),
        port: z.string(),
        fishingMethod: z.string().optional()
    })
});

// 🆘 Emergency
export const EmergencyNeedSchema = z.object({
    id: z.string().uuid(),
    userId: z.string(),
    type: z.enum(['water', 'food', 'medicine', 'shelter', 'transport', 'rescue']),
    urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string(),
    location: GeoPointSchema,
    contactPhone: z.string().optional(), // SMS fallback
    status: z.enum(['active', 'resolved']),
    reportedAt: z.date()
});

// 🏺 Artisan & Skills
export const SkillSchema = z.object({
    id: z.string().uuid(),
    userId: z.string(),
    category: z.string(), // 'mechanic', 'healer', 'artisan'
    skillName: z.string(),
    description: z.string(),
    verificationCount: z.number().default(0), // Community verification
    verifiedBy: z.array(z.string()).default([]), // User IDs
    location: GeoPointSchema
});

// ==================== TRUE DEMAND ADS TYPES ====================
export const UserNeedSchema = z.object({
    id: z.string().uuid().optional(),
    userId: z.string(),
    category: z.string(),
    query: z.string(), // Raw search query or inferred need
    explicit: z.boolean(), // True if user posted "I need X", False if inferred from search history
    confidence: z.number().min(0).max(1), // 1.0 for explicit, <1.0 for inferred
    status: z.enum(['active', 'fulfilled', 'expired']),
    createdAt: z.date(),
    lastSeenAt: z.date()
});

export type UserNeed = z.infer<typeof UserNeedSchema>;

export const AdEngagementEventSchema = z.object({
    adId: z.string(),
    userId: z.string(),
    type: z.enum(['view', 'open', 'contact', 'completed']),
    timestamp: z.date(),
    metadata: z.record(z.string(), z.any()).optional()
});

export type AdEngagementEvent = z.infer<typeof AdEngagementEventSchema>;
