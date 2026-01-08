
"use client";

import React, { useState, useRef, useEffect } from "react";
import MasonryGrid from "../../components/marketplace/MasonryGrid";
import MarketplaceCard from "../../components/marketplace/MarketplaceCard";
import MarketplaceSkeleton from "../../components/marketplace/MarketplaceSkeleton";
import { useInfiniteMarketplace } from "../../hooks/useInfiniteMarketplace";
import { Search, Filter, Sparkles } from "lucide-react";

export default function MarketplacePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({ q: "" });

    const { items, loading, loadingMore, loadMore } = useInfiniteMarketplace(filters);
    const scrollSentinelRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (scrollSentinelRef.current) {
            observer.observe(scrollSentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, loading, loadingMore]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters({ ...filters, q: searchQuery });
    };

    return (
        <main className="min-h-screen pb-20">
            {/* Header / Search Section */}
            <section className="pt-32 pb-12 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-[var(--fg)] tracking-tighter mb-2">
                            QUANTUM <span className="text-emerald-400">MARKET</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Verified items, ultra-secure trading.</p>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--fg)] focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                            />
                        </div>
                        <button type="submit" className="p-4 rounded-2xl bg-emerald-400 text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">
                            <Filter size={20} />
                        </button>
                    </form>
                </div>

                {/* Categories / Quick Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {["All Items", "Electronics", "Luxury", "Vehicles", "Art", "Verified Only"].map((cat) => (
                        <button key={cat} className="px-6 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] text-xs font-bold whitespace-nowrap hover:bg-emerald-400 hover:text-black transition-all">
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid Section */}
            <section className="px-6 max-w-7xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => <MarketplaceSkeleton key={i} />)}
                    </div>
                ) : items.length > 0 ? (
                    <>
                        <MasonryGrid
                            columns={4}
                            items={items.map((item) => (
                                <MarketplaceCard key={item.id} item={{
                                    ...item,
                                    price: Number(item.price),
                                    image: item.attrs?.image || `https://placehold.co/400x250/1a1a1a/FFF?text=${item.title.split(' ')[0]}`,
                                    badge: item.attrs?.badge || "Verified"
                                }} />
                            ))}
                        />
                        {/* Sentinel for Infinite Scroll */}
                        <div ref={scrollSentinelRef} className="h-20 flex items-center justify-center">
                            {loadingMore && <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />}
                        </div>
                    </>
                ) : (
                    <div className="py-40 text-center">
                        <div className="inline-flex p-6 rounded-full bg-white/5 mb-6">
                            <Sparkles size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--fg)]">No results found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
