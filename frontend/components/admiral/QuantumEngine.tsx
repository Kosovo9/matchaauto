'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Zap, Target, TrendingUp, BarChart3, Brain, Cpu, Sparkles } from 'lucide-react';

interface AdTier {
    id: string;
    name: string;
    price: number;
    viewsBoost: number;
    color: string;
    glow: string;
    features: string[];
}

export function QuantumAdEngine() {
    const [selectedTier, setSelectedTier] = useState<string>('platinum');
    const [budget, setBudget] = useState(1000);
    const [predictiveResults, setPredictiveResults] = useState<any>(null);

    const adTiers: AdTier[] = [
        {
            id: 'bronze',
            name: 'BRONZE',
            price: 49,
            viewsBoost: 200,
            color: 'from-orange-900 to-orange-600',
            glow: 'shadow-[0_0_15px_rgba(251,146,60,0.3)]',
            features: ['7 days boost', '200% Reach']
        },
        {
            id: 'silver',
            name: 'SILVER',
            price: 149,
            viewsBoost: 500,
            color: 'from-gray-600 to-gray-400',
            glow: 'shadow-[0_0_15px_rgba(156,163,175,0.3)]',
            features: ['Top 3 priority', '500% Reach']
        },
        {
            id: 'gold',
            name: 'GOLD',
            price: 299,
            viewsBoost: 1000,
            color: 'from-yellow-600 to-yellow-400',
            glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]',
            features: ['Home Feature', '1000% Reach']
        },
        {
            id: 'platinum',
            name: 'PLATINUM',
            price: 599,
            viewsBoost: 2500,
            color: 'from-cyan-400 to-blue-600',
            glow: 'shadow-[0_0_20px_rgba(34,211,238,0.4)]',
            features: ['Global Blitz', '2500% Reach']
        }
    ];

    useEffect(() => {
        const tier = adTiers.find(t => t.id === selectedTier);
        if (!tier) return;

        // Simulate complex ROI algorithm
        const baseViews = (budget / tier.price) * 5000;
        const views = baseViews * (tier.viewsBoost / 100);
        const contacts = views * 0.04;
        const roi = ((views * 0.1 - budget) / budget) * 100;

        setPredictiveResults({
            views: Math.floor(views),
            contacts: Math.floor(contacts),
            roi: Math.floor(roi)
        });
    }, [selectedTier, budget]);

    return (
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />

            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                        <Brain className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter text-white">QUANTUM AD ENGINE</h2>
                        <p className="text-[10px] text-cyan-400/50 font-mono tracking-widest uppercase">Predictive Blitz Simulation</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">AI_OPTIMIZED: ON</span>
                </div>
            </div>

            {/* TIER SELECTION */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {adTiers.map((tier) => (
                    <motion.button
                        key={tier.id}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`relative p-5 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${selectedTier === tier.id
                                ? 'border-cyan-400 bg-cyan-400/10 ' + tier.glow
                                : 'border-white/5 bg-white/2 hover:border-white/20'
                            }`}
                    >
                        {selectedTier === tier.id && (
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent animate-pulse" />
                        )}
                        <div className={`h-1.5 w-12 mb-4 rounded-full bg-gradient-to-r ${tier.color}`} />
                        <div className="text-xs font-black tracking-widest text-white mb-1 italic">{tier.name}</div>
                        <div className="text-2xl font-black text-white glow-text tracking-tighter">${tier.price}</div>
                    </motion.button>
                ))}
            </div>

            {/* PROJECTION PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-4 uppercase tracking-[0.2em]">
                            <span>Campaign Magnitude</span>
                            <span className="text-white">${budget.toLocaleString()} USD</span>
                        </div>
                        <input
                            type="range"
                            min="100"
                            max="10000"
                            step="100"
                            value={budget}
                            onChange={(e) => setBudget(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-crosshair accent-cyan-400"
                        />
                    </div>

                    <div className="p-6 bg-white/2 rounded-3xl border border-white/5 space-y-4">
                        <h4 className="text-[10px] font-black text-white/50 tracking-widest uppercase">Target Matrix</h4>
                        {[
                            { label: 'Geographic Density', value: 'ULTRA_HIGH' },
                            { label: 'Neural Matching', value: 'MATCH_98%' },
                            { label: 'Edge Propagation', value: '47ms' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-gray-500 font-mono">{item.label}</span>
                                <span className="text-cyan-400 font-black">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-cyan-400/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="h-16 w-16 text-cyan-400" />
                    </div>
                    <h4 className="text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-6">Simulation Result</h4>

                    {predictiveResults && (
                        <div className="grid grid-cols-2 gap-y-6">
                            <div>
                                <div className="text-2xl font-black text-white tracking-tighter italic">{predictiveResults.views.toLocaleString()}</div>
                                <div className="text-[9px] text-gray-500 font-mono uppercase">Est. Reach</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white tracking-tighter italic">{predictiveResults.contacts.toLocaleString()}</div>
                                <div className="text-[9px] text-gray-500 font-mono uppercase">Est. Leads</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-green-400 tracking-tighter italic">+{predictiveResults.roi}%</div>
                                <div className="text-[9px] text-gray-500 font-mono uppercase">Projected ROI</div>
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-cyan-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: '85%' }}
                                    />
                                </div>
                                <div className="text-[8px] text-cyan-400/50 mt-1 font-mono">CONFIDENCE_SCORE</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-6 bg-white text-black rounded-2xl font-black text-xl italic flex items-center justify-center gap-4 hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            >
                <Rocket className="h-6 w-6" />
                INITIATE QUANTUM LAUNCH
            </motion.button>
        </div>
    );
}
