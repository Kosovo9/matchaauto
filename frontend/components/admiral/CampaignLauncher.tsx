'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Zap, Clock, Users, Globe } from 'lucide-react';

export function AdCampaignLauncher() {
    const [phase, setPhase] = useState<'idle' | 'pre-flight' | 'blitz'>('idle');

    const startBlitz = () => {
        setPhase('pre-flight');
        setTimeout(() => setPhase('blitz'), 2000);
    };

    const steps = [
        { day: 1, region: 'MEXICO', users: '50K+', color: 'bg-green-500' },
        { day: 4, region: 'US/CAN', users: '75K+', color: 'bg-blue-500' },
        { day: 7, region: 'LATAM', users: '175K+', color: 'bg-yellow-500' },
        { day: 14, region: 'GLOBAL', users: '500K+', color: 'bg-cyan-500' }
    ];

    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black italic tracking-widest text-white uppercase">Campaign Blitzkrieg</h2>
                <Zap className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>

            <div className="relative space-y-6">
                {/* Timeline Path */}
                <div className="absolute left-[31px] top-4 bottom-4 w-[2px] bg-white/5" />

                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-6 relative">
                        <div className={`h-16 w-16 rounded-2xl ${step.day <= (phase === 'blitz' ? 14 : phase === 'pre-flight' ? 1 : 0) ? step.color : 'bg-white/5'} flex flex-col items-center justify-center transition-all duration-1000 shadow-xl border border-white/10`}>
                            <span className="text-[10px] font-black text-black leading-none">DAY</span>
                            <span className="text-2xl font-black text-black leading-none">{step.day}</span>
                        </div>
                        <div>
                            <div className="text-xs font-black text-white italic tracking-widest">{step.region}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <Users className="h-3 w-3 text-gray-500" />
                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">Target: {step.users}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <motion.button
                onClick={startBlitz}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-10 py-5 rounded-2xl font-black text-xs italic tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${phase === 'idle'
                        ? 'bg-white text-black hover:bg-cyan-400'
                        : phase === 'pre-flight'
                            ? 'bg-yellow-500 text-black animate-pulse'
                            : 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    }`}
            >
                {phase === 'idle' && <><Rocket className="h-4 w-4" /> INITIATE 14-DAY BLITZ</>}
                {phase === 'pre-flight' && <><Clock className="h-4 w-4" /> CALIBRATING NODES...</>}
                {phase === 'blitz' && <><Globe className="h-4 w-4" /> PROTOCOL LIVE: GLOBAL</>}
            </motion.button>
        </div>
    );
}
