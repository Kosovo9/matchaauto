'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-purple-900/20" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto p-12 rounded-3xl bg-gradient-to-r from-gray-900 to-black border border-white/10 shadow-2xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-8">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium">Join the Revolution</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to Transform Your<br />
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Auto Parts Business?
                        </span>
                    </h2>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of sellers who have increased their revenue by 300% using our global platform.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => window.location.href = '/auth/signup'}
                            className="px-8 py-4 text-lg font-bold rounded-xl bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            Start Selling Free
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => window.location.href = '/contact'}
                            className="px-8 py-4 text-lg font-bold rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            Contact Sales
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
