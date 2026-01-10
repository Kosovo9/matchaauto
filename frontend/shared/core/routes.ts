// frontend/shared/core/routes.ts
export const ROUTES = {
    HOME: '/',
    cart: '/cart',
    AUTO: {
        ROOT: '/auto',
        LISTING: (id: string) => `/auto/listing/${id}`,
    },
    MARKETPLACE: {
        ROOT: '/marketplace',
        LISTING: (id: string) => `/marketplace/listing/${id}`,
    },
    ASSETS: {
        ROOT: '/assets',
        LISTING: (id: string) => `/assets/listing/${id}`,
    },
    API: {
        GEO: '/api/geo/nearby',
        VEHICLE: '/api/vehicle/decode',
        SYNC: '/api/hybrid/sync',
    }
};
