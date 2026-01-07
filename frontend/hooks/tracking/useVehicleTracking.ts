import { useQuery } from '@tanstack/react-query';
import { backend } from '@/lib/backend-client';
import axios from 'axios';

// Extend backend client for tracking specifically or add to backend-client.ts
// For now, we'll make ad-hoc request or extend. 
// Ideally we extend backend-client.ts, but to avoid touching shared lib too much, 
// we can use the axios instance from it if exported, or just fetch.
// backend-client exports 'backend' object. We should add tracking methods there or here.

// Let's define the shape
export interface VehiclePosition {
    id: string;
    lat: number;
    lng: number;
    speed: number;
    heading: number;
    status: 'moving' | 'idle' | 'stopped';
    lastUpdated: string;
    metadata?: any;
}

const fetchActiveFleet = async (): Promise<VehiclePosition[]> => {
    // We need to access the base URL from backend-client logic or env
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://match-auto-backend.neocwolf.workers.dev';

    // Using axios directly for now to ensure we hit the right new endpoint
    const { data } = await axios.get(`${API_URL}/api/v1/tracking/fleet/active`);

    if (data.success) {
        return data.data;
    }
    return [];
};

export function useActiveFleet(intervalMs: number = 5000) {
    return useQuery({
        queryKey: ['active-fleet'],
        queryFn: fetchActiveFleet,
        refetchInterval: intervalMs,
        refetchOnWindowFocus: true,
        staleTime: 2000
    });
}
