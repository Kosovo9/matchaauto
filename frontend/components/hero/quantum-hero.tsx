"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Globe, ChevronDown, CheckCircle, Car, Wrench, ShieldCheck, Banknote, Truck, ArrowRight, ArrowLeft, Sparkles, Home, Box, Shield, Zap as AI, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

// --- THEME ENGINE ---
type ProjectTheme = 'CARS' | 'REAL_ESTATE' | 'MARKETPLACE';

const THEMES = {
    CARS: {
        id: 'CARS',
        path: 'theme-cars',
        name: 'MatchaAuto',
        tagline: 'Quantum Marketplace',
        headline: ['Muévete a la velocidad del', 'pensamiento.'],
        primary: '#009EE3', // Cyber Blue
        accent: '#FF9500',  // Tech Orange
        categories: ['VEHÍCULOS', 'REFACCIONES', 'SERVICIOS'],
        heroImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1200",
        stats: [
            { label: 'Market Trends', value: 'UP 12%', icon: BarChart },
            { label: 'Blockchain', value: 'SOLANA', icon: ShieldCheck },
            { label: 'Active Matchers', value: '14,502', icon: AI }
        ]
    },
    REAL_ESTATE: {
        id: 'REAL_ESTATE',
        path: 'theme-real',
        name: 'LuxuryEstates',
        tagline: 'Premier Investments',
        headline: ['Curating the World\'s', 'Finest Properties.'],
        primary: '#D4AF37', // Gold
        accent: '#D4AF37',
        categories: ['RESIDENTIAL', 'INVESTMENT', 'COMMERCIAL'],
        heroImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200",
        stats: [
            { label: 'Portfolio Val', value: '$4.5B', icon: BarChart },
            { label: 'Verified', value: 'ESCROW', icon: Shield },
            { label: 'Investors', value: '2,430', icon: Sparkles }
        ]
    },
    MARKETPLACE: {
        id: 'MARKETPLACE',
        path: 'theme-art',
        name: 'MatchaStore',
        tagline: 'Fresh Essentials',
        headline: ['Todo lo que necesitas,', 'ahora mismo.'],
        primary: '#39FF14', // Matcha Green
        accent: '#000000',
        categories: ['TECH', 'FASHION', 'LIFESTYLE'],
        heroImage: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1200",
        stats: [
            { label: 'Eco Rating', value: 'A+', icon: Sparkles },
            { label: 'Shipping', value: 'FREE', icon: Truck },
            { label: 'Vendors', value: '892', icon: Globe }
        ]
    }
};

const CAR_RESULTS = [
    {
        id: "1",
        title: "Tesla Model S Plaid",
        price: "$129,990",
        specs: { hp: "1020", vin: "0xABC...DEF123", status: "VERIFIED" },
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "2",
        title: "Porsche Taycan Turbo",
        price: "$185,000",
        specs: { hp: "750", vin: "0xPORS...911XYZ", status: "VERIFIED" },
        image: "https://images.unsplash.com/photo-1614205732726-939338755889?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "3",
        title: "Ferrari 296 GTB",
        price: "$322,000",
        specs: { hp: "818", vin: "0xRED...296GTB", status: "VERIFIED" },
        image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800"
    }
];

export default function QuantumHero() {
    const [theme, setTheme] = useState<ProjectTheme>('CARS');
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [liveUsers, setLiveUsers] = useState(8432);

    const active = THEMES[theme];

    useEffect(() => {
        // Sync body class with theme
        document.body.className = `${active.path} antialiased`;
        const interval = setInterval(() => setLiveUsers(prev => prev + Math.floor(Math.random() * 5)), 2000);
        return () => clearInterval(interval);
    }, [theme, active.path]);

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden pt-6">

            {/* 🌌 AMBIENT VISION LAYER */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        {/* THEME GRIDS */}
                        <div className={cn(
                            "absolute inset-0 opacity-10",
                            theme === 'CARS' ? "bg-grid-cyber" :
                                theme === 'REAL_ESTATE' ? "bg-[radial-gradient(#D4AF37_1px,transparent_1px)] bg-[size:20px_20px]" : "bg-white"
                        )} />

                        {/* NEBULA HOLES */}
                        <div className={cn(
                            "absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] blur-[200px] rounded-full opacity-[0.08]",
                            theme === 'CARS' ? "bg-[#009EE3]" : theme === 'REAL_ESTATE' ? "bg-[#D4AF37]" : "bg-[#39FF14]"
                        )} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* 🛰️ QUANTUM NAVIGATION (FLOATING) */}
            <header className="relative z-[100] w-full max-w-[1400px] px-8 py-6 mb-12">
                <div className="flex items-center justify-between glass-card p-4 rounded-3xl border border-white/10 backdrop-blur-3xl">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-2 rounded-xl transition-all duration-500", theme === 'CARS' ? "bg-[#009EE3]" : theme === 'REAL_ESTATE' ? "bg-[#D4AF37]" : "bg-[#39FF14]")}>
                            <Zap className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter leading-none italic uppercase">
                                {active.name}<span className="text-xs align-top ml-1 opacity-50 not-italic">v.TITAN</span>
                            </span>
                            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-500">{active.tagline}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex gap-2">
                            {active.stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-end px-4 border-r border-white/10 last:border-0">
                                    <span className="text-[8px] font-mono text-gray-500 uppercase">{stat.label}</span>
                                    <span className={cn("text-xs font-black", i === 1 ? "text-[#39FF14]" : "text-white")}>{stat.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                            <button onClick={() => setTheme('CARS')} className={cn("p-2 rounded-xl transition-all", theme === 'CARS' ? "bg-[#009EE3] text-black shadow-lg" : "hover:bg-white/5 text-white")}>
                                <Car size={18} />
                            </button>
                            <button onClick={() => setTheme('REAL_ESTATE')} className={cn("p-2 rounded-xl transition-all", theme === 'REAL_ESTATE' ? "bg-[#D4AF37] text-black shadow-lg" : "hover:bg-white/5 text-white")}>
                                <Home size={18} />
                            </button>
                            <button onClick={() => setTheme('MARKETPLACE')} className={cn("p-2 rounded-xl transition-all", theme === 'MARKETPLACE' ? "bg-[#39FF14] text-black shadow-lg" : "hover:bg-white/5 text-white")}>
                                <Box size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ⚡ MAIN CONSOLE */}
            <main className="relative z-10 w-full max-w-[1400px] flex flex-col items-center px-8">

                {/* HEADLINE (DYNAMIC) */}
                <motion.div
                    key={theme}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.8] text-white">
                        {active.headline[0]}<br />
                        <span className="text-gray-500">{active.headline[1]}</span>
                    </h1>
                </motion.div>

                {/* COMMAND TABS */}
                <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 mb-12 shadow-2xl">
                    {active.categories.map((cat) => (
                        <button key={cat} className="px-8 py-3 rounded-full text-[10px] font-black tracking-[0.2em] transition-all hover:bg-white/5 hover:text-white text-gray-400 uppercase">
                            [ {cat} ]
                        </button>
                    ))}
                </div>

                {/* QUANTUM SEARCH BAR */}
                <div className="w-full max-w-3xl relative mb-24">
                    <div className="relative flex items-center p-2 bg-black/60 border border-white/10 rounded-full h-24 backdrop-blur-3xl group focus-within:ring-2 transition-all"
                        style={{ boxShadow: `0 0 50px ${active.primary}15` }}>
                        <div className="pl-8 flex items-center">
                            <Search className="w-8 h-8 text-gray-500" />
                        </div>
                        <input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(true); }}
                            placeholder={`Buscar en ${active.name}...`}
                            className="flex-1 bg-transparent border-none outline-none text-2xl font-bold px-6 placeholder:text-gray-700 text-white"
                        />
                        <button
                            className="h-full px-12 rounded-full font-black text-xs tracking-widest uppercase transition-all hover:scale-105 active:scale-95 text-black"
                            style={{ backgroundImage: `linear-gradient(135deg, ${active.primary}, ${active.accent})` }}
                        >
                            Execute Search
                        </button>
                    </div>
                    {/* QUANTUM PARTICLES (EYE CANDY) */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-2xl -z-10 animate-pulse-glow" />
                </div>

                {/* PREVIEW GRID (MATCHING VISIONS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-40">
                    {CAR_RESULTS.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/10 bg-black/40 hover:border-white/30 transition-all cursor-pointer shadow-2xl"
                        >
                            {/* DYNAMIC IMAGE LAYER */}
                            <div className="absolute inset-0 z-0">
                                <img src={item.image} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                            </div>

                            {/* 🔍 SCANNER EFFECT (IF CARS) */}
                            {theme === 'CARS' && (
                                <div className="scanner-line z-20 top-0 group-hover:animate-scan" />
                            )}

                            {/* ITEM TECH DATA */}
                            <div className="absolute inset-0 z-30 flex flex-col justify-end p-10">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{item.title}</h3>
                                            <p className="text-3xl font-black" style={{ color: active.primary }}>{item.price}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                            <ShieldCheck className="w-6 h-6" style={{ color: active.primary }} />
                                        </div>
                                    </div>

                                    {/* TECH BOX (IMAGE 1 STYLE) */}
                                    <div className="glass-card p-6 border-white/5 bg-black/60 rounded-3xl space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="flex justify-between text-[10px] font-mono tracking-widest text-gray-500">
                                            <span>SPEC: HP</span> <span className="text-white">{item.specs.hp}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-mono tracking-widest text-gray-500">
                                            <span>BLOCKCHAIN:</span> <span className="text-[#39FF14]">{item.specs.status}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-mono tracking-widest text-gray-500 truncate">
                                            <span>VIN:</span> <span className="text-white">{item.specs.vin}</span>
                                        </div>
                                    </div>

                                    <button className="w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all hover:brightness-110 active:scale-95 text-black"
                                        style={{ backgroundColor: active.accent }}>
                                        Instant Connect
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </main>

            {/* SYSTME FOOTER */}
            <footer className="w-full py-12 border-t border-white/5 flex flex-col items-center gap-4 relative z-50">
                <div className="flex gap-8 opacity-30">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 tracking-widest">
                        <ShieldCheck className="w-4 h-4" /> PAYPAL PROTECTED
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 tracking-widest">
                        <Globe className="w-4 h-4" /> GLOBAL DISPATCH
                    </div>
                </div>
                <span className="text-[10px] font-mono text-gray-800 tracking-[0.5em] uppercase">Built for Titans - 2026</span>
            </footer>

        </div>
    );
}
