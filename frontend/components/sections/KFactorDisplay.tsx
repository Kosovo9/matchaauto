'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Share2, Target, ArrowUpRight, Sparkles, Zap, Shield, Cpu } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface KFactorData {
    kFactor: string;
    viralCoefficient: string;
    metrics: {
        invitesSent: number;
        invitesAccepted: number;
        shares: number;
        conversions: number;
        acceptanceRate: string;
        conversionRate: string;
        retentionRate: string;
    };
    interpretation: {
        level: string;
        message: string;
        color: string;
        emoji: string;
    };
}

export function KFactorDisplay({ data }: { data: KFactorData }) {
    const [animatedKFactor, setAnimatedKFactor] = useState(0);
    const [hoverInfo, setHoverInfo] = useState<string | null>(null);

    useEffect(() => {
        const targetKFactor = parseFloat(data.kFactor);
        const duration = 2500;
        const steps = 100;
        const increment = targetKFactor / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            setAnimatedKFactor(parseFloat(current.toFixed(2)));

            if (step >= steps) {
                clearInterval(timer);
                setAnimatedKFactor(targetKFactor);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [data.kFactor]);

    return (
        <div className="relative group perspective-1000">
            {/* Background Holographic Atmosphere */}
            <div className="absolute -inset-20 bg-cyan-900/10 blur-[100px] rounded-full animate-pulse-glow" />

            {/* Main Hologram Container */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Stats Console (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    <StatMiniCard
                        icon={<Users className="h-4 w-4 text-cyan-400" />}
                        label="Neural Nodes"
                        value={data.metrics.invitesSent.toLocaleString()}
                        subValue={`${data.metrics.acceptanceRate}% SYNC`}
                    />
                    <StatMiniCard
                        icon={<Share2 className="h-4 w-4 text-purple-400" />}
                        label="Viral Spread"
                        value={data.metrics.shares.toLocaleString()}
                        subValue="EXPONENTIAL"
                    />
                    <StatMiniCard
                        icon={<Shield className="h-4 w-4 text-green-400" />}
                        label="Integrity"
                        value="99.9%"
                        subValue="SECURE"
                    />
                </div>

                {/* Center Quantum Core (6 cols) */}
                <div className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]">
                    {/* Rotating Rings */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="absolute w-80 h-80 border-t-2 border-cyan-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute w-72 h-72 border-r-2 border-purple-500 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                        <div className="absolute w-64 h-64 border-l-2 border-cyan-300 rounded-full animate-spin" style={{ animationDuration: '9s' }} />
                    </div>

                    {/* Central Hexagon Core */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-panel quantum-border p-12 text-center rounded-[2rem] w-full max-w-sm relative overflow-hidden"
                    >
                        {/* Scanline line */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />

                        <div className="relative z-10">
                            <div className="text-xs tracking-[0.5em] text-cyan-400/70 font-mono mb-4">ENGINE:ACTIVE</div>
                            <motion.div
                                className="text-8xl font-black glow-text bg-gradient-to-b from-white to-cyan-200 bg-clip-text text-transparent italic"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                {animatedKFactor.toFixed(2)}x
                            </motion.div>
                            <div className="text-sm text-gray-400 font-mono mt-4 uppercase tracking-widest">
                                K-Factor Coefficient
                            </div>
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-bold bg-white/10 px-4 py-1 rounded-full border border-white/20">
                                    {data.interpretation.level.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right Metrics Console (3 cols) */}
                <div className="lg:col-span-3 space-y-4">
                    <StatMiniCard
                        icon={<Target className="h-4 w-4 text-orange-400" />}
                        label="Conversions"
                        value={data.metrics.conversions.toLocaleString()}
                        subValue={`${data.metrics.conversionRate}% ROI`}
                    />
                    <StatMiniCard
                        icon={<TrendingUp className="h-4 w-4 text-blue-400" />}
                        label="Reach Pulse"
                        value={`${Math.round(parseFloat(data.viralCoefficient) * 100)}TPS`}
                        subValue="LIVE DATA"
                    />
                    <StatMiniCard
                        icon={<Cpu className="h-4 w-4 text-pink-400" />}
                        label="Compute"
                        value="LATENCY:1ms"
                        subValue="EDGE ENABLED"
                    />
                </div>

            </div>

            {/* Narrative Overlay */}
            <div className="mt-12 text-center">
                <p className="text-cyan-400/80 font-mono text-sm max-w-2xl mx-auto border-t border-white/10 pt-6">
                    [LOG]: {data.interpretation.message} | TRACE_ID: {Math.random().toString(36).substring(7).toUpperCase()}
                </p>
            </div>
        </div>
    );
}

function StatMiniCard({ icon, label, value, subValue }: { icon: any, label: string, value: string, subValue: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02, x: 5 }}
            className="glass-panel p-4 rounded-xl flex items-center gap-4 group/card"
        >
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 group-hover/card:border-cyan-500/50 transition-colors">
                {icon}
            </div>
            <div>
                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{label}</div>
                <div className="text-lg font-bold text-white leading-tight">{value}</div>
                <div className="text-[10px] font-mono text-cyan-500/60">{subValue}</div>
            </div>
        </motion.div>
    );
}
