"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Wrench, Zap, Search, Filter, SlidersHorizontal, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import backend from '../../lib/backend-client';

export default function MarketplacePage() {
    const [activeCategory, setActiveCategory] = useState<'ALL' | 'CARS' | 'PARTS' | 'SERVICES'>('ALL');
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            setIsLoading(true);
            try {
                const res = await backend.getListings();
                if (res.success) setItems(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, []);

    const categories = [
        { id: 'ALL', label: 'Todo', icon: SlidersHorizontal },
        { id: 'CARS', label: 'Vehículos', icon: Car },
        { id: 'PARTS', label: 'Refacciones', icon: Wrench },
        { id: 'SERVICES', label: 'Servicios', icon: Zap },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Nav Space */}
            <header className="px-6 py-8 flex flex-col items-center">
                <h1 className="text-4xl font-black tracking-tighter mb-8">Quantum <span className="text-[#39FF14]">Marketplace</span></h1>

                {/* Category Filters */}
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id as any)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-xs font-bold tracking-widest transition-all",
                                activeCategory === cat.id ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <span className="flex items-center gap-2">
                                <cat.icon className="w-3 h-3" /> {cat.label}
                            </span>
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 pb-20">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 1, 2, 3].map(i => (
                            <div key={i} className="h-[350px] bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    className="group relative bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-[#39FF14]/30 transition-all hover:-translate-y-2"
                                >
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img src={item.images?.[0] || 'https://placehold.co/400x300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg truncate pr-2">{item.title}</h3>
                                            <span className="text-[10px] font-mono bg-[#39FF14]/10 text-[#39FF14] px-2 py-0.5 rounded border border-[#39FF14]/20">VERIFIED</span>
                                        </div>
                                        <p className="text-2xl font-black text-white mb-4">
                                            ${item.price.toLocaleString()} <span className="text-[10px] text-gray-500 font-mono">MXN</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="py-2.5 rounded-xl bg-white/5 text-[10px] font-bold tracking-widest hover:bg-white/10 transition-colors uppercase">Detalles</button>
                                            <button className="py-2.5 rounded-xl bg-[#39FF14] text-black text-[10px] font-black tracking-widest hover:brightness-110 transition-all uppercase">Comprar</button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
