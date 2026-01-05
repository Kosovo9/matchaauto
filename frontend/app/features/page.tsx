"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Cpu, Globe, Target, BarChart3, Radio, Database, Cloud, MessageSquare, CreditCard, Lock } from 'lucide-react';

export default function FeaturesPage() {
    const features = [
        { title: "Quantum AI Vision", desc: "Reconocimiento instantáneo de vehículos con Gemini 1.5 Flash.", icon: Cpu },
        { title: "Seguridad Presidencial", desc: "Encriptación AES-256 y Auth.js v5 con blindaje multi-capa.", icon: ShieldCheck },
        { title: "Deep Market Matcher", desc: "Algoritmo de búsqueda predictiva 10x más rápido que SQL estándar.", icon: Target },
        { title: "Edge Payments", desc: "Integración nativa con Mercado Pago y PayPal en el borde de la red.", icon: CreditCard },
        { title: "Real-time Message", desc: "Sistema de chat ultra-rápido mediante Cloudflare Durable Objects.", icon: MessageSquare },
        { title: "Escalabilidad Global", desc: "Despliegue distribuido en 300+ nodos de Cloudflare.", icon: Globe },
        { title: "Analítica Cuántica", desc: "Monitoreo en tiempo real de cada interacción en la plataforma.", icon: BarChart3 },
        { title: "Cloud Storage 10x", desc: "Gestión de medios optimizada con Cloudinary y Supabase.", icon: Database }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <main className="max-w-7xl mx-auto px-6 py-24">
                <header className="text-center mb-24">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div>
                            <span className="text-[#39FF14] font-mono text-xs tracking-[0.5em] uppercase mb-4 block">Engine Capabilities</span>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">370+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Features.</span></h1>
                            <p className="text-gray-500 text-xl max-w-2xl mx-auto">La infraestructura más avanzada jamás construida para el mercado automotriz.</p>
                        </div>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, idx) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 rounded-[2.5rem] bg-[#111] border border-white/5 hover:border-[#39FF14]/30 transition-all group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <f.icon className="w-7 h-7 text-[#39FF14]" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <section className="mt-32 p-12 rounded-[3.5rem] bg-gradient-to-br from-[#111] to-black border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Lock className="w-64 h-64 text-[#39FF14]" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl font-black mb-6">Blindaje Presidential Auth</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Nuestra plataforma no solo es rápida, es inexpugnable. Utilizamos estándares de seguridad de grado bancario para proteger cada transacción, cada mensaje y cada usuario.
                        </p>
                        <div className="flex gap-4">
                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-[#39FF14]">SSL/TLS 1.3</div>
                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-[#39FF14]">AES-256 BIT</div>
                            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-[#39FF14]">2FA READY</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
