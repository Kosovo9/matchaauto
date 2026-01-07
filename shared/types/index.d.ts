import { z } from 'zod';
export declare const BaseSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null | undefined;
}>;
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    clerkId: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    isBanned: z.ZodDefault<z.ZodBoolean>;
    reputation: z.ZodDefault<z.ZodNumber>;
    trustScore: z.ZodDefault<z.ZodNumber>;
    preferences: z.ZodDefault<z.ZodObject<{
        emailNotifications: z.ZodDefault<z.ZodBoolean>;
        pushNotifications: z.ZodDefault<z.ZodBoolean>;
        language: z.ZodDefault<z.ZodEnum<["en", "es", "fr", "de"]>>;
        currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "SOL"]>>;
        theme: z.ZodDefault<z.ZodEnum<["light", "dark", "auto"]>>;
    }, "strip", z.ZodTypeAny, {
        language: "en" | "es" | "fr" | "de";
        currency: "USD" | "EUR" | "GBP" | "SOL";
        emailNotifications: boolean;
        pushNotifications: boolean;
        theme: "light" | "dark" | "auto";
    }, {
        language?: "en" | "es" | "fr" | "de" | undefined;
        currency?: "USD" | "EUR" | "GBP" | "SOL" | undefined;
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
    }>>;
    stats: z.ZodDefault<z.ZodObject<{
        listingsCount: z.ZodDefault<z.ZodNumber>;
        soldCount: z.ZodDefault<z.ZodNumber>;
        purchasedCount: z.ZodDefault<z.ZodNumber>;
        reviewsCount: z.ZodDefault<z.ZodNumber>;
        averageRating: z.ZodDefault<z.ZodNumber>;
        totalVolume: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        listingsCount: number;
        soldCount: number;
        purchasedCount: number;
        reviewsCount: number;
        averageRating: number;
        totalVolume: number;
    }, {
        listingsCount?: number | undefined;
        soldCount?: number | undefined;
        purchasedCount?: number | undefined;
        reviewsCount?: number | undefined;
        averageRating?: number | undefined;
        totalVolume?: number | undefined;
    }>>;
    socialLinks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        platform: z.ZodEnum<["twitter", "telegram", "discord", "github"]>;
        url: z.ZodString;
        isPublic: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        platform: "twitter" | "telegram" | "discord" | "github";
        isPublic: boolean;
    }, {
        url: string;
        platform: "twitter" | "telegram" | "discord" | "github";
        isPublic?: boolean | undefined;
    }>, "many">>;
    walletAddress: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    walletVerified: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    preferences: {
        language: "en" | "es" | "fr" | "de";
        currency: "USD" | "EUR" | "GBP" | "SOL";
        emailNotifications: boolean;
        pushNotifications: boolean;
        theme: "light" | "dark" | "auto";
    };
    stats: {
        listingsCount: number;
        soldCount: number;
        purchasedCount: number;
        reviewsCount: number;
        averageRating: number;
        totalVolume: number;
    };
    reputation: number;
    email: string;
    clerkId: string;
    username: string;
    isVerified: boolean;
    isBanned: boolean;
    trustScore: number;
    socialLinks: {
        url: string;
        platform: "twitter" | "telegram" | "discord" | "github";
        isPublic: boolean;
    }[];
    walletVerified: boolean;
    deletedAt?: string | null | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatarUrl?: string | undefined;
    bio?: string | undefined;
    walletAddress?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    email: string;
    clerkId: string;
    username: string;
    metadata?: Record<string, any> | undefined;
    preferences?: {
        language?: "en" | "es" | "fr" | "de" | undefined;
        currency?: "USD" | "EUR" | "GBP" | "SOL" | undefined;
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        theme?: "light" | "dark" | "auto" | undefined;
    } | undefined;
    stats?: {
        listingsCount?: number | undefined;
        soldCount?: number | undefined;
        purchasedCount?: number | undefined;
        reviewsCount?: number | undefined;
        averageRating?: number | undefined;
        totalVolume?: number | undefined;
    } | undefined;
    reputation?: number | undefined;
    deletedAt?: string | null | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatarUrl?: string | undefined;
    bio?: string | undefined;
    isVerified?: boolean | undefined;
    isBanned?: boolean | undefined;
    trustScore?: number | undefined;
    socialLinks?: {
        url: string;
        platform: "twitter" | "telegram" | "discord" | "github";
        isPublic?: boolean | undefined;
    }[] | undefined;
    walletAddress?: string | null | undefined;
    walletVerified?: boolean | undefined;
}>;
export type User = z.infer<typeof UserSchema>;
export type UserPreferences = User['preferences'];
export type UserStats = User['stats'];
export declare const ListingSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    userId: z.ZodString;
    title: z.ZodString;
    slug: z.ZodString;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["electronics", "fashion", "home", "vehicles", "real-estate", "services", "digital", "collectibles"]>;
    subcategory: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    price: z.ZodNumber;
    currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "SOL"]>>;
    priceInSol: z.ZodOptional<z.ZodNumber>;
    isNegotiable: z.ZodDefault<z.ZodBoolean>;
    condition: z.ZodDefault<z.ZodEnum<["new", "like_new", "good", "fair", "poor"]>>;
    conditionDetails: z.ZodOptional<z.ZodString>;
    location: z.ZodObject<{
        city: z.ZodString;
        country: z.ZodString;
        lat: z.ZodOptional<z.ZodNumber>;
        lng: z.ZodOptional<z.ZodNumber>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        city: string;
        country: string;
        isPublic: boolean;
        lng?: number | undefined;
        lat?: number | undefined;
    }, {
        city: string;
        country: string;
        lng?: number | undefined;
        lat?: number | undefined;
        isPublic?: boolean | undefined;
    }>;
    status: z.ZodDefault<z.ZodEnum<["draft", "active", "reserved", "sold", "expired", "hidden", "banned"]>>;
    moderationStatus: z.ZodDefault<z.ZodEnum<["pending", "approved", "rejected", "flagged"]>>;
    toxicityScore: z.ZodDefault<z.ZodNumber>;
    moderationNotes: z.ZodOptional<z.ZodString>;
    viewCount: z.ZodDefault<z.ZodNumber>;
    saveCount: z.ZodDefault<z.ZodNumber>;
    inquiryCount: z.ZodDefault<z.ZodNumber>;
    lastViewedAt: z.ZodOptional<z.ZodString>;
    publishedAt: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    images: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        url: z.ZodString;
        position: z.ZodNumber;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
        caption: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        id: string;
        position: number;
        isPrimary: boolean;
        caption?: string | undefined;
    }, {
        url: string;
        id: string;
        position: number;
        isPrimary?: boolean | undefined;
        caption?: string | undefined;
    }>, "many">>;
    attributes: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    location: {
        city: string;
        country: string;
        isPublic: boolean;
        lng?: number | undefined;
        lat?: number | undefined;
    };
    metadata: Record<string, any>;
    status: "active" | "draft" | "sold" | "reserved" | "expired" | "hidden" | "banned";
    price: number;
    createdAt: string;
    updatedAt: string;
    images: {
        url: string;
        id: string;
        position: number;
        isPrimary: boolean;
        caption?: string | undefined;
    }[];
    currency: "USD" | "EUR" | "GBP" | "SOL";
    category: "vehicles" | "services" | "electronics" | "fashion" | "home" | "real-estate" | "digital" | "collectibles";
    title: string;
    content: string;
    slug: string;
    tags: string[];
    isNegotiable: boolean;
    condition: "new" | "like_new" | "good" | "fair" | "poor";
    moderationStatus: "pending" | "approved" | "rejected" | "flagged";
    toxicityScore: number;
    viewCount: number;
    saveCount: number;
    inquiryCount: number;
    attributes: Record<string, any>;
    expiresAt?: string | undefined;
    deletedAt?: string | null | undefined;
    excerpt?: string | undefined;
    subcategory?: string | undefined;
    priceInSol?: number | undefined;
    conditionDetails?: string | undefined;
    moderationNotes?: string | undefined;
    lastViewedAt?: string | undefined;
    publishedAt?: string | undefined;
}, {
    id: string;
    userId: string;
    location: {
        city: string;
        country: string;
        lng?: number | undefined;
        lat?: number | undefined;
        isPublic?: boolean | undefined;
    };
    price: number;
    createdAt: string;
    updatedAt: string;
    category: "vehicles" | "services" | "electronics" | "fashion" | "home" | "real-estate" | "digital" | "collectibles";
    title: string;
    content: string;
    slug: string;
    metadata?: Record<string, any> | undefined;
    status?: "active" | "draft" | "sold" | "reserved" | "expired" | "hidden" | "banned" | undefined;
    expiresAt?: string | undefined;
    images?: {
        url: string;
        id: string;
        position: number;
        isPrimary?: boolean | undefined;
        caption?: string | undefined;
    }[] | undefined;
    currency?: "USD" | "EUR" | "GBP" | "SOL" | undefined;
    deletedAt?: string | null | undefined;
    excerpt?: string | undefined;
    subcategory?: string | undefined;
    tags?: string[] | undefined;
    priceInSol?: number | undefined;
    isNegotiable?: boolean | undefined;
    condition?: "new" | "like_new" | "good" | "fair" | "poor" | undefined;
    conditionDetails?: string | undefined;
    moderationStatus?: "pending" | "approved" | "rejected" | "flagged" | undefined;
    toxicityScore?: number | undefined;
    moderationNotes?: string | undefined;
    viewCount?: number | undefined;
    saveCount?: number | undefined;
    inquiryCount?: number | undefined;
    lastViewedAt?: string | undefined;
    publishedAt?: string | undefined;
    attributes?: Record<string, any> | undefined;
}>;
export type Listing = z.infer<typeof ListingSchema>;
export type ListingStatus = Listing['status'];
export type ListingCondition = Listing['condition'];
export type ListingLocation = Listing['location'];
export type ListingImage = Listing['images'][0];
export declare const TransactionSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    listingId: z.ZodString;
    sellerId: z.ZodString;
    buyerId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "SOL"]>;
    amountInSol: z.ZodOptional<z.ZodNumber>;
    exchangeRate: z.ZodOptional<z.ZodNumber>;
    paymentMethod: z.ZodEnum<["escrow", "direct", "crypto", "bank_transfer", "card", "paypal", "cash"]>;
    paymentProvider: z.ZodOptional<z.ZodString>;
    paymentId: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "processing", "completed", "cancelled", "refunded", "disputed", "failed"]>>;
    paidAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    cancelledAt: z.ZodOptional<z.ZodString>;
    refundedAt: z.ZodOptional<z.ZodString>;
    shipping: z.ZodOptional<z.ZodObject<{
        method: z.ZodString;
        trackingNumber: z.ZodOptional<z.ZodString>;
        carrier: z.ZodOptional<z.ZodString>;
        estimatedDelivery: z.ZodOptional<z.ZodString>;
        deliveredAt: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodOptional<z.ZodString>;
            city: z.ZodString;
            state: z.ZodString;
            country: z.ZodString;
            postalCode: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            city: string;
            state: string;
            postalCode: string;
            country: string;
            line1: string;
            line2?: string | undefined;
        }, {
            city: string;
            state: string;
            postalCode: string;
            country: string;
            line1: string;
            line2?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        method: string;
        address?: {
            city: string;
            state: string;
            postalCode: string;
            country: string;
            line1: string;
            line2?: string | undefined;
        } | undefined;
        trackingNumber?: string | undefined;
        carrier?: string | undefined;
        estimatedDelivery?: string | undefined;
        deliveredAt?: string | undefined;
    }, {
        method: string;
        address?: {
            city: string;
            state: string;
            postalCode: string;
            country: string;
            line1: string;
            line2?: string | undefined;
        } | undefined;
        trackingNumber?: string | undefined;
        carrier?: string | undefined;
        estimatedDelivery?: string | undefined;
        deliveredAt?: string | undefined;
    }>>;
    fees: z.ZodDefault<z.ZodObject<{
        platformFee: z.ZodDefault<z.ZodNumber>;
        processingFee: z.ZodDefault<z.ZodNumber>;
        shippingFee: z.ZodDefault<z.ZodNumber>;
        tax: z.ZodDefault<z.ZodNumber>;
        totalFees: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        platformFee: number;
        processingFee: number;
        shippingFee: number;
        tax: number;
        totalFees: number;
    }, {
        platformFee?: number | undefined;
        processingFee?: number | undefined;
        shippingFee?: number | undefined;
        tax?: number | undefined;
        totalFees?: number | undefined;
    }>>;
    breakdown: z.ZodObject<{
        subtotal: z.ZodNumber;
        fees: z.ZodNumber;
        tax: z.ZodNumber;
        total: z.ZodNumber;
        sellerReceives: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        tax: number;
        fees: number;
        subtotal: number;
        sellerReceives: number;
    }, {
        total: number;
        tax: number;
        fees: number;
        subtotal: number;
        sellerReceives: number;
    }>;
    dispute: z.ZodOptional<z.ZodObject<{
        isDisputed: z.ZodDefault<z.ZodBoolean>;
        openedAt: z.ZodOptional<z.ZodString>;
        openedBy: z.ZodOptional<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
        resolution: z.ZodOptional<z.ZodEnum<["seller", "buyer", "split", "refund"]>>;
        resolvedAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isDisputed: boolean;
        resolution?: "split" | "seller" | "buyer" | "refund" | undefined;
        reason?: string | undefined;
        openedAt?: string | undefined;
        openedBy?: string | undefined;
        resolvedAt?: string | undefined;
    }, {
        resolution?: "split" | "seller" | "buyer" | "refund" | undefined;
        reason?: string | undefined;
        isDisputed?: boolean | undefined;
        openedAt?: string | undefined;
        openedBy?: string | undefined;
        resolvedAt?: string | undefined;
    }>>;
    messages: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        senderId: z.ZodString;
        content: z.ZodString;
        timestamp: z.ZodString;
        isRead: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        timestamp: string;
        content: string;
        senderId: string;
        isRead: boolean;
    }, {
        id: string;
        timestamp: string;
        content: string;
        senderId: string;
        isRead?: boolean | undefined;
    }>, "many">>;
    rating: z.ZodOptional<z.ZodObject<{
        buyerToSeller: z.ZodOptional<z.ZodNumber>;
        sellerToBuyer: z.ZodOptional<z.ZodNumber>;
        feedback: z.ZodOptional<z.ZodString>;
        leftAt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        buyerToSeller?: number | undefined;
        sellerToBuyer?: number | undefined;
        feedback?: string | undefined;
        leftAt?: string | undefined;
    }, {
        buyerToSeller?: number | undefined;
        sellerToBuyer?: number | undefined;
        feedback?: string | undefined;
        leftAt?: string | undefined;
    }>>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    metadata: Record<string, any>;
    status: "pending" | "completed" | "cancelled" | "disputed" | "refunded" | "processing" | "failed";
    createdAt: string;
    updatedAt: string;
    currency: "USD" | "EUR" | "GBP" | "SOL";
    amount: number;
    listingId: string;
    buyerId: string;
    messages: {
        id: string;
        timestamp: string;
        content: string;
        senderId: string;
        isRead: boolean;
    }[];
    sellerId: string;
    paymentMethod: "cash" | "escrow" | "direct" | "crypto" | "bank_transfer" | "card" | "paypal";
    fees: {
        platformFee: number;
        processingFee: number;
        shippingFee: number;
        tax: number;
        totalFees: number;
    };
    breakdown: {
        total: number;
        tax: number;
        fees: number;
        subtotal: number;
        sellerReceives: number;
    };
    rating?: {
        buyerToSeller?: number | undefined;
        sellerToBuyer?: number | undefined;
        feedback?: string | undefined;
        leftAt?: string | undefined;
    } | undefined;
    deletedAt?: string | null | undefined;
    amountInSol?: number | undefined;
    exchangeRate?: number | undefined;
    paymentProvider?: string | undefined;
    paymentId?: string | undefined;
    paidAt?: string | undefined;
    completedAt?: string | undefined;
    cancelledAt?: string | undefined;
    refundedAt?: string | undefined;
    shipping?: {
        method: string;
        address?: {
            city: string;
            state: string;
            postalCode: string;
            country: string;
            line1: string;
            line2?: string | undefined;
        } | undefined;
        trackingNumber?: string | undefined;
        carrier?: string | undefined;
        estimatedDelivery?: string | undefined;
        deliveredAt?: string | undefined;
    } | undefined;
    dispute?: {
        isDisputed: boolean;
        resolution?: "split" | "seller" | "buyer" | "refund" | undefined;
        reason?: string | undefined;
        openedAt?: string | undefined;
        openedBy?: string | undefined;
        resolvedAt?: string | undefined;
    } | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    currency: "USD" | "EUR" | "GBP" | "SOL";
    amount: number;
    listingId: string;
    buyerId: string;
    sellerId: string;
    paymentMethod: "cash" | "escrow" | "direct" | "crypto" | "bank_transfer" | "card" | "paypal";
    breakdown: {
        total: number;
        tax: number;
        fees: number;
        subtotal: number;
        sellerReceives: number;
    };
    metadata?: Record<string, any> | undefined;
    rating?: {
        buyerToSeller?: number | undefined;
        sellerToBuyer?: number | undefined;
        feedback?: string | undefined;
        leftAt?: string | undefined;
    } | undefined;
    status?: "pending" | "completed" | "cancelled" | "disputed" | "refunded" | "processing" | "failed" | undefined;
    messages?: {
        id: string;
        timestamp: string;
        content: string;
        senderId: string;
        isRead?: boolean | undefined;
    }[] | undefined;
    deletedAt?: string | null | undefined;
    amountInSol?: number | undefined;
    exchangeRate?: number | undefined;
    paymentProvider?: string | undefined;
    paymentId?: string | undefined;
    paidAt?: string | undefined;
    completedAt?: string | undefined;
    cancelledAt?: string | undefined;
    refundedAt?: string | undefined;
    shipping?: {
        method: string;
        address?: {
            city: string;
            state: string;
            postalCode: string;
            country: string;
            line1: string;
            line2?: string | undefined;
        } | undefined;
        trackingNumber?: string | undefined;
        carrier?: string | undefined;
        estimatedDelivery?: string | undefined;
        deliveredAt?: string | undefined;
    } | undefined;
    fees?: {
        platformFee?: number | undefined;
        processingFee?: number | undefined;
        shippingFee?: number | undefined;
        tax?: number | undefined;
        totalFees?: number | undefined;
    } | undefined;
    dispute?: {
        resolution?: "split" | "seller" | "buyer" | "refund" | undefined;
        reason?: string | undefined;
        isDisputed?: boolean | undefined;
        openedAt?: string | undefined;
        openedBy?: string | undefined;
        resolvedAt?: string | undefined;
    } | undefined;
}>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionStatus = Transaction['status'];
export type TransactionPaymentMethod = Transaction['paymentMethod'];
export type TransactionFees = Transaction['fees'];
export type TransactionShipping = Transaction['shipping'];
export declare const ReviewSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    transactionId: z.ZodString;
    reviewerId: z.ZodString;
    revieweeId: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    response: z.ZodOptional<z.ZodString>;
    respondedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
    content: string;
    transactionId: string;
    isPublic: boolean;
    reviewerId: string;
    revieweeId: string;
    title?: string | undefined;
    deletedAt?: string | null | undefined;
    response?: string | undefined;
    respondedAt?: string | undefined;
}, {
    id: string;
    rating: number;
    createdAt: string;
    updatedAt: string;
    content: string;
    transactionId: string;
    reviewerId: string;
    revieweeId: string;
    title?: string | undefined;
    deletedAt?: string | null | undefined;
    isPublic?: boolean | undefined;
    response?: string | undefined;
    respondedAt?: string | undefined;
}>;
export type Review = z.infer<typeof ReviewSchema>;
export declare const MessageSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    conversationId: z.ZodString;
    senderId: z.ZodString;
    recipientId: z.ZodString;
    content: z.ZodString;
    contentType: z.ZodDefault<z.ZodEnum<["text", "image", "offer", "system"]>>;
    isRead: z.ZodDefault<z.ZodBoolean>;
    readAt: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    content: string;
    senderId: string;
    isRead: boolean;
    conversationId: string;
    recipientId: string;
    contentType: "text" | "system" | "offer" | "image";
    deletedAt?: string | null | undefined;
    readAt?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    senderId: string;
    conversationId: string;
    recipientId: string;
    metadata?: Record<string, any> | undefined;
    deletedAt?: string | null | undefined;
    isRead?: boolean | undefined;
    contentType?: "text" | "system" | "offer" | "image" | undefined;
    readAt?: string | undefined;
}>;
export type Message = z.infer<typeof MessageSchema>;
export declare const NotificationSchema: z.ZodObject<{
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
} & {
    userId: z.ZodString;
    type: z.ZodEnum<["listing_viewed", "offer_received", "transaction_update", "message_received", "review_received", "system_alert"]>;
    title: z.ZodString;
    body: z.ZodString;
    data: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    isRead: z.ZodDefault<z.ZodBoolean>;
    readAt: z.ZodOptional<z.ZodString>;
    actionUrl: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    type: "listing_viewed" | "offer_received" | "transaction_update" | "message_received" | "review_received" | "system_alert";
    data: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    priority: "low" | "medium" | "high";
    title: string;
    isRead: boolean;
    body: string;
    deletedAt?: string | null | undefined;
    readAt?: string | undefined;
    actionUrl?: string | undefined;
}, {
    id: string;
    userId: string;
    type: "listing_viewed" | "offer_received" | "transaction_update" | "message_received" | "review_received" | "system_alert";
    createdAt: string;
    updatedAt: string;
    title: string;
    body: string;
    data?: Record<string, any> | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    deletedAt?: string | null | undefined;
    isRead?: boolean | undefined;
    readAt?: string | undefined;
    actionUrl?: string | undefined;
}>;
export type Notification = z.infer<typeof NotificationSchema>;
export declare const isUser: (data: unknown) => data is User;
export declare const isListing: (data: unknown) => data is Listing;
export declare const isTransaction: (data: unknown) => data is Transaction;
export type UserUpdate = Partial<z.infer<typeof UserSchema>>;
export type ListingUpdate = Partial<z.infer<typeof ListingSchema>>;
export type TransactionUpdate = Partial<z.infer<typeof TransactionSchema>>;
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
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
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
export interface Env {
    DB: D1Database;
    VIRAL_DATA: KVNamespace;
    B2B_KEYS: KVNamespace;
    SESSION_STORE: KVNamespace;
    LISTING_EVENTS_QUEUE: any;
    EXPORT_QUEUE: any;
    ERROR_REPORTING_QUEUE: any;
    SOLANA_RPC_URL: string;
    SOLANA_NETWORK: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    AI_TOXICITY_THRESHOLD: string;
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
    VERSION: string;
    API_KEY_SALT: string;
    ENCRYPTION_KEY: string;
}
