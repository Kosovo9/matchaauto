'use client';

import React, { useEffect, useRef } from 'react';
import { useQuantumStore } from '@/stores/quantum.store';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningBoltIcon } from '@radix-ui/react-icons'; // Usaremos esto como fallback si no hay lottie

export default function HyperSpeedHero() {
    const {
        transaction,
        neuralQuery,
        instantResults,
        suggestions,
        kFactor,
        activeUsers,
        liveDeals,
        actions,
    } = useQuantumStore();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-green-500/30">
            {/* HEADER NEURAL */}
            <header className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                            <LightningBoltIcon className="w-6 h-6 text-green-400 animate-pulse" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 tracking-tighter">
                            MATCHA<span className="text-white">AUTO</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">v10.8 • QUANTUM MODE</p>
                    </div>
                </div>

                {/* K-FACTOR VIRAL */}
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-mono font-bold text-green-400">
                            {kFactor.toFixed(2)}x
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono tracking-widest">K-FACTOR</div>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold">
                                {activeUsers.toLocaleString()} <span className="text-gray-500 font-normal">users active</span>
                            </span>
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono text-right">
                            {liveDeals} live deals
                        </div>
                    </div>
                </div>
            </header>

            {/* HERO CENTER */}
            <main className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-green-400 mb-6 tracking-widest"
                    >
                        ENGINEERING THE FUTURE OF MOBILITY
                    </motion.div>
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
                        <span className="block">MOVE AT THE</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-gradient decoration-clone">
                            SPEED OF THOUGHT
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto font-medium">
                        Next-generation automotive marketplace with 10.8x predictive efficiency.
                    </p>
                    <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-mono text-gray-300">187ms avg latency • 98.2% neural cache hit</span>
                    </div>
                </div>

                {/* INPUT SECCION */}
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {[
                            { id: 'cars', icon: '🚗', label: 'Cars' },
                            { id: 'parts', icon: '⚙️', label: 'Parts' },
                            { id: 'services', icon: '🔧', label: 'Services' },
                            { id: 'finance', icon: '💰', label: 'Finance' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => actions.setTransaction({ category: cat.id as any })}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all border ${transaction.category === cat.id
                                        ? 'bg-white text-black border-white shadow-[0_0_50px_rgba(255,255,255,0.15)]'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                    }`}
                            >
                                <span className="text-lg">{cat.icon}</span>
                                <span className="font-bold text-sm tracking-tight">{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

                        <div className="flex justify-center gap-4 mb-8">
                            {(['buy', 'rent', 'lease', 'bid'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => actions.setTransaction({ mode })}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${transaction.mode === mode
                                            ? 'bg-green-500 border-green-400 text-black'
                                            : 'bg-transparent border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={neuralQuery}
                                onChange={(e) => actions.setNeuralQuery(e.target.value)}
                                placeholder="Type 'Tesla Model S' or 'carbon brakes'..."
                                className="w-full bg-white/5 text-white text-2xl font-bold px-8 py-6 rounded-3xl border border-white/10 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-700"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <div className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-mono text-gray-500 border border-white/10 uppercase tracking-widest">Neural Live</div>
                                <button className="h-12 w-12 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                    <LightningBoltIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute mt-4 w-full bg-[#0D0D0D] border border-white/10 rounded-3xl p-6 z-50 shadow-2xl backdrop-blur-3xl"
                                    >
                                        <div className="text-[10px] font-mono text-gray-500 mb-4 uppercase tracking-[0.2em]">Neural Suggestions</div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((s, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => actions.setNeuralQuery(s)}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* RESULTS GRID */}
                <AnimatePresence>
                    {instantResults.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                            {instantResults.map((item) => (
                                <div key={item.id} className="group bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-green-500/30 transition-all">
                                    <div className="aspect-video rounded-2xl overflow-hidden mb-6 bg-gray-900 border border-white/5">
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-80 group-hover:opacity-100" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                                    <div className="text-2xl font-black text-green-400 mb-6">{item.priceTag}</div>
                                    <button
                                        onClick={() => actions.executeQuantumBuy(item.id)}
                                        className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-98 transition-all shadow-xl"
                                    >
                                        ⚡ INSTANT PURCHASE
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* METRICS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 border border-white/10 p-2 rounded-[2.5rem] mb-20">
                    <MetricCard label="Latency" value="187ms" color="text-green-400" />
                    <MetricCard label="Neural Hit" value="98.2%" color="text-blue-400" />
                    <MetricCard label="Scale" value="1.0k+" color="text-purple-400" />
                    <MetricCard label="Uptime" value="99.99" color="text-orange-400" />
                </div>
            </main>
        </div>
    );
}

function MetricCard({ label, value, color }: { label: string; value: string, color: string }) {
    return (
        <div className="bg-[#0A0A0A] p-8 rounded-[2rem] border border-white/5 text-center">
            <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</div>
        </div>
    )
}
