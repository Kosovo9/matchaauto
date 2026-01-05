'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Shield, Globe, Zap } from 'lucide-react'
import { AnimatedButton } from '@/components/ui/animated-button'

export function HeroSection() {
    return (
        <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Animated dots */}
            <div className="absolute inset-0">
                {[...Array(50)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 2,
                            delay: i * 0.05,
                            repeat: Infinity,
                        }}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-8">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">
                            🚀 GLOBAL AUTO PARTS MARKETPLACE
                        </span>
                    </div>

                    {/* Main title */}
                    <h1 className="text-6xl md:text-8xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-white via-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Match-Auto
                        </span>
                        <br />
                        <span className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Global Domination
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
                        The world's first AI-powered, Solana-secured global automotive marketplace.
                        Connect buyers and sellers across 150+ countries with zero friction.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mb-12">
                        {[
                            { icon: Globe, value: '150+', label: 'Countries' },
                            { icon: Shield, value: '$10M+', label: 'Secured Escrow' },
                            { icon: Zap, value: '0.5s', label: 'VIN Decode' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.2 }}
                                className="text-center"
                            >
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10">
                                    <stat.icon className="w-8 h-8 text-cyan-400" />
                                </div>
                                <div className="text-3xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <AnimatedButton
                            variant="premium"
                            size="lg"
                            withArrow
                            withSparkles
                            className="px-8 py-4 text-lg"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Launch Dashboard
                            <Sparkles className="ml-2" />
                        </AnimatedButton>

                        <AnimatedButton
                            variant="gradient"
                            size="lg"
                            className="px-8 py-4 text-lg"
                            onClick={() => window.location.href = '/vin-decoder'}
                        >
                            Try VIN Decoder
                        </AnimatedButton>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
                </div>
            </motion.div>
        </div>
    )
}
