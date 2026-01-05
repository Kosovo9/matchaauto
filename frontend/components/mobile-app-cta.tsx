"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, QrCode, ShieldCheck, Zap, Laptop, ArrowRight } from 'lucide-react';

export default function QuantumAppSection() {
    const [qrValue, setQrValue] = useState("https://matchaauto.netlify.app");

    return (
        <section id="download-app" className="py-24 bg-black relative overflow-hidden ring-1 ring-white/5 mx-6 rounded-[4rem] my-12">
            {/* AMBIENT EFFECTS */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* LEFT: TEXT & CTAs */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="text-[#39FF14] font-mono text-xs tracking-[0.4em] uppercase mb-4 block">Mobile Infrastructure</span>
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-[1.1]">
                                El Imperio en <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 text-5xl md:text-6xl">Tu Bolsillo.</span>
                            </h2>
                            <p className="text-gray-500 text-xl leading-relaxed mb-12 max-w-xl">
                                Descarga la App de Match-Auto. Notificaciones nativas, escaneo IA instantáneo y seguridad presidencial en cualquier dispositivo iOS o Android. Sin intermediarios.
                            </p>

                            <div className="flex flex-wrap gap-6 mb-12">
                                <button className="px-8 py-5 rounded-2xl bg-white text-black font-black flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                    <Download className="w-5 h-5" /> DESCARGAR PWA
                                </button>
                                <button className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black flex items-center gap-3 hover:bg-white/10 transition-all">
                                    <Smartphone className="w-5 h-5" /> PLAY STORE <span className="text-[10px] text-gray-600 font-mono">(PRÓXIMAMENTE)</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-8 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#39FF14]" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">Verified Security</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Laptop className="w-4 h-4 text-[#39FF14]" />
                                    <span className="text-[10px] font-bold tracking-widest uppercase">Cross-Platform 10x</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT: QR & MOCKUP */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative flex justify-center lg:justify-end"
                    >
                        <div className="relative p-12 bg-[#0A0A0A] border border-white/10 rounded-[4rem] shadow-2xl overflow-hidden group">
                            {/* QR CODE CONTAINER */}
                            <div className="relative z-10 bg-white p-6 rounded-[2.5rem] shadow-[0_0_50px_rgba(57,255,20,0.1)] group-hover:scale-105 transition-transform">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrValue)}&color=000000&bgcolor=FFFFFF`}
                                    alt="Download Match-Auto App"
                                    className="w-[200px] h-[200px] md:w-[250px] md:h-[250px]"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black tracking-tighter flex items-center gap-2 shadow-2xl border border-[#39FF14]/50">
                                        <Zap className="w-3 h-3" /> SCAN TO INSTALL
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 text-center space-y-2">
                                <p className="text-white font-black tracking-tight text-lg uppercase">Escanea con tu Cámara</p>
                                <p className="text-gray-600 text-[10px] font-mono tracking-widest">V.1.0.0-QUANTUM-STABLE</p>
                            </div>

                            {/* FLASH EFFECT */}
                            <div className="absolute top-[-50%] right-[-50%] w-[150%] h-[150%] bg-gradient-to-br from-[#39FF14]/5 to-transparent rotate-45 pointer-events-none" />
                        </div>

                        {/* FLOATING DECORATIONS */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#39FF14]/10 rounded-full blur-2xl border border-[#39FF14]/20 animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl border border-blue-500/20 animate-pulse" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
