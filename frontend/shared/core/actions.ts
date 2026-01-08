import { api } from "./apiClient";
import { ROUTES } from "./routes";

export type Domain = "auto" | "marketplace" | "assets";

export const actions = {
    nav: {
        go: (router: { push: (s: string) => void }, path: string) => router.push(path),
        auto: (router: any) => router.push(ROUTES.auto),
        marketplace: (router: any) => router.push(ROUTES.marketplace),
        assets: (router: any) => router.push(ROUTES.assets),
        cart: (router: any) => router.push(ROUTES.cart),
        checkout: (router: any) => router.push(ROUTES.checkout),
    },

    data: {
        featured: (domain: Domain) => api(`/api/featured?domain=${domain}`),
        search: (domain: Domain, q: string) => api(`/api/search?domain=${domain}&q=${encodeURIComponent(q)}`),
        listing: (domain: Domain, id: string) => api(`/api/listings/${id}?domain=${domain}`),
    },

    checkout: {
        quickBuy: (listingId: string, domain: Domain) =>
            api(`/api/checkout/quick-buy`, {
                method: "POST",
                body: JSON.stringify({ listingId, domain }),
            }),
    },

    leads: {
        contactSeller: (payload: { sellerId: string; listingId: string; message?: string }) =>
            api(`/api/leads/contact`, { method: "POST", body: JSON.stringify(payload) }),
    },

    rag: {
        search: (domain: Domain, q: string, filters?: Record<string, any>) => {
            const params = new URLSearchParams({ domain, q, ...filters });
            return api(`/api/rag/search?${params.toString()}`);
        },
    },

    identity: {
        requestVerification: (docType: string, fileUrl: string) =>
            api('/api/verifications/request', {
                method: 'POST',
                body: JSON.stringify({ docType, fileUrl })
            }),
        fetchStatus: () => api('/api/verifications/me')
    },
};
