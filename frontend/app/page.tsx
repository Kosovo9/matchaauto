"use client";

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import QuantumHero from "@/components/hero/quantum-hero";
import QuantumChat from "@/components/chat/quantum-chat";
import QuantumAppSection from "@/components/mobile-app-cta";

export default function Home() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <main className="relative">
            {/* Componente Hero Principal */}
            <QuantumHero />

            {/* Módulo de Descarga App 1000x */}
            <QuantumAppSection />

            {/* Sistema Nervioso: Quantum Chat Global */}
            <AnimatePresence>
                {isChatOpen && (
                    <QuantumChat
                        sellerName="Soporte VIP MatchAuto"
                        onClose={() => setIsChatOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Trigger Flotante del Chat */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-8 right-8 z-[90] p-4 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full hover:scale-110 active:scale-95 transition-all shadow-[0_0_40px_rgba(57,255,20,0.2)] group"
                >
                    <div className="relative">
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39FF14] rounded-full border-2 border-black animate-pulse shadow-[0_0_10px_#39FF14]" />
                        <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 rounded-xl text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-white/10 backdrop-blur-md">
                        CONTACTAR EXPERTO
                    </span>
                </button>
            )}
        </main>
    );
}
