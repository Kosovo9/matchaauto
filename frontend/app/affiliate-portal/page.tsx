"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Link as LinkIcon,
    DollarSign,
    Gift,
    TrendingUp,
    Zap,
    Copy,
    CheckCircle2,
    Globe,
    Rocket,
    BarChart3
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AffiliateNexus() {
    const [referralLink, setReferralLink] = useState('https://matchauto.mx/ref/socio_10x');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stats = [
        { label: 'Clics Totales', value: '4,821', icon: Globe, color: 'text-blue-400' },
        { label: 'Conversiones', value: '154', icon: Rocket, color: 'text-[#39FF14]' },
        { label: 'Comisiones (MXN)', value: '$12,450', icon: DollarSign, color: 'text-yellow-400' },
        { label: 'Nivel Socio', value: 'Platino', icon: Zap, color: 'text-purple-400' },
    ];

    return (
        <div className="min-h-screen bg-[#020202] text-white">
            <header className="px-6 py-12 border-b border-white/5 bg-[#050505] shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 p-[2px]">
                            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                                <Gift className="w-7 h-7 text-yellow-500" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter">Affiliate <span className="text-yellow-500">Nexus</span></h1>
                            <p className="text-xs font-mono text-gray-500">PROGRAMA DE REVENDEDORES ÉLITE</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-lg w-full">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] text-gray-500 font-bold mb-1 ml-1">TU LINK DE SOCIO 10X</p>
                                <div className="text-sm font-mono text-white truncate">{referralLink}</div>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2",
                                    copied ? "bg-[#39FF14] text-black" : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'COPIADO' : 'COPIAR'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.02] transition-all">
                            <div className={cn("p-3 rounded-2xl bg-white/5 w-fit mb-6", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black">{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEADERBOARD */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-yellow-500" /> Top Socios del Mes
                        </h3>
                        <div className="space-y-6">
                            {[
                                { name: 'Juan C.', sales: 42, earnings: '$84,000', rank: 1 },
                                { name: 'Empuje MX', sales: 38, earnings: '$76,000', rank: 2 },
                                { name: 'Socio_Master', sales: 31, earnings: '$62,000', rank: 3 },
                            ].map((s, idx) => (
                                <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all cursor-default">
                                    <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-xs">#{s.rank}</div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">{s.name}</p>
                                        <p className="text-[10px] text-gray-500">{s.sales} Ventas referidas</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-yellow-500">{s.earnings}</p>
                                        <p className="text-[9px] text-gray-600 font-mono">GANANCIA</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CAMPAINGS */}
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 flex flex-col">
                        <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-blue-500" /> Material de Campaña
                        </h3>
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center hover:bg-white/10 transition-all pointer-events-auto cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <p className="text-xs font-bold mb-1">Banners 10x</p>
                                <p className="text-[10px] text-gray-500">Optimizado para Ads</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col justify-center items-center text-center hover:bg-white/10 transition-all pointer-events-auto cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Globe className="w-6 h-6 text-[#39FF14]" />
                                </div>
                                <p className="text-xs font-bold mb-1">Social Assets</p>
                                <p className="text-[10px] text-gray-500">Instagram / TikTok</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-600 text-center mt-6 font-mono uppercase tracking-[0.2em]">Soporte para Socios: socios@matchauto.mx</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
