"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { actions } from '../../shared/core/actions'
import { ROUTES } from '../../shared/core/routes'

export default function HeroRealEstate() {
    const router = useRouter()

    return (
        <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20 overflow-hidden font-serif">

            {/* --- BACKGROUND (Cinematic Luxury) --- */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/heroes/match-home.png"
                    alt="Luxury Real Estate"
                    className="w-full h-full object-cover scale-105"
                />
                {/* Dark overlay specifically for text readability on luxury images */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
            </div>

            {/* --- CENTERED IMMERSIVE UI --- */}
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center pt-20 md:pt-24">

                {/* BRANDING ELEMENT */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8"
                >
                    <span className="text-[var(--primary)] text-[10px] md:text-xs font-sans font-bold tracking-[0.3em] uppercase border-b border-[var(--primary)] pb-2">
                        Global Assets Exchange
                    </span>
                </motion.div>

                {/* HEADLINE (Responsive scale) */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl sm:text-6xl md:text-8xl text-white font-medium tracking-tight mb-8 leading-tight"
                    style={{ textShadow: '0 4px 20px rgba(0,0,0,0.6)' }}
                >
                    Curating the <br />
                    <span className="italic font-light text-[#E0E0E0]">Exceptional.</span>
                </motion.h1>

                {/* PREMIUM SEARCH BAR (Stacked on mobile) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-3xl bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row items-center shadow-[var(--shadow)] gap-2 md:gap-0"
                >
                    <div className="hidden md:flex pl-6 pr-4 border-r border-[var(--border)] items-center gap-2 text-white/70 h-full">
                        <MapPin size={18} />
                        <span className="text-sm font-sans">Global</span>
                    </div>

                    <input
                        type="text"
                        placeholder="Search by city or asset..."
                        className="w-full md:flex-1 bg-transparent border-none outline-none text-white px-4 md:px-6 font-sans placeholder:text-white/50 h-12 text-center md:text-left"
                    />

                    <button
                        onClick={() => actions.nav.go(router, ROUTES.escrow)}
                        className="w-full md:w-auto bg-[var(--primary)] text-[var(--bg)] hover:opacity-90 h-12 px-8 rounded-xl md:rounded-full font-sans font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                    >
                        DISCOVER <ArrowRight size={16} />
                    </button>
                </motion.div>

                {/* INVESTOR METRICS (Scrollable on very small screens) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 md:mt-16 flex flex-wrap justify-center gap-8 md:gap-12 w-full"
                >
                    {[
                        { label: 'Avg. ROI', value: '12.4%', sub: 'Yearly' },
                        { label: 'Global Assets', value: '1,420', sub: 'Verified' },
                        { label: 'Market Cap', value: '$840M', sub: 'Tokenized' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-left font-sans min-w-[100px]">
                            <div className="text-[var(--primary)] text-2xl md:text-3xl font-light">{stat.value}</div>
                            <div className="text-white/40 text-[10px] md:text-xs uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

            </div>

        </div>
    )
}

