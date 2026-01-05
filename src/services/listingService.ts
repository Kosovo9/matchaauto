import { Listing, SearchFilters } from '@shared/types';

export const listingService = {
    async getAll(filters?: SearchFilters): Promise<Listing[]> {
        // Implementación real con Supabase en la siguiente fase
        return [];
    },

    async getById(id: string): Promise<Listing | null> {
        return null;
    },

    async create(data: Partial<Listing>): Promise<Listing> {
        throw new Error('Not implemented');
    }
};
