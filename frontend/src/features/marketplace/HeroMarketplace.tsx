// frontend/src/features/marketplace/HeroMarketplace.tsx
'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Globe, Sparkles, TrendingUp } from 'lucide-react';
import SelloComunitario from '../../components/SelloComunitario';

export default function HeroMarketplace() {
    return (
        <section className="relative min-h-screen bg-white overflow-hidden flex items-center">
            {/* Sello Comunitario Top Left */}
            <div className="absolute top-10 left-10 z-20">
                <SelloComunitario level={15} />
            </div>
            {/* Abstract Shapes */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-100/50 rounded-full blur-[80px]" />

            <div className="container px-8 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-20">
                    <div className="flex-1 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold mb-8">
                                <Sparkles className="w-3 h-3" />
                                <span>GLOBAL MARKETPLACE ACCESS</span>
                            </div>
                            <h1 className="text-7xl md:text-9xl font-black text-neutral-900 tracking-tight leading-[0.85] mb-10">
                                TRADE <br />
                                <span className="text-emerald-500">WITHOUT</span> <br />
                                LIMITS.
                            </h1>
                            <p className="text-xl text-neutral-500 max-w-lg mb-12 leading-relaxed">
                                Connect with million of verified buyers and sellers in the most secure decentralized marketplace on earth.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button className="px-10 py-5 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-500/20 active:scale-95">
                                    START TRADING
                                </button>
                                <button className="px-10 py-5 border-2 border-neutral-200 text-neutral-900 font-bold rounded-2xl hover:bg-neutral-50 transition-all active:scale-95">
                                    VIEW CATALOG
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Graphical Element */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 1 }}
                        className="flex-1 w-full max-w-xl aspect-square relative"
                    >
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-[4rem] rotate-3" />
                        <div className="absolute inset-0 bg-white border border-neutral-100 rounded-[4rem] shadow-3xl flex items-center justify-center -rotate-3 overflow-hidden">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.5px,transparent_0.5px)] [background-size:16px_16px] opacity-20" />
                            <div className="relative text-center p-12">
                                <ShoppingBag className="w-32 h-32 text-emerald-500 mx-auto mb-8 animate-bounce-slow" />
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                        <Globe className="w-6 h-6 text-emerald-600" />
                                        <div className="text-left">
                                            <div className="text-[10px] font-bold text-emerald-900/40 uppercase">Global Nodes</div>
                                            <div className="text-lg font-black text-emerald-900">1,248 Active</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                        <TrendingUp className="w-6 h-6 text-blue-600" />
                                        <div className="text-left">
                                            <div className="text-[10px] font-bold text-blue-900/40 uppercase">Daily Volume</div>
                                            <div className="text-lg font-black text-blue-900">$2.4M USD</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
