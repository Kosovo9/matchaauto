"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Car, Settings, Wrench, Search, Zap, ChevronDown, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HeroAuto() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('CARS')
    const [mode, setMode] = useState('BUY') // RENT | BUY

    const vehicles = [
        { name: "Tesla Model S Plaid", price: "$ 129,000", img: "/heroes/tesla.png", tag: "Hot/New" }, // Placeholder img logic
        { name: "Porsche Taycan Turbo S", price: "$ 185,000", img: "/heroes/porsche.png", tag: "Hot/New" },
        { name: "Ferrari 296 GTB", price: "$ 345,000", img: "/heroes/ferrari.png", tag: "Hot/New" },
        { name: "Lucid Air Sapphire", price: "$ 249,000", img: "/heroes/lucid.png", tag: "Hot/New" },
    ]

    // Mock images for demonstration (using placeholders if local assets missing)
    const getImg = (name: string) => `https://placehold.co/400x250/1a1a1a/FFF?text=${name.split(' ')[0]}`

    return (
        <div className="relative w-full min-h-screen bg-black overflow-hidden font-sans text-white flex flex-col">

            {/* --- BACKGROUND AURORA --- */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Green/Blue Gradient Glow */}
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-[#00F0FF] rounded-full blur-[150px] opacity-20" />
                <div className="absolute top-[10%] left-[30%] w-[40%] h-[40%] bg-[#00C853] rounded-full blur-[120px] opacity-20" />
            </div>

            {/* --- TOP HEADER --- */}
            <header className="relative z-20 flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-[1440px] mx-auto">
                {/* LOGO */}
                <div className="flex items-center gap-2">
                    <div className="text-[#00F0FF]"><Zap size={24} fill="currentColor" /></div>
                    <span className="text-xl font-bold tracking-tight">MatchaAuto</span>
                </div>

                {/* LIVE COUNTER */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C853] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C853]"></span>
                    </span>
                    <span className="text-[#00C853] font-bold text-xs tracking-wider">LIVE:</span>
                    <span className="text-gray-300 text-xs">8,432 Active Matchers</span>
                </div>

                {/* LANGUAGE */}
                <div className="flex items-center gap-1 text-gray-400 text-sm font-medium cursor-pointer hover:text-white transition-colors">
                    <span>ES</span> <span className="text-gray-600">/</span> <span>EN</span> <span className="text-gray-600">/</span> <span>PT</span>
                    <ChevronDown size={14} className="ml-1" />
                </div>
            </header>

            {/* --- MAIN CONTENT CENTER --- */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 mt-8 md:mt-0 w-full max-w-6xl mx-auto text-center">

                {/* TITLE */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400"
                >
                    Múevete a la velocidad <br />
                    del pensamiento.
                </motion.h1>

                {/* TABS CONTAINER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-wrap justify-center gap-4 mb-8"
                >
                    {[
                        { id: 'CARS', icon: Car, label: 'CARS' },
                        { id: 'PARTS', icon: Settings, label: 'PARTS' },
                        { id: 'SERVICES', icon: Wrench, label: 'SERVICES' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-8 py-3 rounded-full border transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-white/10 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                    : 'bg-transparent border-white/5 text-gray-400 hover:border-white/20'
                                }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-[#00F0FF]' : ''} />
                            <span className="font-semibold tracking-wide text-sm">[ {tab.label} ]</span>
                        </button>
                    ))}
                </motion.div>

                {/* TOGGLE & SEARCH */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl flex flex-col items-center gap-6 mb-16"
                >
                    {/* TOGGLE RENT | BUY */}
                    <div className="flex items-center gap-4 text-sm font-bold tracking-widest text-gray-400">
                        <span className={mode === 'RENT' ? 'text-white' : ''}>RENT</span>
                        <div
                            className="w-14 h-7 bg-white/10 rounded-full relative cursor-pointer border border-white/10"
                            onClick={() => setMode(mode === 'BUY' ? 'RENT' : 'BUY')}
                        >
                            <motion.div
                                layout
                                className="absolute top-1 bottom-1 w-8 bg-[#FF9500] rounded-full flex items-center justify-center text-[10px] text-black font-black"
                                style={{ left: mode === 'BUY' ? 'calc(100% - 34px)' : '2px' }}
                            >
                                {mode}
                            </motion.div>
                        </div>
                        <span className={mode === 'BUY' ? 'text-white' : ''}>BUY</span>
                    </div>

                    {/* SEARCH BAR */}
                    <div className="w-full relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400" size={20} />
                        </div>
                        <input
                            type="text"
                            defaultValue="Tesla"
                            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]/50 focus:bg-white/10 transition-all font-medium text-lg"
                        />
                        <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-white/20 pointer-events-none" />
                    </div>
                </motion.div>

                {/* CARDS GRID */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
                >
                    {vehicles.map((car, i) => (
                        <div key={i} className="group relative bg-[#0F1115] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F0FF]/10 hover:-translate-y-1">
                            {/* BADGE */}
                            <div className="absolute top-3 right-3 bg-[#FF9500] text-black text-[10px] font-bold px-2 py-1 rounded-md z-10">
                                {car.tag}
                            </div>

                            {/* IMAGE AREA */}
                            <div className="h-40 w-full bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center p-4 relative">
                                {/* Glow behind car */}
                                <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {/* Placeholder Car Image */}
                                <img src={getImg(car.name)} alt={car.name} className="max-h-full object-contain drop-shadow-2xl relative z-10" />
                            </div>

                            {/* CONTENT */}
                            <div className="p-4 text-left">
                                <h3 className="font-bold text-white text-sm mb-1 truncate">{car.name}</h3>
                                <p className="text-gray-400 text-xs mb-4">{car.price}</p>

                                <button className="w-full bg-[#FF9500] hover:bg-[#ffaa33] text-black font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                    <Zap size={14} fill="currentColor" /> Quick-Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </motion.div>

            </main>
        </div>
    )
}
