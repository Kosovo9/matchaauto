'use client';

import { motion } from 'framer-motion';
import { Rocket, Shield, Zap, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden nasa-grid">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full animate-orbit" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-orbit" style={{ animationDirection: 'reverse' }} />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel border border-cyan-500/30 mb-8">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">
                            Now Boarding: Mach 10 Commerce
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tighter leading-none">
                        <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent italic">GLOBAL</span>
                        <br />
                        <span className="text-white glow-text italic">MARKETPLACE</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="max-w-3xl mx-auto text-xl text-gray-400 font-light leading-relaxed mb-12">
                        The world's first <span className="text-cyan-400 font-bold">Edge-Native</span> auction protocol.
                        Built for speed with Solana, secured by Sentinel-X, and powered by
                        a viral growth engine that redefines scale.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button size="lg" className="h-16 px-10 text-lg font-black italic bg-white text-black hover:bg-cyan-400 hover:scale-105 transition-all group">
                            INITIATE LAUNCH
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold border-white/10 hover:bg-white/5">
                            EXPLORE THE PROTOCOL
                        </Button>
                    </div>
                </motion.div>

                {/* Integration Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all"
                >
                    <IntegrationLogo name="SOLANA" icon={<Zap className="h-5 w-5" />} />
                    <IntegrationLogo name="CLERK" icon={<Shield className="h-5 w-5" />} />
                    <IntegrationLogo name="SENTINEL-X" icon={<Rocket className="h-5 w-5" />} />
                    <IntegrationLogo name="CF-EDGE" icon={<Globe className="h-5 w-5" />} />
                </motion.div>
            </div>

            {/* Foreground decorative line */}
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </section>
    );
}

function IntegrationLogo({ name, icon }: { name: string, icon: any }) {
    return (
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-sm font-black tracking-widest">{name}</span>
        </div>
    );
}
