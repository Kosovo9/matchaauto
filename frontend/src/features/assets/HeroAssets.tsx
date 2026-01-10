// frontend/src/features/assets/HeroAssets.tsx
'use client';

import { motion } from 'framer-motion';
import { Building2, Map, BarChart3, Lock } from 'lucide-react';
import SelloComunitario from '../../components/SelloComunitario';

export default function HeroAssets() {
    return (
        <section className="relative min-h-screen bg-[#0A0A0A] overflow-hidden flex items-center">
            {/* Sello Comunitario Top Right */}
            <div className="absolute top-10 right-10 z-20">
                <SelloComunitario level={20} />
            </div>
            {/* Background Lighting */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent" />

            {/* Vertical Lines */}
            <div className="absolute inset-y-0 left-1/4 w-[1px] bg-white/5" />
            <div className="absolute inset-y-0 left-2/4 w-[1px] bg-white/5" />
            <div className="absolute inset-y-0 left-3/4 w-[1px] bg-white/5" />

            <div className="container px-8 mx-auto relative z-10">
                <div className="max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="h-[2px] w-20 bg-amber-500" />
                            <span className="text-amber-500 font-bold tracking-[0.4em] text-xs uppercase">Premium_Asset_Exchange</span>
                        </div>

                        <h1 className="text-8xl md:text-[10rem] font-serif text-white leading-none tracking-tighter mb-12">
                            WORLD <br />
                            <span className="text-white/20 hover:text-white transition-colors duration-1000 cursor-default italic">ASSETS</span>
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-end">
                            <div>
                                <p className="text-2xl text-white/50 font-light leading-relaxed mb-12 max-w-md">
                                    Curated portfolio of high-yield properties, tokenized land, and exclusive investment opportunities protected by sovereign encryption.
                                </p>
                                <div className="flex items-center space-x-12">
                                    <button className="group relative">
                                        <span className="relative z-10 text-white font-bold text-lg border-b-2 border-amber-500 pb-2 transition-all group-hover:pr-8">
                                            EXPLORE PORTFOLIO
                                        </span>
                                        <div className="absolute bottom-3 right-0 opacity-0 group-hover:opacity-100 transition-all">
                                            →
                                        </div>
                                    </button>
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-800" />
                                        ))}
                                        <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black">
                                            +2k
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Building2, title: "Properties", count: "1,420" },
                                    { icon: Map, title: "Tokenized Land", count: "850" },
                                    { icon: BarChart3, title: "Yield Analytics", count: "Real-time" },
                                    { icon: Lock, title: "Vault Access", count: "Level 10" }
                                ].map((item, i) => (
                                    <div key={i} className="p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer">
                                        <item.icon className="w-8 h-8 text-amber-500 mb-6" />
                                        <h4 className="text-white font-bold text-lg mb-1">{item.title}</h4>
                                        <p className="text-white/40 text-xs font-mono tracking-widest uppercase">{item.count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Background Decorative Asset Image Simulation */}
            <div className="absolute -bottom-20 -right-20 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px]" />
        </section>
    );
}
