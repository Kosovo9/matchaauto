"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Search, ShoppingBag, Leaf, Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HeroMarketplace() {
    const router = useRouter()

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center px-4 overflow-hidden font-sans text-gray-900 bg-[#F8FAFC]">

            {/* --- BACKGROUND (Organic/Clean) --- */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(#00C853 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />
                <img
                    src="/heroes/match-store.png"
                    alt="Marketplace Background"
                    className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40"
                />
            </div>

            {/* --- MAIN CONTENT CONTAINER --- */}
            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full pt-20 pb-10 lg:pt-20">

                {/* LEFT: TEXT & SEARCH */}
                <div className="space-y-6 md:space-y-8 text-center lg:text-left pt-10 lg:pt-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-[#00C853] text-xs md:text-sm font-bold"
                    >
                        <Leaf size={16} /> <span>Freshest Drops Daily</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter text-[#1A1A1A] leading-tight"
                    >
                        Fresh. <br />
                        <span className="text-[#00C853]">Curated.</span> <br />
                        Yours.
                    </motion.h1>

                    {/* SEARCH BAR (Material Design Style) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white p-2 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex items-center max-w-md mx-auto lg:mx-0 border border-gray-100"
                    >
                        <Search className="text-gray-400 ml-4 hidden sm:block" />
                        <input
                            type="text"
                            placeholder="Search for 'Matcha Kit'..."
                            className="flex-1 bg-transparent border-none outline-none text-gray-800 px-4 h-12 text-base md:text-lg w-full"
                        />
                        <button
                            onClick={() => router.push('/marketplace')}
                            className="bg-[#1A1A1A] text-white p-3 rounded-xl hover:bg-[#00C853] transition-colors"
                        >
                            <ArrowRight />
                        </button>
                    </motion.div>
                </div>

                {/* RIGHT: FLOATING CARDS (Responsive Masonry) */}
                {/* Visible on Mobile as a single stacked card, Grid on Desktop */}
                <div className="flex lg:grid grid-cols-2 gap-6 relative justify-center">
                    {/* Floating Card 1 */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="bg-white p-4 rounded-3xl shadow-xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500 cursor-pointer w-64 md:w-auto"
                    >
                        <div className="h-40 md:h-48 rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                            <img src="/heroes/match-store.png" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-md">NEW</div>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="font-bold text-base md:text-lg">Matcha Ceremonial</h3>
                                <p className="text-gray-400 text-xs md:text-sm">Organic Grade A</p>
                            </div>
                            <span className="font-bold text-[#00C853]">$28.00</span>
                        </div>
                    </motion.div>

                    {/* Floating Card 2 (Hidden on very small screens to save space, visible on tablet+) */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 40, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                        className="hidden md:block bg-white p-4 rounded-3xl shadow-xl mt-12 rotate-[3deg] hover:rotate-0 transition-transform duration-500 cursor-pointer z-10"
                    >
                        <div className="h-40 rounded-2xl bg-gray-100 mb-4 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[#00C853]/10Group-hover:bg-[#00C853]/20 transition-colors" />
                            <Sparkles className="absolute center text-[#00C853] w-8 h-8 opacity-50 m-auto inset-0" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="font-bold text-lg">Tech Accessories</h3>
                                <p className="text-gray-400 text-sm">Minimal & Clean</p>
                            </div>
                            <button className="bg-black text-white p-2 rounded-full"><ShoppingBag size={16} /></button>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    )
}
