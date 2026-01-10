// frontend/src/features/ar/FARPass.tsx
'use client';

import { useState } from 'react';
import { Box, Boxes, Info, Download, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FARPass({ modelId = 'QM-99' }) {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'READY'>('IDLE');

    const startAR = () => {
        setStatus('LOADING');
        setTimeout(() => setStatus('READY'), 2000);
    };

    return (
        <div className="relative aspect-square md:aspect-video rounded-[2.5rem] bg-neutral-900 overflow-hidden border border-white/10 group shadow-inner">
            {/* Simulation Surface */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-50" />

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                {status === 'IDLE' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="relative mb-8 inline-block">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="relative p-8 bg-blue-600 rounded-full shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                                <Box className="w-16 h-16 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-4">F-AR_PASS v1.0</h2>
                        <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed mb-8">
                            Passive Augmented Reality Engine. Deploy 3D digital twins to physical space without external hardware.
                        </p>
                        <button
                            onClick={startAR}
                            className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-blue-50 transition-all active:scale-95"
                        >
                            INITIALIZE_SCAN
                        </button>
                    </motion.div>
                )}

                {status === 'LOADING' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                        <span className="text-xs font-mono text-blue-400 animate-pulse tracking-widest uppercase">CALIBRATING_SPATIAL_LAYER</span>
                    </div>
                )}

                {status === 'READY' && (
                    <div className="w-full h-full flex items-center justify-center relative">
                        <div className="absolute inset-0 border-[2px] border-blue-500/20 rounded-3xl animate-pulse" />
                        <div className="text-center">
                            <Boxes className="w-24 h-24 text-blue-500/50 mx-auto mb-4" />
                            <p className="text-blue-400 font-mono text-[10px] tracking-[0.5em]">SPATIAL_OBJECT_LOCK: {modelId}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating HUD controls */}
            <div className="absolute top-8 right-8 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all">
                {[Info, Download, Share2].map((Icon, idx) => (
                    <button key={idx} className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                        <Icon className="w-5 h-5 text-white/60" />
                    </button>
                ))}
            </div>

            <div className="absolute bottom-8 left-8">
                <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-xl p-3 pl-4 pr-6 rounded-2xl border border-white/10">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">LIDAR_ACTIVE</span>
                </div>
            </div>
        </div>
    );
}
