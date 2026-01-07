export * from '../database/postgis-schema';
export * from '../services/geocoding.service';
export * from './barter';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
    timestamp?: string;
}

export type UserRole = 'admin' | 'seller' | 'buyer';

export interface UserContext {
    id: string;
    role: UserRole;
    email: string;
}
