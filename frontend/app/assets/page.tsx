"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { actions } from "../../shared/core/actions";
import MarketplaceCard from "../../components/marketplace/MarketplaceCard";
import MarketplaceSkeleton from "../../components/marketplace/MarketplaceSkeleton";
import { Search, Map as MapIcon, List, Navigation } from "lucide-react";

// 🌍 MapLibre con importación dinámica para evitar errores de SSR
const MapLibreView = dynamic(() => import("../../components/assets/MapLibreView"), {
    ssr: false,
    loading: () => <div className="h-[70vh] w-full bg-white/5 animate-pulse rounded-3xl flex items-center justify-center text-gray-500">Initializing Quantum Maps...</div>
});

export default function AssetsPage() {
    const [viewMode, setViewMode] = useState<"split" | "map">("split");
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState({ lat: 19.4326, lng: -99.1332, zoom: 11 });

    const loadAssets = async (q = "", coords?: { lat: number, lng: number }) => {
        setLoading(true);
        try {
            // Usamos RAG híbrido (Vector + Geo)
            const res: any = await actions.rag.search("assets", q, coords ? { lat: coords.lat, lng: coords.lng, radiusKm: 30 } : {});
            setItems(res.items || []);
        } catch (e) {
            console.error("Failed to load assets", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssets();
    }, []);

    const handleGeosearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;

        try {
            // 1. Geocodificar la consulta (usa el mock estable para CDMX/Santa Fe en el backend)
            const geoRes: any = await actions.api(`/api/geo/geocode?q=${encodeURIComponent(searchQuery)}`);
            if (geoRes.items && geoRes.items.length > 0) {
                const first = geoRes.items[0];
                setMapCenter({ lat: first.lat, lng: first.lng, zoom: 13 });
                // 2. Cargar assets cercanos a esa ubicación con RAG
                await loadAssets(searchQuery, { lat: first.lat, lng: first.lng });
            } else {
                // Fallback a búsqueda de texto normal
                await loadAssets(searchQuery);
            }
        } catch (e) {
            console.error("Geosearch failed", e);
        }
    };

    return (
        <main className="min-h-screen pt-24 pb-12 bg-black text-[var(--fg)]">
            {/* Search Header */}
            <div className="max-w-[1600px] mx-auto px-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-400 rounded-2xl text-black shadow-lg shadow-amber-500/20">
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter uppercase">World Assets Exchange</h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Global Real Estate Registry</p>
                        </div>
                    </div>

                    <form onSubmit={handleGeosearch} className="flex-1 max-w-2xl flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Seach by Area, City or Property style..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 text-sm focus:border-amber-400 outline-none transition-all"
                            />
                        </div>
                        <button type="submit" className="px-8 py-4 bg-amber-400 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20">
                            DISCOVER
                        </button>
                    </form>

                    <div className="flex bg-black/40 p-2 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setViewMode("split")}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'split' ? 'bg-amber-400 text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode("map")}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'map' ? 'bg-amber-400 text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                        >
                            <MapIcon size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content View */}
            <div className="max-w-[1600px] mx-auto px-6">
                <div className={`grid gap-8 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>

                    {/* List Panel */}
                    <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'hidden'} space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar pr-2`}>
                        {loading ? (
                            [...Array(4)].map((_, i) => <MarketplaceSkeleton key={i} />)
                        ) : items.length > 0 ? (
                            items.map((asset) => (
                                <MarketplaceCard key={asset.id} item={{
                                    ...asset,
                                    price: Number(asset.price),
                                    badge: asset.attrs?.type || "Premium Asset"
                                }} />
                            ))
                        ) : (
                            <div className="py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-3xl">
                                No high-end assets found in this sector.
                            </div>
                        )}
                    </div>

                    {/* Map Panel */}
                    <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'}`}>
                        <MapLibreView
                            center={mapCenter}
                            items={items.map(x => ({
                                id: x.id,
                                lat: Number(x.lat),
                                lng: Number(x.lng),
                                price: Number(x.price),
                                currency: x.currency || "USD",
                                title: x.title
                            }))}
                            onSelect={(id) => actions.nav.go(null as any, `/assets/listing/${id}`)}
                        />
                    </div>

                </div>
            </div>
        </main>
    );
}
