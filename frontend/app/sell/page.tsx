"use client";

import React from 'react';
import QuantumUpload from '../../components/marketplace/quantum-upload';
import { QuantumHeader } from '../../components/hero/QuantumHeader'; // Reusing header for consistency

export default function SellPage() {
    return (
        <div className="min-h-screen bg-[#050505] selection:bg-[#39FF14] selection:text-black">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600 opacity-[0.05] blur-[200px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#39FF14] opacity-[0.03] blur-[200px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
            </div>

            <div className="relative z-10">
                <div className="pt-8 mb-12 flex justify-center">
                    {/* Simple logo header wrapper if QuantumHeader isn't perfectly modular, or use it directly */}
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white tracking-tighter">Match<span className="text-[#39FF14]">Auto</span></span>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400 border border-white/5">SELLER CENTER</span>
                    </div>
                </div>

                <main className="px-4 pb-20">
                    <QuantumUpload />
                </main>
            </div>
        </div>
    );
}
