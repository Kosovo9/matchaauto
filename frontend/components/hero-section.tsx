'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Sparkles, Shield, Zap, Globe,
    TrendingUp, Users, DollarSign, Package
} from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'

// Fallback StatCard component if not defined elsewhere
function StatCard({ icon: Icon, value, label, color, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="glass rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-sm"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold">{value}</div>
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
        </motion.div>
    )
}

function TrustBadge({ icon: Icon, label }: any) {
    return (
        <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                <Icon className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-gray-300 text-sm">{label}</span>
        </div>
    )
}

export default function HeroSection() {
    const [stats, setStats] = useState({
        listings: 24500,
        customers: 12000,
        escrow: 10000000,
        countries: 150
    })
    const { openSignIn } = useClerk()

    // Fetch real stats from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('https://match-auto-backend.neocwolf.workers.dev/api/stats/global')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data)
                }
            } catch (error) {
                console.log('Using fallback stats')
            }
        }
        fetchStats()
    }, [])

    const handleVINDecode = async () => {
        toast.loading('Opening VIN Decoder...')
        window.location.href = '/vin-decoder'
    }

    const handleQuickStart = () => {
        openSignIn({
            redirectUrl: '/dashboard',
            appearance: {
                variables: {
                    colorPrimary: '#00ff88'
                }
            }
        })
    }

    return (
        <section className="relative py-20 lg:py-32 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />

            {/* Floating elements */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                    animate={{
                        x: [0, Math.sin(i) * 100, 0],
                        y: [0, Math.cos(i) * 100, 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20 + i * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        left: `${(i * 10) % 100}%`,
                        top: `${(i * 15) % 100}%`,
                    }}
                />
            ))}

            <div className="relative z-10 container mx-auto px-4">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-8"
                    >
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            🚀 LIVE GLOBAL MARKETPLACE
                        </span>
                    </motion.div>

                    {/* Main title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
                    >
                        <span className="block bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
                            Match-Auto
                        </span>
                        <span className="block text-3xl md:text-5xl lg:text-6xl font-bold mt-4">
                            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Global Domination
                            </span>
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
                    >
                        The world's first <span className="text-cyan-400 font-semibold">AI-powered</span>,{' '}
                        <span className="text-purple-400 font-semibold">Solana-secured</span> global automotive marketplace.
                        Connect buyers and sellers across <span className="text-green-400 font-semibold">150+ countries</span> with zero friction.
                    </motion.p>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                >
                    <StatCard
                        icon={Package}
                        value={stats.listings.toLocaleString() + "+"}
                        label="Total Listings"
                        color="text-cyan-400"
                        delay={0}
                    />
                    <StatCard
                        icon={Users}
                        value={stats.customers.toLocaleString() + "+"}
                        label="Happy Customers"
                        color="text-purple-400"
                        delay={0.1}
                    />
                    <StatCard
                        icon={DollarSign}
                        value={`$${(stats.escrow / 1000000).toFixed(1)}M+`}
                        label="Escrow Protected"
                        color="text-green-400"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Globe}
                        value={stats.countries + "+"}
                        label="Countries"
                        color="text-pink-400"
                        delay={0.3}
                    />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={handleQuickStart}
                        className="group relative px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden text-white"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Get Started Free
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>

                    <button
                        onClick={handleVINDecode}
                        className="px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 text-white"
                    >
                        Try VIN Decoder
                    </button>

                    <button
                        onClick={() => window.location.href = '/marketplace'}
                        className="px-8 py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:shadow-green-500/30 transition-all text-white"
                    >
                        Browse Marketplace
                    </button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center"
                >
                    <p className="text-gray-400 text-sm mb-4">Trusted by industry leaders</p>
                    <div className="flex flex-wrap gap-8 items-center justify-center">
                        <TrustBadge icon={Shield} label="Bank-Grade Security" />
                        <TrustBadge icon={Zap} label="0.5s VIN Decode" />
                        <TrustBadge icon={TrendingUp} label="98% Satisfaction" />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
