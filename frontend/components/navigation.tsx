'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Menu, X, Search, ShoppingCart, User,
    Globe, Shield, Zap, Bell, MessageSquare,
    BarChart3, Settings, Wallet, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signOut, useSession } from 'next-auth/react'

const navItems = [
    { label: 'Marketplace', href: '/marketplace', icon: Globe },
    { label: 'VIN Decoder', href: '/vin-decoder', icon: Search },
    { label: 'Escrow', href: '/escrow', icon: Shield },
    { label: 'AI Analysis', href: '/ai', icon: Zap },
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { label: 'Messages', href: '/messages', icon: MessageSquare },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
]

const quickActions = [
    { label: 'Sell Parts', href: '/listings/create', color: 'from-green-500 to-emerald-600' },
    { label: 'Buy Now', href: '/marketplace', color: 'from-blue-500 to-cyan-600' },
    { label: 'Live Auction', href: '/auctions', color: 'from-purple-500 to-pink-600' },
]

export function Navigation() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#39FF14] to-[#009EE3] flex items-center justify-center p-[1px]">
                                <div className="w-full h-full bg-black rounded-[0.9rem] flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-[#39FF14] animate-pulse" />
                                </div>
                            </div>
                            <div className="absolute -inset-2 bg-[#39FF14]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-white group-hover:text-[#39FF14] transition-colors">
                                MATCH<span className="text-[#39FF14]">AUTO</span>
                            </h1>
                            <p className="text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">Quantum Marketplace</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition group"
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:w-3/4 transition-all" />
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className={`px-4 py-2 rounded-lg bg-gradient-to-r ${action.color} text-white font-medium hover:opacity-90 transition`}
                            >
                                {action.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-lg hover:bg-white/5 transition">
                            <Bell className="w-5 h-5" />
                        </button>

                        <button className="p-2 rounded-lg hover:bg-white/5 transition relative">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs flex items-center justify-center">
                                3
                            </span>
                        </button>

                        {session ? (
                            <>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 transition"
                                >
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => signIn()}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 transition"
                            >
                                <User className="w-4 h-4" />
                                <span>Connect</span>
                            </button>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden border-t border-white/10"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-white/5 transition"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            <div className="pt-4 border-t border-white/10">
                                <div className="grid grid-cols-2 gap-2">
                                    {quickActions.map((action) => (
                                        <Link
                                            key={action.label}
                                            href={action.href}
                                            className={`px-4 py-2 rounded-lg bg-gradient-to-r ${action.color} text-white text-center font-medium hover:opacity-90 transition`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {action.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
