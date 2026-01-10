"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowUpRight, Shield, Activity, Lock, Globe } from "lucide-react";

type Asset = { id: string; title: string; sqft: number; city: string; price: string; };

export default function AssetsLuxuryMap() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const assets = useMemo<Asset[]>(
        () => [
            { id: "a1", title: "SKY_VILLA_01", sqft: 5200, city: "Monterrey_MX", price: "$2.4M USD" },
            { id: "a2", title: "OASIS_PENTHOUSE", sqft: 3100, city: "CDMX_MX", price: "$1.1M USD" },
            { id: "a3", title: "CRYS_INDUSTRIAL", sqft: 45000, city: "Queretaro_MX", price: "$890K USD" },
        ],
        []
    );

    if (!mounted) return null;

    return (
        <section className="relative min-h-screen bg-[#050505] selection:bg-amber-900/30 font-serif">

            {/* Background Sat-Vibe Texture */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">

                {/* Superior Branding HUD */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 border-b border-white/5 pb-10">
                    <div className="text-left">
                        <div className="flex items-center gap-3 text-amber-500 font-sans font-bold tracking-[0.4em] text-[10px] uppercase mb-4">
                            <Shield size={14} /> Sovereign_Asset_Vault
                        </div>
                        <h2 className="text-5xl md:text-8xl font-medium text-white tracking-tighter leading-none italic">
                            WORLD <span className="text-amber-500">ASSETS.</span>
                        </h2>
                    </div>

                    <div className="flex gap-8 font-sans">
                        <div className="text-center">
                            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Mkt_Cap</div>
                            <div className="text-2xl font-black text-white">$840M</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Vol_24H</div>
                            <div className="text-2xl font-black text-amber-500">+12.4%</div>
                        </div>
                    </div>
                </div>

                {/* Global Map Interface */}
                <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr]">

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative min-h-[600px] rounded-[3rem] border border-white/10 bg-neutral-900/40 backdrop-blur-3xl overflow-hidden shadow-2xl group"
                    >
                        {/* Sat-Map Overlay Simulation */}
                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-99.1332,19.4326,4,0/1200x800?access_token=pk.eyJ1IjoibWF0Y2hhdXRvIiwiYSI6ImNscnd2ZzJ6cjAzMXYya25idG54ejB4ZjgifQ==')] bg-cover bg-center grayscale opacity-30 group-hover:grayscale-0 transition-all duration-1000" />

                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

                        {/* Interactive Pins */}
                        <Pin pos="top-[40%] left-[28%]" label="MTY_SUB" />
                        <Pin pos="bottom-[35%] left-[45%]" label="CDMX_PH" />
                        <Pin pos="top-[55%] right-[25%]" label="QRO_IND" />

                        {/* Map HUD Components */}
                        <div className="absolute top-8 left-8 flex gap-4">
                            <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-sans font-black text-white tracking-widest uppercase flex items-center gap-2">
                                <Activity size={12} className="text-amber-500 animate-pulse" /> LIVE_SYNC: ON
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-10 max-w-xs p-6 rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 font-sans">
                            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Selected_Region</div>
                            <div className="text-xl font-black text-white mb-1">MEXICO_FEDERAL</div>
                            <div className="text-xs text-white/50 leading-relaxed">Cross-border tokenized land registry active. 256-bit AES encryption layer enabled.</div>
                        </div>
                    </motion.div>

                    {/* Asset Feed */}
                    <div className="space-y-6">
                        <h3 className="font-sans text-xs font-bold text-white/40 tracking-[0.3em] uppercase mb-8">Active_Inventory</h3>
                        <AnimatePresence>
                            {assets.map((a, i) => (
                                <motion.div
                                    key={a.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group relative rounded-[2.5rem] border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 hover:border-amber-500/30 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="font-sans">
                                            <div className="text-xs font-bold text-amber-500/60 uppercase tracking-widest mb-2">{a.city}</div>
                                            <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors uppercase">{a.title}</div>
                                        </div>
                                        <div className="p-3 rounded-full border border-white/10 group-hover:border-amber-500/50 transition-colors">
                                            <ArrowUpRight size={20} className="text-white group-hover:text-amber-500" />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-baseline gap-4">
                                        <div className="text-3xl font-black text-white">{a.price}</div>
                                        <div className="text-xs text-white/30 font-sans uppercase tracking-widest">{a.sqft.toLocaleString()} SQFT</div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5 flex gap-4 text-[9px] font-sans font-bold text-white/20 tracking-widest uppercase">
                                        <span className="flex items-center gap-1"><Lock size={10} /> ESCROW_READY</span>
                                        <span className="flex items-center gap-1"><Globe size={10} /> GLOBAL_SALE</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button className="w-full h-16 rounded-[2rem] border-2 border-amber-500/30 text-amber-500 font-sans font-black uppercase text-xs tracking-[0.3em] hover:bg-amber-500 hover:text-black transition-all">
                            Connect_Vault_Access
                        </button>
                    </div>

                </div>
            </div>

        </section>
    );
}

function Pin({ pos = "", label = "" }) {
    return (
        <div className={`absolute ${pos} group/pin cursor-pointer`}>
            <div className="relative">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-40 animate-pulse rounded-full" />
                <MapPin className="relative text-amber-500 w-8 h-8 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />

                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap">
                    <span className="text-[10px] font-sans font-black text-white uppercase tracking-widest">{label}</span>
                </div>
            </div>
        </div>
    );
}
