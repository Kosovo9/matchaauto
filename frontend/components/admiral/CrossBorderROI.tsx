'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, TrendingUp, DollarSign, Target, ChevronRight } from 'lucide-react';

interface CountryROI {
    country: string;
    code: string;
    listings: number;
    avgPrice: number;
    roi: number;
    color: string;
}

export function CrossBorderROI() {
    const [selectedCodes, setSelectedCodes] = useState<string[]>(['MX', 'US', 'BR']);

    const countries: CountryROI[] = [
        { country: 'Mexico', code: 'MX', listings: 4234, avgPrice: 28500, roi: 480, color: 'bg-green-500' },
        { country: 'USA', code: 'US', listings: 8921, avgPrice: 45200, roi: 320, color: 'bg-blue-500' },
        { country: 'Brazil', code: 'BR', listings: 2890, avgPrice: 23400, roi: 520, color: 'bg-yellow-500' },
        { country: 'Canada', code: 'CA', listings: 1567, avgPrice: 38700, roi: 410, color: 'bg-red-500' },
        { country: 'UAE', code: 'AE', listings: 876, avgPrice: 89200, roi: 610, color: 'bg-emerald-400' }
    ];

    const toggleCountry = (code: string) => {
        setSelectedCodes(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    return (
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 relative group">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-black italic tracking-widest text-white uppercase">Cross-Border ROI</h2>
                <Globe className="h-4 w-4 text-cyan-400 opacity-50 group-hover:rotate-180 transition-all duration-1000" />
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
                {countries.map(c => (
                    <button
                        key={c.code}
                        onClick={() => toggleCountry(c.code)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${selectedCodes.includes(c.code)
                                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                            }`}
                    >
                        {c.code}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {countries.filter(c => selectedCodes.includes(c.code)).map((country, idx) => (
                        <motion.div
                            key={country.code}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/5 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 ${country.color} rounded-xl flex items-center justify-center font-black text-black text-xs shadow-lg`}>
                                    {country.code}
                                </div>
                                <div>
                                    <div className="text-xs font-black text-white italic">{country.country}</div>
                                    <div className="text-[9px] text-gray-500 font-mono italic">Avg. ${country.avgPrice.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-lg font-black text-green-400 tracking-tighter glow-text italic">{country.roi}%</div>
                                <div className="text-[8px] text-gray-600 font-mono uppercase">Predictive ROI</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button className="w-full mt-6 py-3 border border-white/10 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white hover:border-cyan-400/50 transition-all flex items-center justify-center gap-2">
                View Full Global Matrix <ChevronRight className="h-3 w-3" />
            </button>
        </div>
    );
}
