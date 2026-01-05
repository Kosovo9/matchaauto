"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Camera, CheckCircle, Loader2, Play, AlertCircle } from 'lucide-react';
import { backendClient } from '@/lib/backend-client';

export default function QuantumStressTest() {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [result, setResult] = useState<any>(null);

    const STRESS_IMAGE_URL = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200"; // Porsche 911

    const runStressTest = async () => {
        setStatus('LOADING');
        setResult(null);

        try {
            console.log("🔥 Iniciando Prueba de Estrés: AI Vision + ALPR...");
            const response = await backendClient.post('/api/ai/analyze-auto', {
                imageUrl: STRESS_IMAGE_URL
            });

            if (response.data.success) {
                setResult(response.data.data);
                setStatus('SUCCESS');
            } else {
                setStatus('ERROR');
            }
        } catch (error) {
            console.error("Stress Test Failed:", error);
            setStatus('ERROR');
        }
    };

    return (
        <section className="py-24 bg-[#050505] relative overflow-hidden ring-1 ring-[#39FF14]/20 mx-6 rounded-[4rem] my-12 border border-[#39FF14]/10 shadow-[0_0_100px_rgba(57,255,20,0.05)]">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-64 h-64 text-[#39FF14]" />
            </div>

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-20 items-center">

                    {/* INFO SIDE */}
                    <div className="flex-1">
                        <span className="text-[#39FF14] font-mono text-xs tracking-[0.4em] uppercase mb-4 block">Engine Validation</span>
                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
                            Prueba de <br />
                            Estreś Cuántica.
                        </h2>
                        <p className="text-gray-500 text-lg mb-12 max-w-lg leading-relaxed">
                            Ejecuta una validación en tiempo real del orquestador de IA. Simularemos la subida de un auto de alta gama para verificar la detección de placas (ALPR), marca, modelo y generación de metadatos virales.
                        </p>

                        <button
                            onClick={runStressTest}
                            disabled={status === 'LOADING'}
                            className="group relative px-10 py-6 bg-[#39FF14] text-black font-black rounded-2xl text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(57,255,20,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center gap-3">
                                {status === 'LOADING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                DETONAR VALIDACIÓN IA
                            </span>
                        </button>
                    </div>

                    {/* CONSOLE SIDE */}
                    <div className="flex-1 w-full lg:w-auto">
                        <div className="bg-black border border-white/10 rounded-[3rem] p-8 min-h-[400px] relative overflow-hidden shadow-2xl">
                            {/* HEADER CONSOLA */}
                            <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="ml-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Quantum Engine Feedback</span>
                            </div>

                            <AnimatePresence mode="wait">
                                {status === 'IDLE' && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center h-[250px] text-gray-700 font-mono text-xs uppercase text-center"
                                    >
                                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                                        Sistema en espera...<br />Listo para el diagnóstico.
                                    </motion.div>
                                )}

                                {status === 'LOADING' && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="space-y-4 font-mono text-[10px]"
                                    >
                                        <p className="text-[#39FF14] animate-pulse">{">"} CONECTANDO CON GEMINI 1.5 FLASH...</p>
                                        <p className="text-white opacity-50">{">"} ESCANEANDO ESTRUCTURA DE PÍXELES...</p>
                                        <p className="text-white opacity-50">{">"} ANALIZANDO PATRONES DE PLACA (ALPR)...</p>
                                        <p className="text-white opacity-20">{">"} SINCRONIZANDO CON SUPABASE CLUE...</p>
                                    </motion.div>
                                )}

                                {status === 'SUCCESS' && result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-3 text-[#39FF14] text-xs font-black uppercase">
                                            <CheckCircle className="w-5 h-5" /> 1000% FUNCIONAL
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[8px] text-gray-500 font-mono uppercase mb-1">Make/Model</p>
                                                <p className="text-white font-black text-sm">{result.make} {result.model}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[8px] text-gray-500 font-mono uppercase mb-1">Plate Detection</p>
                                                <p className="text-[#39FF14] font-black text-sm">{result.plateNumber || "DETECTOR OK (NO PLATE)"}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[#39FF14]/5 rounded-2xl border border-[#39FF14]/20">
                                            <p className="text-[8px] text-[#39FF14] font-mono uppercase mb-1">AI Insights</p>
                                            <p className="text-gray-400 text-[10px] leading-relaxed italic">
                                                {result.features?.join(", ")}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {status === 'ERROR' && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center h-[250px] text-red-500 font-mono text-xs uppercase text-center"
                                    >
                                        <AlertCircle className="w-12 h-12 mb-4 animate-bounce" />
                                        Error de Conexión Cuántica.<br />Revisa tus API Keys.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
