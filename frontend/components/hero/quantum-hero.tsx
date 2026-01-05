"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, Globe, ChevronDown, CheckCircle, Car, Wrench, ShieldCheck, Banknote, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
const CAR_RESULTS = [
    { id: "1", title: "Tesla Model S Plaid", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800", price: "$129,990", badge: "HOT", type: "electric" },
    { id: "2", title: "Porsche Taycan Turbo", image: "https://images.unsplash.com/photo-1614205732726-939338755889?auto=format&fit=crop&q=80&w=800", price: "$185,000", badge: "NEW", type: "electric" },
    { id: "3", title: "Ferrari 296 GTB", image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=800", price: "$322,000", badge: "EXOTIC", type: "sport" },
    { id: "4", title: "Lucid Air Sapphire", image: "https://images.unsplash.com/photo-1696355966237-75929a4bd793?auto=format&fit=crop&q=80&w=800", price: "$249,000", badge: "LUXURY", type: "electric" },
    { id: "5", title: "Lamborghini Revuelto", image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800", price: "$600,000", badge: "RARE", type: "sport" },
    { id: "6", title: "Rivian R1T", image: "https://images.unsplash.com/photo-1662973168285-d601b072be2e?auto=format&fit=crop&q=80&w=800", price: "$73,000", badge: "TRUCK", type: "electric" },
];

const SERVICE_RESULTS = [
    { id: "s1", title: "Mantenimiento Express", price: "$150", image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=800", badge: "FAST" },
    { id: "s2", title: "Diagnóstico Computadora", price: "$80", image: "https://images.unsplash.com/photo-1517524285303-d75439c8ce8d?auto=format&fit=crop&q=80&w=800", badge: "TECH" },
    { id: "s3", title: "Alineación y Balanceo", price: "$90", image: "https://images.unsplash.com/photo-1580234599554-4a572a15320c?auto=format&fit=crop&q=80&w=800", badge: "TIRES" },
];

// --- COMPONENTS ---

const Badge = ({ children, color = "green" }: { children: React.ReactNode; color?: "green" | "blue" | "orange" }) => {
    const colors = {
        green: "bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/50 shadow-[0_0_10px_rgba(57,255,20,0.2)]",
        blue: "bg-[#00B3FF]/20 text-[#00B3FF] border-[#00B3FF]/50 shadow-[0_0_10px_rgba(0,179,255,0.2)]",
        orange: "bg-[#FF9500]/20 text-[#FF9500] border-[#FF9500]/50 shadow-[0_0_10px_rgba(255,149,0,0.2)]",
    };
    return (
        <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-full backdrop-blur-md", colors[color])}>
            {children}
        </span>
    );
};

export default function QuantumHero() {
    const [activeTab, setActiveTab] = useState<"CARS" | "PARTS" | "SERVICES" | "INSURANCE">("CARS");
    const [mode, setMode] = useState<"BUY" | "RENT">("BUY");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [liveUsers, setLiveUsers] = useState(14502);
    const [showPaymentModal, setShowPaymentModal] = useState<{ item: any, provider: 'PayPal' | 'MercadoPago' } | null>(null);

    // Auto-expand search on load for demo
    useEffect(() => {
        setTimeout(() => {
            setSearchQuery("Tesla"); // Simulate typing
            setIsSearching(true);
        }, 1500);
    }, []);

    // Live Counter Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveUsers(prev => prev + Math.floor(Math.random() * 7) - 2);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    // Search Logic
    useEffect(() => {
        if (searchQuery.length > 2) setIsSearching(true);
        else setIsSearching(false);
    }, [searchQuery]);

    const handlePayment = (item: any, provider: 'PayPal' | 'MercadoPago') => {
        setShowPaymentModal({ item, provider });
        setTimeout(() => {
            alert(`✅ Conexión con ${provider} establecida.\n\nSimulación de pago: Iniciando transacción segura para ${item.title} (${item.price})\n\n[API Endpoint: POST /api/checkout/v1/init]`);
            setShowPaymentModal(null);
        }, 2000);
    }

    const results = activeTab === "CARS" ? CAR_RESULTS : SERVICE_RESULTS;
    const accentColor = mode === "BUY" ? "text-[#FF9500]" : "text-[#00B3FF]";
    const accentBg = mode === "BUY" ? "bg-[#FF9500]" : "bg-[#00B3FF]";

    return (
        <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-[#39FF14] selection:text-black">

            {/* --- AMBIENT NEBULA BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#39FF14] opacity-[0.06] blur-[200px] rounded-full animate-pulse-slow" />
                <div className={cn("absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] opacity-[0.08] blur-[220px] rounded-full pointer-events-none transition-colors duration-1000", mode === "BUY" ? "bg-[#FF9500]" : "bg-[#00B3FF]")} />
                {/* Subtle grid noise */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            </div>

            {/* --- PREMIUM HEADER --- */}
            <header className="relative z-50 flex items-center justify-between px-6 py-6 lg:px-12 w-full max-w-[1800px] mx-auto">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg ring-1 ring-white/5 hover:ring-[#39FF14]/50 transition-all cursor-pointer">
                        <Zap className="w-6 h-6 text-[#39FF14] fill-[#39FF14]/20" />
                    </div>
                    <span className="text-2xl font-bold tracking-tighter">Match<span className="text-[#39FF14]">Auto</span><span className="text-xs align-top opacity-50 ml-1">v.Pro</span></span>
                </div>

                <div className="flex items-center gap-4 lg:gap-8">
                    <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[#39FF14] bg-[#39FF14]/5 px-4 py-2 rounded-full border border-[#39FF14]/20 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
                        </span>
                        LIVE: {liveUsers.toLocaleString()} ACTIVE MATCHERS
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-gray-300">
                        <Globe className="w-4 h-4" />
                        <span>ES</span>
                        <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                </div>
            </header>

            {/* --- MAIN INTERFACE --- */}
            <main className="relative z-10 flex flex-col items-center pt-12 lg:pt-20 pb-32 px-4 w-full max-w-[1600px] mx-auto">

                {/* HEADLINE */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-10 text-center space-y-4 max-w-5xl"
                >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
                        Múevete a la velocidad del <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">pensamiento.</span>
                    </h1>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        El ecosistema automotriz global. <span className={cn("font-bold transition-colors", accentColor)}>10x más rápido.</span> 100% Seguro.
                    </p>
                </motion.div>

                {/* --- COMMAND CONSOLE --- */}
                <div className="w-full flex flex-col items-center">

                    {/* 1. MACRO TABS + SERVICES */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-2 mb-6"
                    >
                        <div className="flex bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-2xl shadow-2xl">
                            {(["CARS", "PARTS", "SERVICES", "INSURANCE"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "relative px-6 lg:px-10 py-3 rounded-full text-sm font-bold tracking-widest transition-all duration-300",
                                        activeTab === tab ? "text-black" : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTabHero"
                                            className="absolute inset-0 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        {tab === "CARS" && <Car className="w-4 h-4" />}
                                        {tab === "PARTS" && <Wrench className="w-4 h-4" />}
                                        {tab === "SERVICES" && <Zap className="w-4 h-4" />}
                                        {tab === "INSURANCE" && <ShieldCheck className="w-4 h-4" />}
                                        {tab}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* 2. MODE SWITCH + SEARCH BAR */}
                    <motion.div
                        layout
                        className={cn(
                            "relative w-full max-w-4xl transition-all duration-500 z-30",
                            isSearching ? "max-w-[1400px]" : "max-w-4xl" // EXPAND TO WIDE SCREEN WHEN SEARCHING
                        )}
                    >
                        {/* SEARCH CONTAINER BOX */}
                        <div className={cn(
                            "relative bg-[#0F0F0F]/80 border border-white/10 backdrop-blur-3xl shadow-2xl transition-all duration-500 overflow-hidden",
                            isSearching ? "rounded-[3rem]" : "rounded-full"
                        )}>

                            {/* TOP INPUT ROW */}
                            <div className="flex flex-col md:flex-row p-2 gap-2">

                                {/* RENT/BUY TOGGLE */}
                                <div className="relative bg-black/50 rounded-full p-1.5 flex shrink-0 border border-white/5 h-16 md:h-20 w-full md:w-auto">
                                    {(["BUY", "RENT"] as const).map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMode(m)}
                                            className={cn(
                                                "relative w-1/2 md:w-32 h-full rounded-full text-sm font-black tracking-widest transition-all duration-500 overflow-hidden",
                                                mode === m ? "text-white" : "text-gray-500 hover:text-gray-300"
                                            )}
                                        >
                                            {mode === m && (
                                                <motion.div
                                                    layoutId="modeToggleHero"
                                                    className={cn("absolute inset-0 w-full h-full", mode === "BUY" ? "bg-[#FF9500]" : "bg-[#00B3FF]")}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                            <span className="relative z-10">{m}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* INPUT FIELD */}
                                <div className="relative flex-grow flex items-center px-6 group h-16 md:h-20">
                                    <Search className={cn("w-6 h-6 mr-4 transition-colors", accentColor)} />
                                    <input
                                        type="text"
                                        placeholder={activeTab === "CARS" ? "Tesla Model 3, Porsche 911..." : activeTab === "INSURANCE" ? "Seguro cobertura amplia..." : "Buscar servicios..."}
                                        className="w-full h-full bg-transparent text-xl md:text-2xl text-white outline-none placeholder:text-gray-600 font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(""); setIsSearching(false); }} className="p-2 hover:bg-white/10 rounded-full text-gray-500">
                                            <span className="text-xs font-bold">CLEAR</span>
                                        </button>
                                    )}
                                </div>

                                {/* ACTION BUTTON */}
                                <div className="hidden md:flex items-center pr-2">
                                    <button className={cn("h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg", mode === "BUY" ? "bg-[#FF9500] text-black shadow-[#FF9500]/20" : "bg-[#00B3FF] text-black shadow-[#00B3FF]/20")}>
                                        <Zap className="w-8 h-8 fill-current" />
                                    </button>
                                </div>
                            </div>

                            {/* 3. EXPANDED PREDICTIVE GRID (WIDESCREEN) */}
                            <AnimatePresence>
                                {isSearching && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-white/5 bg-black/40"
                                    >
                                        <div className="p-6 md:p-10">
                                            <div className="flex justify-between items-center mb-8">
                                                <h3 className="text-sm font-mono text-gray-400 tracking-wider">
                                                    RESULTADOS SUGERIDOS ({results.length})
                                                </h3>
                                                <div className="flex gap-2">
                                                    <Badge color="green">INSTANT DELIVERY</Badge>
                                                    <Badge color="blue">VERIFIED</Badge>
                                                </div>
                                            </div>

                                            {/* WIDESCREEN GRID */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                                {results.map((item, idx) => (
                                                    <motion.div
                                                        key={item.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="group relative bg-[#151515] rounded-[2rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
                                                    >
                                                        {/* IMAGE */}
                                                        <div className="relative h-48 w-full overflow-hidden">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent z-10 opacity-60" />
                                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                                            <div className="absolute top-3 right-3 z-20">
                                                                <Badge color={item.badge === "HOT" ? "orange" : "blue"}>{item.badge}</Badge>
                                                            </div>
                                                        </div>

                                                        {/* INFO */}
                                                        <div className="p-5 relative z-20 -mt-10">
                                                            <h4 className="text-lg font-bold text-white leading-tight mb-1 truncate">{item.title}</h4>
                                                            <p className={cn("text-xl font-black mb-4", accentColor)}>{item.price}</p>

                                                            {/* ACTION BUTTONS */}
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handlePayment(item, 'MercadoPago'); }}
                                                                    className="py-2 rounded-xl bg-white/5 hover:bg-blue-500/20 text-[10px] font-bold text-blue-400 border border-white/5 transition-all flex flex-col items-center justify-center gap-1"
                                                                >
                                                                    <Banknote className="w-3 h-3" />
                                                                    MPAGO
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handlePayment(item, 'PayPal'); }}
                                                                    className={cn("py-2 rounded-xl text-[10px] font-bold text-black flex flex-col items-center justify-center gap-1 transition-all shadow-lg hover:brightness-110", accentBg)}
                                                                >
                                                                    <Zap className="w-3 h-3 fill-black" />
                                                                    {mode === "BUY" ? "BUY" : "RENT"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            <button className="w-full mt-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-xs font-bold tracking-[0.2em] transition-all text-gray-400 hover:text-white">
                                                VER TODOS LOS 14,000 RESULTADOS
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                    </motion.div>

                </div>
            </main>

            {/* FOOTER TRUST BADGES */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center gap-8 pointer-events-none opacity-40">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-[#009EE3]" />
                    MERCADOPAGO PROTECTED
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-[#003087]" />
                    PAYPAL VERIFIED
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-gray-400">
                    <Truck className="w-4 h-4 text-[#39FF14]" />
                    GLOBAL SHIPPING
                </div>
            </div>

            {/* SIMULATED PAYMENT MODAL */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#009EE3] via-[#39FF14] to-[#003087] animate-pulse" />
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                    {showPaymentModal.provider === 'PayPal' ? (
                                        <span className="text-2xl font-bold text-[#003087] italic">Pay</span>
                                    ) : (
                                        <span className="text-2xl font-bold text-[#009EE3]">MP</span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white">Conectando Pasarela...</h3>
                                <p className="text-sm text-gray-400">Iniciando transacción segura de {showPaymentModal.provider} para:</p>
                                <div className="bg-white/5 p-4 rounded-xl w-full border border-white/5">
                                    <p className="font-bold text-white">{showPaymentModal.item.title}</p>
                                    <p className={cn("text-lg font-black", accentColor)}>{showPaymentModal.item.price}</p>
                                </div>
                                <div className="flex gap-2 text-[10px] text-gray-500 font-mono mt-4">
                                    <span className="animate-pulse">●</span> ENCRYPTING DATA
                                    <span className="animate-pulse delay-75">●</span> VERIFYING STOCK
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
