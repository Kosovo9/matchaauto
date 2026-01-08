"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CarFront, Home, Package, Search, Zap, Shield, TrendingUp, Menu, Bell, ShoppingCart, User } from 'lucide-react'
import HeroAuto from './hero-auto'
import HeroRealEstate from './hero-realestate'
import HeroMarketplace from './hero-marketplace'

// --- THEME DEFINITIONS ---
const THEMES = {
    active: {
        id: 'active',
        name: 'Match-Auto',
        icon: CarFront,
        bgImage: '/heroes/match-auto.png',
        primaryColor: '#00F0FF', // Cyber Blue
        secondaryColor: '#FF4D00', // Neon Orange
        accentColor: '#0a0a0a',
        font: 'font-sans',
        title: 'Muévete a la velocidad del pensamiento.',
        placeholder: 'Buscar en MatchaAuto...',
        categories: ['VEHÍCULOS', 'REFACCIONES', 'SERVICIOS'],
        uiStyle: 'cyberpunk'
    },
    home: {
        id: 'home',
        name: 'Match-Home',
        icon: Home,
        bgImage: '/heroes/match-home.png',
        primaryColor: '#D4AF37', // Gold
        secondaryColor: '#1A1A1A', // Deep Black
        accentColor: '#FFFFFF',
        font: 'font-serif', // Elegant
        title: 'Curating the World\'s Finest Properties.',
        placeholder: 'Buscar en LuxuryEstates...',
        categories: ['RESIDENTIAL', 'INVESTMENT', 'COMMERCIAL'],
        uiStyle: 'luxury'
    },
    store: {
        id: 'store',
        name: 'Match-Store',
        icon: Package,
        bgImage: '/heroes/match-store.png',
        primaryColor: '#88B04B', // Matcha Green
        secondaryColor: '#FFFFFF', // Pure White
        accentColor: '#333333',
        font: 'font-sans', // Clean
        title: 'Todo lo que necesitas, ahora mismo.',
        placeholder: 'Buscar en MatchaStore...',
        categories: ['TECH', 'FASHION', 'LIFESTYLE'],
        uiStyle: 'clean'
    }
}

export default function QuantumHero() {
    const [activeTheme, setActiveTheme] = useState<'active' | 'home' | 'store'>('active')
    const [mounted, setMounted] = useState(false)
    const theme = THEMES[activeTheme]

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // Prevent hydration mismatch

    // If active theme is 'active' (Auto), render the specialized Aurora component directly
    // This allows it to take full control of the screen (header, bg, footer) without overlaps
    if (activeTheme === 'active') {
        return (
            <div className="relative w-full h-screen">
                <HeroAuto />

                {/* Minimal Theme Switcher Overlay (Bottom Left) to allow navigation back */}
                <div className="absolute bottom-4 left-4 z-50 flex gap-2 p-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-xl opacity-30 hover:opacity-100 transition-opacity">
                    {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => {
                        const T = THEMES[t]
                        const isActive = activeTheme === t
                        return (
                            <button
                                key={t}
                                onClick={() => setActiveTheme(t)}
                                className={`p-2 rounded-full transition-all ${isActive ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                <T.icon size={16} />
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">

            {/* --- DYNAMIC BACKGROUND LAYER --- */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTheme}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for text readability */}
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                        style={{ backgroundImage: `url(${theme.bgImage})` }}
                    />
                    {/* Gradient Overlay based on theme */}
                    <div
                        className="absolute inset-0 z-10 opacity-60 mix-blend-overlay transition-colors duration-500"
                        style={{
                            background: `linear-gradient(to bottom, transparent 0%, ${activeTheme === 'active' ? '#000000' : activeTheme === 'home' ? '#000000' : '#ffffff'} 100%)`
                        }}
                    />
                </motion.div>
            </AnimatePresence>

            {/* --- CONTENT LAYER --- */}
            <div className="relative z-20 w-full h-full flex flex-col justify-between pointer-events-none">

                {/* HEADER / NAVIGATION (Pointer events enabled for interactions) */}
                <header className="w-full p-6 flex justify-between items-center z-50 pointer-events-auto">
                    {/* LOGO & THEME SWITCHER */}
                    <div className="flex items-center gap-6">
                        <div className="flex gap-2 p-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-xl">
                            {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((t) => {
                                const T = THEMES[t]
                                const isActive = activeTheme === t
                                return (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTheme(t)}
                                        className={`p-2 rounded-full transition-all duration-300 relative group ${isActive ? 'bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'hover:bg-white/5'}`}
                                        style={{ color: isActive ? T.primaryColor : '#888' }}
                                    >
                                        <T.icon size={20} />
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-indicator"
                                                className="absolute inset-0 rounded-full border border-current opacity-50"
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-1 rounded text-white pointer-events-none whitespace-nowrap z-50">
                                            {T.name}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* NAV LINKS (Desktop) */}
                    <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide" style={{ color: activeTheme === 'store' ? '#1A1A1A' : 'white' }}>
                        {['MARKETPLACE', 'VIN DECODER', 'ESCROW', 'AI ANALYSIS'].map((item) => (
                            <a key={item} href="#" className="hover:opacity-70 transition-opacity relative group">
                                {item}
                                <span
                                    className="absolute -bottom-1 left-0 w-0 h-[2px] bg-current transition-all group-hover:w-full"
                                    style={{ backgroundColor: theme.primaryColor }}
                                />
                            </a>
                        ))}
                    </nav>

                    {/* USER ACTIONS */}
                    <div className="flex items-center gap-4 text-white">
                        {/* Adapt color for Store theme */}
                        <div style={{ color: activeTheme === 'store' ? '#1A1A1A' : 'white' }} className="flex gap-4">
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Bell size={20} />
                            </button>
                            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                                <ShoppingCart size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all font-medium text-sm"
                                style={{
                                    borderColor: theme.primaryColor,
                                    backgroundColor: activeTheme === 'store' ? '#1A1A1A' : 'rgba(255,255,255,0.1)',
                                    color: activeTheme === 'store' ? 'white' : 'white'
                                }}
                            >
                                <User size={16} />
                                <span>Connect</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* HERO CENTER CONTENT (Delegated to Specialized Components for non-Auto themes) */}
                <div className="flex-1 w-full relative pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {activeTheme === 'home' && (
                            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                                <HeroRealEstate />
                            </motion.div>
                        )}
                        {activeTheme === 'store' && (
                            <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                                <HeroMarketplace />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* FOOTER STATS / DASHBOARD PREVIEW */}
                <div className="w-full border-t border-white/10 bg-black/40 backdrop-blur-lg grid grid-cols-2 md:grid-cols-4 p-8 gap-8 pointer-events-auto">
                    {[
                        { label: 'Active Listings', value: '24,593', chart: '+12%' },
                        { label: 'Total Volume', value: '$842M', chart: '+5.4%' },
                        { label: 'Avg. Sale Time', value: '48h', chart: '-15%' },
                        { label: 'Verified Users', value: '115k', chart: '+8.2%' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col">
                            <span className="text-white/40 text-xs font-mono mb-1">{stat.label}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                <span className="text-xs font-bold" style={{ color: theme.primaryColor }}>{stat.chart}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* GLOBAL BACKGROUND EFFECTS (Particles/Grid) */}
            <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: activeTheme === 'store'
                        ? 'radial-gradient(circle, #88B04B 1px, transparent 1px)'
                        : 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: activeTheme === 'store' ? '20px 20px' : '50px 50px'
                }}
            />
        </div>
    )
}
