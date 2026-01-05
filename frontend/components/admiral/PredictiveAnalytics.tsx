'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Zap, DollarSign, Brain } from 'lucide-react';

export function PredictiveAnalytics() {
    const predictions = [
        { metric: 'Inflow Projection', current: '$284K', predicted: '$421K', confidence: 94, trend: 'up' },
        { metric: 'Global User Graph', current: '320K', predicted: '520K', confidence: 89, trend: 'up' },
        { metric: 'Match-Ads ROI', current: '427%', predicted: '512%', confidence: 82, trend: 'up' },
        { metric: 'CAC (Efficiency)', current: '$7.71', predicted: '$6.32', confidence: 76, trend: 'down' },
    ];

    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 relative group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-purple-400" />
                    <h2 className="text-sm font-black italic tracking-widest text-white uppercase">Predictive AI</h2>
                </div>
                <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-tighter">SENTINEL-X FEED</span>
                </div>
            </div>

            <div className="space-y-4">
                {predictions.map((p, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{p.metric}</span>
                            <div className={`flex items-center gap-1 text-[9px] font-black ${p.trend === 'up' ? 'text-green-400' : 'text-cyan-400'}`}>
                                {p.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                PROJECTED
                            </div>
                        </div>

                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-xl font-black text-white italic tracking-tighter">{p.current}</div>
                                <div className="text-[8px] text-gray-600 font-mono">CURRENT</div>
                            </div>

                            <div className="text-right">
                                <div className="text-xl font-black text-purple-400 italic tracking-tighter glow-text">{p.predicted}</div>
                                <div className="text-[8px] text-gray-600 font-mono">T+30D BIAS</div>
                            </div>
                        </div>

                        {/* Confidence Gauge */}
                        <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${p.confidence}%` }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                />
                            </div>
                            <span className="text-[8px] font-black text-purple-400/50">{p.confidence}% ACC</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
