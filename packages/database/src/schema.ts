// This is a simulation of a Drizzle ORM schema for Match-Auto
// In a real environment, you would use 'drizzle-orm/pg-core' or similar

export const users = {
    id: "uuid",
    email: "varchar",
    walletAddress: "varchar",
    reputationScore: "integer",
    createdAt: "timestamp"
};

export const listings = {
    id: "uuid",
    sellerId: "uuid",
    title: "varchar",
    description: "text",
    price: "decimal",
    currency: "varchar", // USD, USDC, MXN
    vin: "varchar",
    compatibilityKey: "varchar",
    status: "enum", // active, sold, pending
    createdAt: "timestamp"
};

export const compatibility_matrix = {
    id: "serial",
    partId: "uuid",
    compatibilityKey: "varchar", // make_model_year
    oemRef: "varchar"
};

export const escrow_states = {
    id: "uuid",
    listingId: "uuid",
    buyerId: "uuid",
    sellerId: "uuid",
    solanaEscrowAddress: "varchar",
    status: "enum", // awaiting_shipment, in_transit, delivered, released
    amount: "decimal",
    updatedAt: "timestamp"
};
