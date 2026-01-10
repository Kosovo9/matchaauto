"use client";
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Leaf, Sparkles, ArrowRight, Zap } from "lucide-react";

type Item = { id: string; title: string; price: number; badge?: "Best Seller" | "Ads"; img?: string; };

export default function MarketplaceMasonry() {
    const [q, setQ] = useState("");
    const items = useMemo<Item[]>(
        () => Array.from({ length: 18 }).map((_, i) => ({
            id: String(i + 1),
            title: ["Matcha Kit Pro", "Cyber Watch", "Aero Headphones", "Gravity Sneakers", "Eco Gadget", "Luxe Shirt"][i % 6] + ` #${i + 1}`,
            price: 199 + (i % 7) * 50,
            badge: i % 5 === 0 ? "Ads" : (i % 4 === 0 ? "Best Seller" : undefined),
        })),
        []
    );

    const filtered = items.filter(x => x.title.toLowerCase().includes(q.toLowerCase()));

    return (
        <section className="min-h-screen bg-white font-sans selection:bg-emerald-100">
            <div className="mx-auto max-w-7xl px-6 py-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-xs uppercase mb-3">
                            <Zap size={14} className="fill-current" /> 10x_Global_Distribution
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                            MARKET <span className="text-emerald-500">@</span>
                        </h2>
                    </div>
                    <button className="h-14 px-8 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-sm uppercase tracking-widest">
                        Publish_Now
                    </button>
                </div>

                {/* Cinematic Search Bar */}
                <div className="mb-16 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] blur opacity-20" />
                    <div className="relative bg-white border border-slate-100 p-2 rounded-[1.8rem] shadow-2xl flex items-center">
                        <div className="flex-1 flex items-center px-6 py-4 gap-4">
                            <Search className="text-slate-300 w-6 h-6" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search global drops, innovative hardware, luxury brands..."
                                className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-slate-300 text-slate-800"
                            />
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-xs font-bold mr-2">
                            <Leaf size={14} /> FRESH_INDEX
                        </div>
                    </div>
                </div>

                {/* Masonry Grid */}
                <div className="columns-2 gap-8 sm:columns-3 lg:columns-4">
                    <AnimatePresence>
                        {filtered.map((p, i) => (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="mb-8 break-inside-avoid"
                            >
                                <div className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                                    {p.badge && (
                                        <span className={`absolute left-5 top-5 z-10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest
                      ${p.badge === "Ads" ? "bg-slate-900 text-white" : "bg-emerald-500 text-white"}`}>
                                            {p.badge}
                                        </span>
                                    )}

                                    {/* Image Placeholder with Gradient */}
                                    <div className="aspect-[4/5] relative bg-slate-50 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ShoppingBag size={48} className="text-slate-100 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</div>
                                            <Sparkles size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="text-xl font-black text-emerald-600">${p.price} <span className="text-[10px] text-slate-400">USD</span></div>

                                        <button className="mt-6 w-full rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-emerald-600 transition-colors">
                                            Quick_Aquire
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-20 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-300 text-[10px] font-bold tracking-widest uppercase">
                        <div className="w-10 h-[1px] bg-slate-100" />
                        End_of_Transmission
                        <div className="w-10 h-[1px] bg-slate-100" />
                    </div>
                </div>
            </div>
        </section>
    );
}
