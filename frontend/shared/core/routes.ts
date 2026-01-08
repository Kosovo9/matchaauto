export const ROUTES = {
    auto: "/auto",
    marketplace: "/marketplace",
    assets: "/assets",

    listing: (domain: "auto" | "marketplace" | "assets", id: string) => `/${domain}/listing/${id}`,

    cart: "/cart",
    checkout: "/checkout",

    seller: (id: string) => `/seller/${id}`,
    support: "/support",
} as const;
