'use client';

import { motion } from 'framer-motion';
import { Target, Activity } from 'lucide-react';

export function CompetitiveHeatmap() {
    const regions = [
        { name: 'CDMX', value: 98, trend: 'HIGH' },
        { name: 'MIAMI', value: 85, trend: 'MID' },
        { name: 'SAO PAULO', value: 92, trend: 'HIGH' },
        { name: 'DUBAI', value: 74, trend: 'MID' }
    ];

    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 relative overflow-hidden h-[300px]">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black italic tracking-widest text-white uppercase">Competitive Pulse</h2>
                <Activity className="h-4 w-4 text-red-500 animate-pulse" />
            </div>

            <div className="space-y-6">
                {regions.map((region, idx) => (
                    <div key={idx}>
                        <div className="flex justify-between text-[10px] font-mono mb-2">
                            <span className="text-gray-400">{region.name}</span>
                            <span className="text-white font-black">{region.value}/100</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                            <motion.div
                                className={`h-full bg-gradient-to-r ${region.value > 90 ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-400'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${region.value}%` }}
                                transition={{ duration: 1.5, delay: idx * 0.1 }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
                <div className="text-[8px] font-mono text-gray-500 text-center uppercase tracking-widest">
                    Dominance Index: Aggregated Global Data
                </div>
            </div>
        </div>
    );
}
