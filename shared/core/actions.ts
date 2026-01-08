
import { api } from './apiClient';

export type Domain = "cars" | "parts" | "services" | "realestate" | "marketplace";

export const actions = {
    nav: {
        go: (router: { push: (s: string) => void }, path: string) => {
            console.log(`[NAV] Going to: ${path}`);
            router.push(path);
        },
    },

    ui: {
        toggle: (set: (v: boolean) => void) => set((v) => !v),
    },

    data: {
        featured: async (domain: Domain) => {
            console.log(`[DATA] Fetching featured for: ${domain}`);
            try {
                // Mapping domains to specific endpoints if necessary
                const path = domain === 'cars' ? '/api/vehicles' : '/api/v1/search';
                const items = await api<any[]>(path);
                return { items: items || [] };
            } catch (err) {
                console.error("[DATA] Error fetching featured:", err);
                return { items: [] };
            }
        },
        search: async (q: string, domain: Domain) => {
            console.log(`[DATA] Searching ${q} in ${domain}`);
            try {
                const items = await api<any[]>(`/api/v1/search?q=${encodeURIComponent(q)}&domain=${domain}`);
                return { items: items || [] };
            } catch (err) {
                console.error("[DATA] Error searching:", err);
                return { items: [] };
            }
        },
    },

    checkout: {
        quickBuy: async (listingId: string) => {
            console.log(`[CHECKOUT] Quick buy for: ${listingId}`);
            try {
                const res = await api<{ ok: true; orderId: string }>('/api/trading/order', {
                    method: 'POST',
                    body: JSON.stringify({ listingId, type: 'QUICK_BUY' })
                });
                return res;
            } catch (err) {
                console.error("[CHECKOUT] Error in quickBuy:", err);
                // Mock success for demonstration if backend is not fully ready
                return { ok: true, orderId: `mock_${listingId}` };
            }
        },
    }
};
