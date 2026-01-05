'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, Users, DollarSign, Target, Zap, Radio } from 'lucide-react';

interface Metric {
    id: string;
    label: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: string;
}

export function RealTimeGlobalMetrics() {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [liveConnections, setLiveConnections] = useState(124890);

    useEffect(() => {
        // Initial static data for the "100,000X Preview"
        setMetrics([
            {
                id: 'global_reach',
                label: 'Global Reach',
                value: '3.2M',
                change: 24.7,
                icon: <Globe className="h-4 w-4" />,
                color: 'from-blue-500 to-cyan-400'
            },
            {
                id: 'active_campaigns',
                label: 'Active Ad Units',
                value: '14,892',
                change: 12.3,
                icon: <Target className="h-4 w-4" />,
                color: 'from-purple-500 to-pink-400'
            },
            {
                id: 'ad_spend_today',
                label: 'Vault Intake 24h',
                value: '$284,752',
                change: 18.5,
                icon: <DollarSign className="h-4 w-4" />,
                color: 'from-green-500 to-emerald-400'
            },
            {
                id: 'avg_roi',
                label: 'Protocol ROI',
                value: '427%',
                change: 5.2,
                icon: <TrendingUp className="h-4 w-4" />,
                color: 'from-orange-500 to-yellow-400'
            }
        ]);

        const interval = setInterval(() => {
            setLiveConnections(prev => prev + Math.floor(Math.random() * 10) - 2);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-panel p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 blur-[50px] rounded-full group-hover:bg-cyan-500/20 transition-all" />

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
                    <h2 className="text-sm font-black tracking-[0.2em] italic uppercase">Orbital Telemetry</h2>
                </div>
                <div className="text-[10px] font-mono text-cyan-400/50">
                    {liveConnections.toLocaleString()} LIVE_NODES
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-500/50 transition-all cursor-crosshair"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color} shadow-lg`}>
                                {metric.icon}
                            </div>
                            <div className={`text-[10px] font-black ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {metric.change >= 0 ? '▲' : '▼'} {Math.abs(metric.change)}%
                            </div>
                        </div>

                        <div className="text-2xl font-black italic tracking-tighter text-white">
                            {metric.value}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1 uppercase">
                            {metric.label}
                        </div>

                        {/* Sparkline Mock */}
                        <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full bg-gradient-to-r ${metric.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.random() * 60 + 40}%` }}
                                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Mini Radar */}
            <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 mb-2 uppercase">
                    <span>Global Propagation</span>
                    <span className="text-cyan-400">99.9% SYNC</span>
                </div>
                <div className="h-12 w-full bg-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <div className="absolute h-full w-[2px] bg-cyan-400/50 left-1/2 -translate-x-1/2 animate-scan" />
                    <span className="relative z-10 text-[9px] tracking-[0.5em] text-white/30">SCANNING_EDGE_NODES...</span>
                </div>
            </div>
        </div>
    );
}
