// frontend/shared/core/actions.ts
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

export const actions = {
    media: {
        getListingMedia: async (id: string) => {
            const response = await api.get(`/listings/${id}/media`);
            return response.data;
        },
        trackZoomInteraction: async (id: string, zoomLevel: number) => {
            return await api.post(`/media/track-zoom`, { id, zoomLevel });
        }
    },
    geo: {
        getNearbyObjects: async (lat: number, lng: number, radius: number = 10, category?: string) => {
            const response = await api.get(`/geo/nearby`, {
                params: { lat, lng, radius, category }
            });
            return response.data;
        },
        getDistanceMatrix: async (origins: string[], destinations: string[]) => {
            const response = await api.get(`/geo/distance-matrix`, {
                params: { origins: origins.join('|'), destinations: destinations.join('|') }
            });
            return response.data;
        }
    },
    ar: {
        getModelMetadata: async (modelId: string) => {
            const response = await api.get(`/ar/models/${modelId}`);
            return response.data;
        }
    },
    // 10x Legacy Compatibility
    data: {
        listing: async (domain: string, id: string) => {
            const response = await api.get(`/listings/${id}`, { params: { domain } });
            return response.data;
        }
    },
    leads: {
        contactSeller: async (payload: any) => {
            return await api.post(`/leads/contact`, payload);
        }
    },
    nav: {
        go: (router: any, path: string) => {
            router.push(path);
        }
    }
};
