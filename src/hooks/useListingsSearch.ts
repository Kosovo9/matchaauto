import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface SearchParams {
    make?: string[];
    model?: string[];
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    maxMileage?: number;
    fuelType?: string[];
    transmission?: string[];
    locationLat?: number;
    locationLng?: number;
    radiusKm?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'mileage_asc';
    page?: number;
    limit?: number;
}

interface Listing {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    images: string[];
    city?: string;
    state?: string;
    isFeatured?: boolean;
}

interface SearchResponse {
    data: Listing[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export const useListingsSearch = (initialParams: SearchParams = {}) => {
    const [params, setParams] = useState<SearchParams>({
        page: 1,
        limit: 20,
        sortBy: 'newest',
        ...initialParams,
    });

    const searchListings = useCallback(async (searchParams: SearchParams) => {
        const queryParams = new URLSearchParams();

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
                if (value.length > 0) {
                    queryParams.append(key, value.join(','));
                }
            } else {
                queryParams.append(key, String(value));
            }
        });

        const response = await fetch(`${API_BASE}/listings?${queryParams}`, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        return response.json();
    }, []);

    const {
        data,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useQuery<SearchResponse>({
        queryKey: ['listings', params],
        queryFn: () => searchListings(params),
        staleTime: 30000, // 30 segundos
    });

    const updateParams = useCallback((newParams: Partial<SearchParams>) => {
        setParams(prev => ({
            ...prev,
            ...newParams,
            page: 1, // Reset to first page when params change
        }));
    }, []);

    const nextPage = useCallback(() => {
        if (data && params.page && params.page < data.pagination.totalPages) {
            setParams(prev => ({ ...prev, page: prev.page! + 1 }));
        }
    }, [data, params.page]);

    const prevPage = useCallback(() => {
        if (params.page && params.page > 1) {
            setParams(prev => ({ ...prev, page: prev.page! - 1 }));
        }
    }, [params.page]);

    const setPage = useCallback((page: number) => {
        setParams(prev => ({ ...prev, page }));
    }, []);

    return {
        listings: data?.data || [],
        pagination: data?.pagination,
        isLoading,
        isFetching,
        error,
        params,
        updateParams,
        refetch,
        nextPage,
        prevPage,
        setPage,
    };
};
