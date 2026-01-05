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
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Match-Auto
                            </h1>
                            <p className="text-xs text-gray-400">Global Marketplace</p>
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
