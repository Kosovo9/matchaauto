// frontend/src/components/SelloComunitario.tsx
'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Users, Zap } from 'lucide-react';

export default function SelloComunitario({ level = 10 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-3xl border border-white/10 p-2 pl-4 pr-6 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.1)] group hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] transition-all cursor-help"
        >
            <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/40 blur-md rounded-full group-hover:animate-pulse" />
                <ShieldCheck className="relative w-6 h-6 text-emerald-400" />
            </div>

            <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase leading-none mb-1">
                    Trinity_Trust_Protocol
                </span>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">SELLO_COMUNITARIO</span>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex items-center text-emerald-400 space-x-1">
                        <Zap className="w-3 h-3 fill-current" />
                        <span className="text-xs font-mono font-bold">LVL_{level}</span>
                    </div>
                </div>
            </div>

            {/* Social Proof Mini-Counter */}
            <div className="flex -space-x-2 ml-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center overflow-hidden">
                        <Users className="w-3 h-3 text-white/40" />
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
