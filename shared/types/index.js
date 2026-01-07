import { z } from 'zod';
// ==================== ESQUEMAS BASE ====================
// Base schema para todos los modelos
export const BaseSchema = z.object({
    id: z.string().uuid(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    deletedAt: z.string().datetime().nullable().optional(),
});
// ==================== USUARIO ====================
// Schema de usuario (sincronizado con Clerk)
export const UserSchema = BaseSchema.extend({
    clerkId: z.string(),
    email: z.string().email(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    // Metadatos de perfil
    isVerified: z.boolean().default(false),
    isBanned: z.boolean().default(false),
    reputation: z.number().int().min(0).default(0),
    trustScore: z.number().min(0).max(100).default(50),
    // Preferencias
    preferences: z.object({
        emailNotifications: z.boolean().default(true),
        pushNotifications: z.boolean().default(true),
        language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
        currency: z.enum(['USD', 'EUR', 'GBP', 'SOL']).default('USD'),
        theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    }).default({}),
    // Stats
    stats: z.object({
        listingsCount: z.number().int().min(0).default(0),
        soldCount: z.number().int().min(0).default(0),
        purchasedCount: z.number().int().min(0).default(0),
        reviewsCount: z.number().int().min(0).default(0),
        averageRating: z.number().min(0).max(5).default(0),
        totalVolume: z.number().min(0).default(0),
    }).default({}),
    // Social
    socialLinks: z.array(z.object({
        platform: z.enum(['twitter', 'telegram', 'discord', 'github']),
        url: z.string().url(),
        isPublic: z.boolean().default(true),
    })).max(5).default([]),
    // Wallet
    walletAddress: z.string().nullable().optional(),
    walletVerified: z.boolean().default(false),
    // Metadata extendible
    metadata: z.record(z.any()).default({}),
});
// ==================== LISTING ====================
// Schema de listing (marketplace)
export const ListingSchema = BaseSchema.extend({
    userId: z.string().uuid(),
    title: z.string().min(3).max(100),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    content: z.string().min(10).max(5000),
    excerpt: z.string().max(200).optional(),
    // Categorización
    category: z.enum([
        'electronics', 'fashion', 'home', 'vehicles',
        'real-estate', 'services', 'digital', 'collectibles'
    ]),
    subcategory: z.string().max(50).optional(),
    tags: z.array(z.string().max(20)).max(10).default([]),
    // Precio
    price: z.number().positive().max(1000000),
    currency: z.enum(['USD', 'EUR', 'GBP', 'SOL']).default('USD'),
    priceInSol: z.number().positive().optional(),
    isNegotiable: z.boolean().default(false),
    // Condición
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor']).default('good'),
    conditionDetails: z.string().max(500).optional(),
    // Ubicación
    location: z.object({
        city: z.string().max(50),
        country: z.string().length(2),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
        isPublic: z.boolean().default(false),
    }),
    // Estado
    status: z.enum([
        'draft', 'active', 'reserved', 'sold',
        'expired', 'hidden', 'banned'
    ]).default('draft'),
    // Moderación
    moderationStatus: z.enum(['pending', 'approved', 'rejected', 'flagged']).default('pending'),
    toxicityScore: z.number().min(0).max(1).default(0),
    moderationNotes: z.string().max(500).optional(),
    // Metadatos de venta
    viewCount: z.number().int().min(0).default(0),
    saveCount: z.number().int().min(0).default(0),
    inquiryCount: z.number().int().min(0).default(0),
    lastViewedAt: z.string().datetime().optional(),
    // Fechas importantes
    publishedAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
    // Relaciones
    images: z.array(z.object({
        id: z.string().uuid(),
        url: z.string().url(),
        position: z.number().int().min(0),
        isPrimary: z.boolean().default(false),
        caption: z.string().max(200).optional(),
    })).max(10).default([]),
    // Características específicas por categoría
    attributes: z.record(z.any()).default({}),
    // Metadata extendible
    metadata: z.record(z.any()).default({}),
});
// ==================== TRANSACCIÓN ====================
// Schema de transacción
export const TransactionSchema = BaseSchema.extend({
    // Identificadores
    listingId: z.string().uuid(),
    sellerId: z.string().uuid(),
    buyerId: z.string().uuid(),
    // Detalles de pago
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP', 'SOL']),
    amountInSol: z.number().positive().optional(),
    exchangeRate: z.number().positive().optional(),
    // Método de pago
    paymentMethod: z.enum([
        'escrow', 'direct', 'crypto', 'bank_transfer',
        'card', 'paypal', 'cash'
    ]),
    paymentProvider: z.string().max(50).optional(),
    paymentId: z.string().max(100).optional(),
    // Estado
    status: z.enum([
        'pending', 'processing', 'completed',
        'cancelled', 'refunded', 'disputed', 'failed'
    ]).default('pending'),
    // Fechas de estado
    paidAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    cancelledAt: z.string().datetime().optional(),
    refundedAt: z.string().datetime().optional(),
    // Detalles de envío
    shipping: z.object({
        method: z.string().max(50),
        trackingNumber: z.string().max(100).optional(),
        carrier: z.string().max(50).optional(),
        estimatedDelivery: z.string().datetime().optional(),
        deliveredAt: z.string().datetime().optional(),
        address: z.object({
            line1: z.string().max(100),
            line2: z.string().max(100).optional(),
            city: z.string().max(50),
            state: z.string().max(50),
            country: z.string().length(2),
            postalCode: z.string().max(20),
        }).optional(),
    }).optional(),
    // Comisiones y fees
    fees: z.object({
        platformFee: z.number().min(0).default(0),
        processingFee: z.number().min(0).default(0),
        shippingFee: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
        totalFees: z.number().min(0).default(0),
    }).default({}),
    // Desglose de montos
    breakdown: z.object({
        subtotal: z.number().min(0),
        fees: z.number().min(0),
        tax: z.number().min(0),
        total: z.number().min(0),
        sellerReceives: z.number().min(0),
    }),
    // Disputas
    dispute: z.object({
        isDisputed: z.boolean().default(false),
        openedAt: z.string().datetime().optional(),
        openedBy: z.string().uuid().optional(),
        reason: z.string().max(500).optional(),
        resolution: z.enum(['seller', 'buyer', 'split', 'refund']).optional(),
        resolvedAt: z.string().datetime().optional(),
    }).optional(),
    // Mensajes y comunicación
    messages: z.array(z.object({
        id: z.string().uuid(),
        senderId: z.string().uuid(),
        content: z.string().max(1000),
        timestamp: z.string().datetime(),
        isRead: z.boolean().default(false),
    })).default([]),
    // Calificaciones
    rating: z.object({
        buyerToSeller: z.number().min(1).max(5).optional(),
        sellerToBuyer: z.number().min(1).max(5).optional(),
        feedback: z.string().max(500).optional(),
        leftAt: z.string().datetime().optional(),
    }).optional(),
    // Metadata extendible
    metadata: z.record(z.any()).default({}),
});
// ==================== MISCELÁNEES ====================
// Review Schema
export const ReviewSchema = BaseSchema.extend({
    transactionId: z.string().uuid(),
    reviewerId: z.string().uuid(),
    revieweeId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    title: z.string().max(100).optional(),
    content: z.string().max(1000),
    isPublic: z.boolean().default(true),
    response: z.string().max(1000).optional(),
    respondedAt: z.string().datetime().optional(),
});
// Message Schema
export const MessageSchema = BaseSchema.extend({
    conversationId: z.string().uuid(),
    senderId: z.string().uuid(),
    recipientId: z.string().uuid(),
    content: z.string().max(5000),
    contentType: z.enum(['text', 'image', 'offer', 'system']).default('text'),
    isRead: z.boolean().default(false),
    readAt: z.string().datetime().optional(),
    metadata: z.record(z.any()).default({}),
});
// Notification Schema
export const NotificationSchema = BaseSchema.extend({
    userId: z.string().uuid(),
    type: z.enum([
        'listing_viewed', 'offer_received', 'transaction_update',
        'message_received', 'review_received', 'system_alert'
    ]),
    title: z.string().max(100),
    body: z.string().max(500),
    data: z.record(z.any()).default({}),
    isRead: z.boolean().default(false),
    readAt: z.string().datetime().optional(),
    actionUrl: z.string().url().optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
});
// ==================== VALIDATORS TYPE-SAFE ====================
// Type guards
export const isUser = (data) => {
    return UserSchema.safeParse(data).success;
};
export const isListing = (data) => {
    return ListingSchema.safeParse(data).success;
};
export const isTransaction = (data) => {
    return TransactionSchema.safeParse(data).success;
};
//# sourceMappingURL=index.js.map