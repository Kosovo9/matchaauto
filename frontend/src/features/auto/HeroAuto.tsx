// frontend/src/features/auto/HeroAuto.tsx
'use client';

import { motion } from 'framer-motion';
import { Search, Gauge, Zap, ShieldCheck } from 'lucide-react';
import SelloComunitario from '../../components/SelloComunitario';

export default function HeroAuto() {
    return (
        <section className="relative min-h-screen bg-[#050505] overflow-hidden flex items-center justify-center pt-20">
            {/* Sello Comunitario Positioned at Top */}
            <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20">
                <SelloComunitario level={12} />
            </div>
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full animate-pulse delay-1000" />
                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold tracking-[0.3em] uppercase mb-8 inline-block">
                            Trinity_Auto_Discovery v2.0
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-8">
                            FIND YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600">
                                VELOCITY.
                            </span>
                        </h1>
                    </motion.div>

                    {/* Advanced Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="relative mt-12 bg-white/5 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-2">
                            <div className="flex-1 flex items-center px-6 py-4 space-x-4">
                                <Search className="w-5 h-5 text-blue-400" />
                                <input
                                    type="text"
                                    placeholder="SCAN_VIN / MAKE / MODEL / GEOLOCATION"
                                    className="bg-transparent border-none text-white placeholder:text-white/20 focus:ring-0 w-full text-lg font-medium"
                                />
                            </div>
                            <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                            <button className="w-full md:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] active:scale-95 uppercase tracking-widest text-sm">
                                INITIALIZE_SEARCH
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats / Tech specs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24">
                        {[
                            { icon: Gauge, label: "PRECISION", value: "99.9%" },
                            { icon: Zap, label: "LATENCY", value: "10ms" },
                            { icon: ShieldCheck, label: "VERIFIED", value: "32.4K" },
                            { icon: Search, label: "INDEXED", value: "1.2M" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex flex-col items-center"
                            >
                                <stat.icon className="w-6 h-6 text-blue-500 mb-3" />
                                <span className="text-[10px] font-bold text-white/30 tracking-widest uppercase mb-1">{stat.label}</span>
                                <span className="text-xl font-black text-white">{stat.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
