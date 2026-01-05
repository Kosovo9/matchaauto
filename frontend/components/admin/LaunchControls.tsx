// frontend/components/admin/LaunchControls.tsx
'use client';

import React, { useState } from 'react';
import { Rocket, Shield, Activity, AlertTriangle, Play, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaunchControlsProps {
    currentPhase: string | number;
    onLaunchPhase: (phase: string) => void;
    launchStatus?: string;
}

export default function LaunchControls({ currentPhase, onLaunchPhase, launchStatus }: LaunchControlsProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    const phases = [
        { id: 'day1', name: '🇲🇽 México Día 1', description: 'Infraestructura, CDN & CDMX' },
        { id: 'day2', name: '🇲🇽 México Día 2', description: 'Expansión Norte/Sur & SEO' },
        { id: 'day3', name: '🇲🇽 México Día 3', description: 'Monetización & Afiliados' }
    ];

    const handleStart = async () => {
        setLoading(true);
        try {
            await onLaunchPhase('day1');
            setIsConfirming(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Rocket className="text-cyan-400 w-5 h-5" />
                    Mission Control
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">Ready for Ignition</span>
                </div>
            </div>

            <div className="space-y-4">
                {phases.map((phase) => (
                    <div
                        key={phase.id}
                        className={`p-4 rounded-xl border transition-all ${currentPhase === phase.id
                                ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/20'
                                : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">{phase.name}</h3>
                                <p className="text-xs text-gray-400 mt-1">{phase.description}</p>
                            </div>
                            {currentPhase === phase.id && (
                                <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 rounded-full font-bold uppercase">
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
                {!isConfirming ? (
                    <button
                        onClick={() => setIsConfirming(true)}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        INICIAR LANZAMIENTO MÉXICO
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="text-red-400 w-5 h-5 shrink-0" />
                            <p className="text-xs text-red-200">
                                ADVERTENCIA: Esta acción activará la infraestructura de producción, el escalado de CDN y la facturación de Match-Ads para la región de México.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsConfirming(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-3 rounded-xl transition-colors"
                                disabled={loading}
                            >
                                CANCELAR
                            </button>
                            <button
                                onClick={handleStart}
                                disabled={loading}
                                className="flex-[2] bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Rocket className="w-5 h-5" />
                                        CONFIRMAR IGNICIÓN
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    SENTINEL-X ACTIVE
                </div>
                <div>TII THRESHOLD: 0.85</div>
            </div>
        </div>
    );
}
