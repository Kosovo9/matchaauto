'use client'

import Link from 'next/link'
import { Sparkles, Twitter, Github, Linkedin, Globe } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/40 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#009EE3] flex items-center justify-center p-[1px]">
                                <div className="w-full h-full bg-black rounded-[0.8rem] flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-[#39FF14]" />
                                </div>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                MATCH<span className="text-[#39FF14]">AUTO</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            The world's first AI-powered, Solana-secured global automotive marketplace.
                            Connecting buyers and sellers across 150+ countries with quantum security.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Platform</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/marketplace" className="hover:text-cyan-400 transition">Marketplace</Link></li>
                            <li><Link href="/vin-decoder" className="hover:text-cyan-400 transition">VIN Decoder</Link></li>
                            <li><Link href="/escrow" className="hover:text-cyan-400 transition">Escrow Service</Link></li>
                            <li><Link href="/pricing" className="hover:text-cyan-400 transition">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-white mb-4">Support</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/help" className="hover:text-cyan-400 transition">Help Center</Link></li>
                            <li><Link href="/api-docs" className="hover:text-cyan-400 transition">API Documentation</Link></li>
                            <li><Link href="/status" className="hover:text-cyan-400 transition">System Status</Link></li>
                            <li><Link href="/contact" className="hover:text-cyan-400 transition">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} Match-Auto Global. All rights reserved.
                    </div>

                    <div className="flex space-x-4">
                        <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
