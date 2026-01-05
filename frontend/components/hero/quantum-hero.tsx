"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Globe, ChevronDown, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming you have a utils file, if not I'll create one inline logic

// --- MOCK DATA FOR PREVIEW ---
const PREDICTIVE_RESULTS = [
    {
        id: "1",
        title: "Tesla Model 3 Performance",
        image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800",
        price: "$45,000",
        badge: "HOT",
        type: "car"
    },
    {
        id: "2",
        title: "Porsche Taycan Turbo S",
        image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&q=80&w=800",
        price: "$185,000",
        badge: "NEW",
        type: "car"
    },
    {
        id: "3",
        title: "Model Y Long Range",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800",
        price: "$52,990",
        badge: "DEAL",
        type: "car"
    },
    {
        id: "4",
        title: "Brembo Ceramic Brakes",
        image: "https://images.unsplash.com/photo-1596708761274-12345?auto=format&fit=crop&q=80&w=800", // Placeholder
        price: "$4,200",
        badge: "PARTS",
        type: "part"
    }
];

// --- UTILITY COMPONENTS ---

const Badge = ({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "blue" | "orange" }) => {
    const colors = {
        green: "bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/50",
        blue: "bg-[#00B3FF]/20 text-[#00B3FF] border-[#00B3FF]/50",
        orange: "bg-[#FF9500]/20 text-[#FF9500] border-[#FF9500]/50",
    };
    return (
        <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full", colors[color])}>
            {children}
        </span>
    );
};

// --- MAIN HERO COMPONENT ---

export default function QuantumHero() {
    const [activeTab, setActiveTab] = useState<"CARS" | "PARTS" | "SERVICES">("CARS");
    const [mode, setMode] = useState<"BUY" | "RENT">("BUY");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [liveUsers, setLiveUsers] = useState(14502);

    // Simulate Live Counter
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Simulate Search
    useEffect(() => {
        if (searchQuery.length > 2) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }
    }, [searchQuery]);

    const accentColor = mode === "BUY" ? "text-[#FF9500]" : "text-[#00B3FF]";
    const accentBg = mode === "BUY" ? "bg-[#FF9500]" : "bg-[#00B3FF]";

    return (
        <div className="relative min-h-screen w-full bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-[#39FF14] selection:text-black">

            {/* AMBIENT GLOW BACKDROP */}
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#39FF14] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className={cn("absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] opacity-[0.04] blur-[150px] rounded-full pointer-events-none transition-colors duration-700", mode === "BUY" ? "bg-[#FF9500]" : "bg-[#00B3FF]")} />

            {/* HEADER */}
            <header className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
                        <Zap className="w-6 h-6 text-[#39FF14] fill-current" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">Match<span className="text-[#39FF14]">Autos</span></span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-sm font-mono text-green-400 bg-green-900/10 px-3 py-1 rounded-full border border-green-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        LIVE: {liveUsers.toLocaleString()} Active Matchers
                    </div>

                    <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                        <Globe className="w-4 h-4" />
                        <span>EN</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </header>

            {/* MAIN CONSOLE */}
            <main className="relative z-10 flex flex-col items-center justify-center pt-16 pb-32 px-4 text-center">

                {/* HEADLINE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 space-y-4 max-w-4xl"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        Múevete a la velocidad del <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">pensamiento.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        El marketplace automotriz de <span className="text-[#39FF14] font-bold">10x eficiencia</span>. Compra, renta y repara en segundos.
                    </p>
                </motion.div>

                {/* INTERACTIVE CONSOLE */}
                <div className="w-full max-w-3xl">

                    {/* MACRO TABS */}
                    <div className="flex justify-center mb-0">
                        <div className="flex bg-white/5 p-1 rounded-t-2xl border-t border-x border-white/10 backdrop-blur-xl">
                            {(["CARS", "PARTS", "SERVICES"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "relative px-8 py-3 text-sm font-bold tracking-widest transition-colors duration-300",
                                        activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white/10 rounded-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {tab === "CARS" && "🚗"}
                                        {tab === "PARTS" && "⚙️"}
                                        {tab === "SERVICES" && "🔧"}
                                        {tab}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SEARCH BAR CONTAINER */}
                    <motion.div
                        layout
                        className="rounded-3xl bg-[#111] border border-white/10 p-2 shadow-2xl shadow-[#39FF14]/5 ring-1 ring-white/5"
                    >
                        <div className="flex flex-col md:flex-row gap-2">

                            {/* MODE TOGGLE */}
                            <div className="relative bg-black rounded-2xl p-1 flex shrink-0">
                                {(["RENT", "BUY"] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setMode(m)}
                                        className={cn(
                                            "relative px-6 py-4 rounded-xl text-sm font-bold transition-all duration-500",
                                            mode === m ? "text-white shadow-lg" : "text-gray-600 hover:text-gray-400"
                                        )}
                                    >
                                        {mode === m && (
                                            <motion.div
                                                layoutId="modeToggle"
                                                className={cn("absolute inset-0 rounded-xl", mode === "BUY" ? "bg-[#FF9500]" : "bg-[#00B3FF]")}
                                            />
                                        )}
                                        <span className="relative z-10">{m}</span>
                                    </button>
                                ))}
                            </div>

                            {/* INPUT */}
                            <div className="relative flex-grow group">
                                <input
                                    type="text"
                                    placeholder={activeTab === "CARS" ? "Tesla Model 3, Ferrari Roma..." : activeTab === "PARTS" ? "Frenos Brembo, Llantas..." : "Mecánico CDMX..."}
                                    className="w-full h-full bg-transparent text-xl text-white px-6 outline-none placeholder:text-gray-600 font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                {/* PREDICTIVE GRID DROP-DOWN */}
                                <AnimatePresence>
                                    {isSearching && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                            className="absolute top-[120%] left-0 right-0 bg-[#0F0F0F] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 overflow-hidden"
                                        >
                                            <div className="text-xs font-mono text-gray-500 mb-3 flex justify-between">
                                                <span>SUGERENCIAS EN TIEMPO REAL</span>
                                                <span className="text-[#39FF14]">FOUND 142 MATCHES</span>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {PREDICTIVE_RESULTS.map((item) => (
                                                    <div key={item.id} className="group/card bg-[#1A1A1A] rounded-xl overflow-hidden hover:ring-1 hover:ring-white/20 transition-all cursor-pointer">
                                                        <div className="relative h-24 w-full">
                                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                                                            <div className="absolute top-1 right-1">
                                                                <Badge color={item.badge === "NEW" ? "blue" : "orange"}>{item.badge}</Badge>
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                                                            <p className="text-xs text-gray-400 mb-2">{item.price}</p>
                                                            <button
                                                                className={cn(
                                                                    "w-full py-1 text-[10px] font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors",
                                                                    mode === "BUY"
                                                                        ? "bg-[#FF9500]/10 text-[#FF9500] hover:bg-[#FF9500] hover:text-black"
                                                                        : "bg-[#00B3FF]/10 text-[#00B3FF] hover:bg-[#00B3FF] hover:text-black"
                                                                )}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    alert(`Conectando pasarela de pago para ${item.title} via ${mode === 'BUY' ? 'Mercado Pago' : 'PayPal'}`);
                                                                }}
                                                            >
                                                                <Zap className="w-3 h-3" />
                                                                {mode === "BUY" ? "Quick Buy" : "Rent Now"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* SEARCH BUTTON */}
                            <button className="bg-[#39FF14] hover:bg-[#32e012] text-black rounded-2xl aspect-square h-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.3)] min-h-[60px] md:min-h-0 min-w-[60px]">
                                <div onClick={() => alert("Buscando...")}>
                                    <Search className="w-6 h-6" />
                                </div>
                            </button>

                        </div>
                    </motion.div>

                </div>

            </main>

            {/* FOOTER BADGES */}
            <div className="fixed bottom-8 w-full flex justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <CheckCircle className="w-4 h-4 text-[#003087]" /> {/* PayPal Blueish */}
                    <span>PAYPAL VERIFIED</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <CheckCircle className="w-4 h-4 text-[#009EE3]" /> {/* MercadoPago Blue */}
                    <span>MERCADOPAGO SECURE</span>
                </div>
            </div>

        </div>
    );
}
