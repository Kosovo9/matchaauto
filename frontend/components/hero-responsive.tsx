'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
    Sparkles, Shield, Zap, Globe,
    TrendingUp, Users, DollarSign, Package,
    Search, Car, CheckCircle, ArrowRight,
    Smartphone, Tablet, Monitor
} from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { useMediaQuery } from '@/hooks/use-media-query'

// Hook para detectar dispositivos
function useDeviceDetection() {
    const isMobile = useMediaQuery('(max-width: 640px)')
    const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
    const isDesktop = useMediaQuery('(min-width: 1025px)')

    return { isMobile, isTablet, isDesktop }
}

export default function HeroResponsive() {
    const [stats, setStats] = useState({
        listings: 24500,
        customers: 12000,
        escrow: 10000000,
        countries: 150
    })

    const [activeDevice, setActiveDevice] = useState('desktop')
    const containerRef = useRef(null)
    const { scrollY } = useScroll()
    const { openSignIn } = useClerk()
    const { isMobile, isTablet, isDesktop } = useDeviceDetection()

    // Animaciones basadas en scroll
    const opacity = useTransform(scrollY, [0, 300], [1, 0.3])
    const scale = useTransform(scrollY, [0, 300], [1, 0.95])
    const y = useTransform(scrollY, [0, 300], [0, 50])

    // Auto-detección de dispositivo
    useEffect(() => {
        if (isMobile) setActiveDevice('mobile')
        else if (isTablet) setActiveDevice('tablet')
        else setActiveDevice('desktop')
    }, [isMobile, isTablet, isDesktop])

    // Fetch real stats
    useEffect(() => {
        fetchStats()
    }, [])

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

    const handleVINDecode = () => {
        toast.loading('Opening VIN Decoder...')
        window.location.href = '/vin-decoder'
    }

    const handleQuickStart = () => {
        openSignIn({
            redirectUrl: '/dashboard',
            appearance: { variables: { colorPrimary: '#00ff88' } }
        })
    }

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900"
        >
            {/* Grid background responsive */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 
        bg-[size:50px_50px] sm:bg-[size:100px_100px] lg:bg-[size:150px_150px]" />

            {/* Floating elements - diferentes cantidades por dispositivo */}
            <FloatingElements device={activeDevice} />

            {/* Contenido principal */}
            <motion.div
                style={{ opacity, scale, y }}
                className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="text-center">
                    {/* Badge - responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-6 sm:mb-8"
                    >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                        <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            🚀 LIVE GLOBAL MARKETPLACE
                        </span>
                    </motion.div>

                    {/* Título principal - responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 sm:mb-8"
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight">
                            <span className="block bg-gradient-to-r from-white via-cyan-100 to-purple-100 bg-clip-text text-transparent">
                                Match-Auto
                            </span>
                            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mt-2 sm:mt-4">
                                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Global Domination
                                </span>
                            </span>
                        </h1>
                    </motion.div>

                    {/* Subtítulo - responsive */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl sm:max-w-3xl mx-auto mb-8 sm:mb-12 px-4"
                    >
                        The world's first <span className="text-cyan-400 font-semibold">AI-powered</span>,{' '}
                        <span className="text-purple-400 font-semibold">Solana-secured</span> global automotive marketplace.
                    </motion.p>

                    {/* Stats Grid - responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12"
                    >
                        <StatCard
                            icon={Package}
                            value={stats.listings.toLocaleString() + "+"}
                            label="Total Listings"
                            color="text-cyan-400"
                            delay={0}
                            compact={isMobile}
                        />
                        <StatCard
                            icon={Users}
                            value={stats.customers.toLocaleString() + "+"}
                            label="Happy Customers"
                            color="text-purple-400"
                            delay={0.1}
                            compact={isMobile}
                        />
                        <StatCard
                            icon={DollarSign}
                            value={`$${(stats.escrow / 1000000).toFixed(1)}M+`}
                            label="Escrow Protected"
                            color="text-green-400"
                            delay={0.2}
                            compact={isMobile}
                        />
                        <StatCard
                            icon={Globe}
                            value={stats.countries + "+"}
                            label="Countries"
                            color="text-pink-400"
                            delay={0.3}
                            compact={isMobile}
                        />
                    </motion.div>

                    {/* CTA Buttons - responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mb-8 sm:mb-12"
                    >
                        <ResponsiveButton
                            onClick={handleQuickStart}
                            variant="primary"
                            size={isMobile ? "medium" : "large"}
                            fullWidth={isMobile}
                            icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
                        >
                            Get Started Free
                        </ResponsiveButton>

                        <ResponsiveButton
                            onClick={handleVINDecode}
                            variant="secondary"
                            size={isMobile ? "medium" : "large"}
                            fullWidth={isMobile}
                            icon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                        >
                            Try VIN Decoder
                        </ResponsiveButton>

                        <ResponsiveButton
                            onClick={() => window.location.href = '/marketplace'}
                            variant="success"
                            size={isMobile ? "medium" : "large"}
                            fullWidth={isMobile}
                            icon={<Car className="w-4 h-4 sm:w-5 sm:h-5" />}
                        >
                            Browse Marketplace
                        </ResponsiveButton>
                    </motion.div>

                    {/* Features Grid - responsive */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
                    >
                        <FeatureCard
                            icon={Shield}
                            title="Bank-Grade Security"
                            description="Military-grade encryption and Solana smart contracts"
                            delay={0}
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Lightning Fast"
                            description="0.5s VIN decoding and instant transactions"
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={TrendingUp}
                            title="Global Reach"
                            description="Connect with buyers/sellers in 150+ countries"
                            delay={0.2}
                        />
                    </motion.div>

                    {/* Device-specific tips */}
                    <AnimatePresence>
                        {isMobile && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass rounded-xl p-4 mb-6 bg-white/5 border border-white/10 backdrop-blur-md"
                            >
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-5 h-5 text-cyan-400" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white">Mobile Optimized</p>
                                        <p className="text-xs text-gray-400">Swipe horizontally to see more features</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Scroll indicator - solo desktop */}
            {isDesktop && (
                <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="text-center">
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center mx-auto mb-2">
                            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
                        </div>
                        <p className="text-xs text-gray-400">Scroll to explore</p>
                    </div>
                </motion.div>
            )}
        </section>
    )
}

function FloatingElements({ device }: { device: string }) {
    const count = device === 'mobile' ? 8 : device === 'tablet' ? 12 : 20

    return (
        <>
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-cyan-500/5 to-purple-500/5"
                    animate={{
                        x: [0, Math.sin(i) * (device === 'mobile' ? 50 : 100), 0],
                        y: [0, Math.cos(i) * (device === 'mobile' ? 50 : 100), 0],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: (device === 'mobile' ? 15 : 20) + i * 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        left: `${(i * 10) % 100}%`,
                        top: `${(i * 15) % 100}%`,
                        width: device === 'mobile' ? '3rem' : device === 'tablet' ? '4rem' : '5rem',
                        height: device === 'mobile' ? '3rem' : device === 'tablet' ? '4rem' : '5rem',
                    }}
                />
            ))}
        </>
    )
}

function StatCard({ icon: Icon, value, label, color, delay, compact }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className={`glass rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${compact ? 'p-3' : 'p-4 sm:p-6'}`}
        >
            <div className={`flex ${compact ? 'flex-col items-center' : 'items-center gap-3'} mb-2`}>
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 ${compact ? 'mb-2' : ''}`}>
                    <Icon className={compact ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"} />
                </div>
                <div className={`font-bold ${compact ? 'text-lg' : 'text-xl sm:text-2xl lg:text-3xl'}`}>
                    {value}
                </div>
            </div>
            <div className={`text-gray-400 uppercase tracking-wider ${compact ? 'text-xs' : 'text-sm'}`}>
                {label}
            </div>
        </motion.div>
    )
}

function ResponsiveButton({
    children,
    onClick,
    variant,
    size,
    fullWidth,
    icon
}: any) {
    const baseClasses = "group relative font-semibold rounded-xl transition-all duration-300 overflow-hidden flex items-center justify-center gap-2"

    const sizeClasses: any = {
        small: "px-4 py-2 text-sm",
        medium: "px-6 py-3 text-base",
        large: "px-8 py-4 text-lg"
    }

    const variantClasses: any = {
        primary: "bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-cyan-500/30",
        secondary: "glass border border-white/10 text-white hover:border-cyan-500/50 hover:bg-white/20 backdrop-blur-md",
        success: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:shadow-green-500/30"
    }

    const widthClass = fullWidth ? "w-full" : ""

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass}`}
        >
            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
    )
}

function FeatureCard({ icon: Icon, title, description, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass rounded-xl p-4 sm:p-6 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
                    <Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>
        </motion.div>
    )
}
