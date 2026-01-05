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

// Tipos inferidos
export type User = z.infer<typeof UserSchema>;
export type UserPreferences = User['preferences'];
export type UserStats = User['stats'];

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

// Tipos inferidos
export type Listing = z.infer<typeof ListingSchema>;
export type ListingStatus = Listing['status'];
export type ListingCondition = Listing['condition'];
export type ListingLocation = Listing['location'];
export type ListingImage = Listing['images'][0];

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

// Tipos inferidos
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionStatus = Transaction['status'];
export type TransactionPaymentMethod = Transaction['paymentMethod'];
export type TransactionFees = Transaction['fees'];
export type TransactionShipping = Transaction['shipping'];

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

export type Review = z.infer<typeof ReviewSchema>;

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

export type Message = z.infer<typeof MessageSchema>;

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

export type Notification = z.infer<typeof NotificationSchema>;

// ==================== VALIDATORS TYPE-SAFE ====================

// Type guards
export const isUser = (data: unknown): data is User => {
    return UserSchema.safeParse(data).success;
};

export const isListing = (data: unknown): data is Listing => {
    return ListingSchema.safeParse(data).success;
};

export const isTransaction = (data: unknown): data is Transaction => {
    return TransactionSchema.safeParse(data).success;
};

// Partial types for updates
export type UserUpdate = Partial<z.infer<typeof UserSchema>>;
export type ListingUpdate = Partial<z.infer<typeof ListingSchema>>;
export type TransactionUpdate = Partial<z.infer<typeof TransactionSchema>>;

// Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    traceId?: string;
    timestamp: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
    };
}

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Filters
export interface ListingFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: ListingCondition;
    location?: string;
    search?: string;
    status?: ListingStatus;
    userId?: string;
}

// Exportar todo
export {
    UserSchema,
    ListingSchema,
    TransactionSchema,
    ReviewSchema,
    MessageSchema,
    NotificationSchema,
};

// Utility type para environment de Cloudflare
export interface Env {
    // Base de datos
    DB: D1Database;

    // KV namespaces
    VIRAL_DATA: KVNamespace;
    B2B_KEYS: KVNamespace;
    SESSION_STORE: KVNamespace;

    // Queues
    LISTING_EVENTS_QUEUE: any;
    EXPORT_QUEUE: any;
    ERROR_REPORTING_QUEUE: any;

    // Environment variables
    SOLANA_RPC_URL: string;
    SOLANA_NETWORK: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    AI_TOXICITY_THRESHOLD: string;
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
    VERSION: string;

    // Secrets
    API_KEY_SALT: string;
    ENCRYPTION_KEY: string;
}
