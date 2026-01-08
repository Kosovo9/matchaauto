
import { actions } from "../core/actions";

export const AdsModule = {
    getPlans: async () => {
        return actions.api('/api/ads/plans');
    },

    verifyEscrow: async (price: number, category: string) => {
        return actions.api('/api/ads/escrow/verify-eligibility', {
            method: 'POST',
            body: JSON.stringify({ price, category })
        });
    },

    purchaseBoost: async (listingId: string, planId: string) => {
        // Simulación de checkout de boost
        return actions.api('/api/ads/boost/purchase', {
            method: 'POST',
            body: JSON.stringify({ listingId, planId })
        });
    }
};
