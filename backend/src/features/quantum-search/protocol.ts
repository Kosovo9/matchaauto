import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface QuantumSearchRequest {
    query: string;
    location?: {
        lat: number;
        lng: number;
        radiusKm: number;
    };
    filters: Record<string, any>;
    userId: string;
    sessionId: string;
}

export interface QuantumSearchResponse {
    results: any[];
    cached: boolean;
    latency: number;
    totalMatches: number;
    clusters: GeoCluster[];
    suggestions: string[];
}

export interface GeoCluster {
    center: { lat: number; lng: number };
    count: number;
    boundingBox: [number, number, number, number];
}

export class QuantumSearchProtocol {
    private supabase: SupabaseClient;
    private d1: any; // Using context binding
    public cacheTtl = 5000;

    constructor(env: { SUPABASE_URL: string; SUPABASE_KEY: string; DB: any }) {
        this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
        this.d1 = env.DB;
    }

    async search(request: QuantumSearchRequest): Promise<QuantumSearchResponse> {
        const startTime = Date.now();
        const cacheKey = this.generateCacheKey(request);

        // 1. Try D1 Cache
        if (this.d1) {
            const cached = await this.checkD1Cache(cacheKey);
            if (cached) {
                return { ...JSON.parse(cached), cached: true, latency: Date.now() - startTime };
            }
        }

        // 2. Main Search
        const results = await this.supabasePostGISSearch(request);
        const clusters = this.geoClusterResults(results, 0.1);
        const suggestions = await this.generateSuggestions(request, results);

        const responseData = {
            results,
            clusters,
            suggestions,
            totalMatches: results.length
        };

        // 3. Cache in D1
        if (this.d1) {
            await this.cacheInD1(cacheKey, responseData);
        }

        return {
            ...responseData,
            cached: false,
            latency: Date.now() - startTime
        };
    }

    private async supabasePostGISSearch(request: QuantumSearchRequest): Promise<any[]> {
        const { query, location, filters } = request;
        let supabaseQuery = this.supabase
            .from('listings')
            .select('*, location:locations(*), seller:sellers(*), trust_score')
            .eq('status', 'active');

        if (query) {
            supabaseQuery = supabaseQuery.textSearch('search_vector', query);
        }

        if (location) {
            // Logic for PostGIS dist within
            // (Simplified for this implement)
        }

        const { data, error } = await supabaseQuery.limit(100);
        if (error) throw error;
        return data || [];
    }

    private geoClusterResults(results: any[], granularity: number): GeoCluster[] {
        const clusters: Map<string, GeoCluster> = new Map();
        results.forEach(res => {
            if (!res.location) return;
            const key = `${Math.floor(res.location.lat / granularity)}:${Math.floor(res.location.lng / granularity)}`;
            if (!clusters.has(key)) {
                clusters.set(key, {
                    center: { lat: res.location.lat, lng: res.location.lng },
                    count: 0,
                    boundingBox: [res.location.lat, res.location.lng, res.location.lat, res.location.lng]
                });
            }
            const c = clusters.get(key)!;
            c.count++;
        });
        return Array.from(clusters.values());
    }

    private async generateSuggestions(request: QuantumSearchRequest, results: any[]): Promise<string[]> {
        return results.slice(0, 3).map(r => r.title);
    }

    private generateCacheKey(request: QuantumSearchRequest): string {
        return `search:${btoa(JSON.stringify(request)).slice(0, 32)}`;
    }

    private async checkD1Cache(key: string): Promise<string | null> {
        try {
            const res = await this.d1.prepare('SELECT data FROM search_cache WHERE key = ? AND expires_at > ?')
                .bind(key, Date.now()).first();
            return res?.data;
        } catch { return null; }
    }

    private async cacheInD1(key: string, data: any): Promise<void> {
        try {
            await this.d1.prepare('INSERT OR REPLACE INTO search_cache (key, data, expires_at) VALUES (?, ?, ?)')
                .bind(key, JSON.stringify(data), Date.now() + this.cacheTtl).run();
        } catch { }
    }
}
