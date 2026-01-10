"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Gauge, Zap, ShieldCheck, Cpu, Globe, Rocket } from "lucide-react";

export default function AutoHeroHUD() {
    const [mounted, setMounted] = useState(false);
    const [q, setQ] = useState("");

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="relative min-h-screen bg-[#020202] text-white overflow-hidden font-sans">
            {/* --- AURORA ENGINE --- */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] animate-pulse rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[150px] animate-pulse delay-1000 rounded-full" />
                {/* Dynamic Scan Line */}
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: '100vh' }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-blue-500/20 z-10"
                />
            </div>

            {/* --- HUD OVERLAY --- */}
            <div className="relative z-20 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen">

                {/* Top Status Bar (HUD Style) */}
                <div className="absolute top-10 left-6 right-6 flex justify-between items-center opacity-40">
                    <div className="flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                        <span className="flex items-center gap-1"><Cpu size={12} /> SYSTEM_OK</span>
                        <span className="flex items-center gap-1"><Globe size={12} /> SAT_LINK_MX_01</span>
                    </div>
                    <div className="flex gap-4 text-[10px] font-mono tracking-widest uppercase">
                        <span>T-MINUS 2030_01_10</span>
                    </div>
                </div>

                {/* Hero Title */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-[0.4em] uppercase mb-6">
                        Titan_Auto_Discovery
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-4 italic">
                        MATCH <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600">
                            VELOCITY.
                        </span>
                    </h1>
                </motion.div>

                {/* Glass Search Interface */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl"
                >
                    {/* Pills / Tabs */}
                    <div className="flex justify-center gap-3 mb-6">
                        {['HYPER_CARS', 'FUTURE_SUVS', 'ELECTRIC_DRIFT'].map((tab, i) => (
                            <button
                                key={i}
                                className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold tracking-widest hover:bg-blue-500/20 hover:border-blue-500/50 transition-all uppercase"
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl flex items-center group relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 flex items-center px-6 py-4 gap-4 z-10">
                            <Search className="text-blue-400 w-6 h-6" />
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="INITIALIZE_SEARCH: VIN_SCAN / MODEL / LOCATION"
                                className="bg-transparent border-none text-white placeholder:text-white/20 focus:ring-0 w-full text-xl font-medium outline-none"
                            />
                        </div>
                        <button className="relative z-10 px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[1.8rem] transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 uppercase tracking-widest text-xs">
                            INITIALIZE
                        </button>
                    </div>
                </motion.div>

                {/* HUD Data Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-20 w-full max-w-4xl">
                    {[
                        { label: 'PRECISION', value: '99.9%', icon: Gauge },
                        { label: 'LATENCY', value: '02ms', icon: Zap },
                        { label: 'VERIFIED', value: '42.9K', icon: ShieldCheck },
                        { label: 'BOOST_BACK', value: '+5%', icon: Rocket },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="flex flex-col items-center"
                        >
                            <stat.icon className="w-5 h-5 text-blue-500 mb-3 opacity-60" />
                            <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase mb-1">{stat.label}</span>
                            <span className="text-xl font-black text-white">{stat.value}</span>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>
    );
}
