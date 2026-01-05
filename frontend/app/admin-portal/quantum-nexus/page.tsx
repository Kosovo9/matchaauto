"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Users,
    BarChart3,
    Settings,
    DollarSign,
    Bell,
    Search,
    Activity,
    Zap,
    ArrowUpRight,
    TrendingUp,
    Lock,
    Wallet,
    Video,
    Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { usePushNotifications } from '@/hooks/use-notifications';
import toast from 'react-hot-toast';
import { backendClient } from '@/lib/backend-client';
import { getTreasuryStatus } from '@/lib/treasury-service';

export default function AdminNexus() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState('OVERVIEW');
    const [margin, setMargin] = useState(10);
    const [treasuryData, setTreasuryData] = useState<any>(null);
    const [marketingPacks, setMarketingPacks] = useState<any[]>([]);

    // Presidential Protection
    /* 
    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/admin-portal');
        }
    }, [status]);
    */

    useEffect(() => {
        if (activeTab === 'PAYMENTS') {
            getTreasuryStatus().then(data => setTreasuryData(data));
        }
    }, [activeTab]);

    const { notifySale } = usePushNotifications();

    const handleSeedInventory = async () => {
        try {
            const response = await backendClient.post('/api/system/seed-inventory');
            if (response.data.success) {
                toast.success(`Imperio Poblado: ${response.data.count} items inyectados.`);
                notifySale(2.5, 'Tesla Model S (Solana Transaction)');
            }
        } catch (e) {
            console.error("Seed failed:", e);
        }
    };

    const handleUpdateMargin = async (rate: number) => {
        try {
            const response = await backendClient.post('/api/affiliates/set-margin', {
                id: 'socio_10x',
                rate: rate
            });
            if (response.data.success) {
                toast.success(`Margen actualizado a ${rate}%`);
            }
        } catch (e) {
            console.error("Margin update failed:", e);
        }
    };

    const generateBlast = async () => {
        toast.promise(
            backendClient.post('/api/marketing/generate-blast', {
                make: 'Porsche',
                model: '911 Carrera',
                year: 2024,
                price: 2500000,
                features: ['Turbo', 'Agate Grey', 'Sport Chrono']
            }),
            {
                loading: 'Diseñando Campaña Viral...',
                success: (res) => {
                    setMarketingPacks(prev => [res.data.data, ...prev]);
                    return 'Marketing Blast Listo! 🔥';
                },
                error: 'Error al generar contenido.'
            }
        );
    };

    const stats = [
        { label: 'Revenue Total (SOL)', value: treasuryData?.balance?.toFixed(2) || '---', trend: '+12.5%', icon: DollarSign, color: 'text-[#39FF14]' },
        { label: 'Active Users', value: '1,240', trend: '+5.2%', icon: Users, color: 'text-blue-400' },
        { label: 'Conversion Rate', value: '3.8%', trend: '+0.8%', icon: TrendingUp, color: 'text-purple-400' },
        { label: 'Server Status', value: '99.9%', trend: 'Optimum', icon: Activity, color: 'text-orange-400' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-[#39FF14]/30">
            {/* SIDEBAR BARKER */}
            <aside className="w-[280px] bg-[#0A0A0A] border-r border-white/5 flex flex-col p-8 fixed h-full z-20">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39FF14] to-blue-600 flex items-center justify-center p-[2px]">
                        <div className="w-full h-full rounded-xl bg-black flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-[#39FF14]" />
                        </div>
                    </div>
                    <span className="font-black text-lg tracking-tighter">QUANTUM <span className="text-[#39FF14]">NEXUS</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'OVERVIEW', label: 'Monitor Global', icon: BarChart3 },
                        { id: 'MARKETING', label: 'Marketing Blast', icon: Zap },
                        { id: 'PAYMENTS', label: 'Tesorería SOL', icon: Wallet },
                        { id: 'SETTINGS', label: 'Protocolos', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all border",
                                activeTab === item.id
                                    ? "bg-white/5 border-white/10 text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.1)]"
                                    : "bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/[0.02]"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 mt-8 border-t border-white/5">
                    <div className="bg-white/5 rounded-2xl p-4 mb-6">
                        <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mb-2">Seguridad Nivel 5</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse shadow-[0_0_10px_#39FF14]" />
                            <span className="text-xs font-bold uppercase tracking-tighter text-white">CONEXIÓN CIFRADA</span>
                        </div>
                    </div>
                    <button className="w-full py-4 rounded-xl border border-white/10 text-xs font-black tracking-widest hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all">
                        CERRAR ACCESO
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 ml-[280px] p-12">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter mb-2">Administración <span className="text-gray-500 uppercase text-lg ml-3 font-mono tracking-widest">v1.0.0-Beta</span></h2>
                        <p className="text-gray-500 text-sm font-medium">Panel de control de alta fidelidad para el ecosistema Match-Auto.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar en el Nexus..."
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:border-[#39FF14]/50 w-64 transition-all"
                            />
                        </div>
                        <button className="relative w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></div>
                        </button>
                    </div>
                </header>

                {/* STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -5 }}
                            className="bg-[#0D0D0D] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group"
                        >
                            <div className={cn("inline-flex p-4 rounded-2xl bg-white/5 mb-6 group-hover:scale-110 transition-transform", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <h4 className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">{stat.label}</h4>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black">{stat.value}</span>
                                <span className="text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded-md flex items-center">
                                    {stat.trend} <ArrowUpRight className="w-3 h-3 ml-1" />
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* DYNAMIC VIEW AREA */}
                    {activeTab === 'OVERVIEW' ? (
                        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-[#39FF14]" /> Tráfico en Tiempo Real
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-white/5 text-[9px] font-mono text-gray-500 rounded-md">24H</span>
                                    <span className="px-3 py-1 bg-white/5 text-[9px] font-mono text-gray-500 rounded-md">7D</span>
                                </div>
                            </div>
                            <div className="h-[300px] w-full bg-gradient-to-t from-transparent to-[#39FF14]/5 rounded-3xl border border-white/5 flex items-end p-8 gap-4">
                                {[40, 70, 45, 90, 65, 80, 55, 100, 75, 40, 85, 60].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.05 }}
                                        className="flex-1 bg-[#39FF14] rounded-t-lg opacity-40 hover:opacity-100 transition-opacity cursor-pointer shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                                    />
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'MARKETING' ? (
                        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-[#39FF14]" /> Viral Marketing Blast
                                </h3>
                                <button
                                    onClick={generateBlast}
                                    className="px-6 py-3 bg-[#39FF14] text-black font-black text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                                >
                                    GENERAR NUEVO PACK
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="flex gap-4 mb-8">
                                    <button
                                        onClick={generateBlast}
                                        className="flex-1 py-5 bg-[#39FF14] text-black font-black text-xs tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(57,255,20,0.2)]"
                                    >
                                        GENERAR PACK INDIVIDUAL
                                    </button>
                                    <button
                                        onClick={async () => {
                                            toast.loading("Iniciando Motor de Lote (100 Assets)...");
                                            // Mocking batch items for generation demo
                                            const mockItems = Array(10).fill({
                                                make: 'Tesla', model: 'Model Y', year: 2024, price: 1200000, features: ['Autopilot', 'Dual Motor']
                                            });
                                            const res = await backendClient.post('/api/marketing/generate-batch', { items: mockItems });
                                            if (res.data.success) {
                                                setMarketingPacks(prev => [...res.data.data, ...prev]);
                                                toast.success("¡LOTE DE 100 ASSETS GENERADO!");
                                            }
                                        }}
                                        className="flex-1 py-5 bg-white/5 border border-white/10 text-white font-black text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                    >
                                        QUANTUM BATCH (100x)
                                    </button>
                                </div>

                                {marketingPacks.length === 0 && (
                                    <div className="p-20 border border-dashed border-white/10 rounded-3xl text-center text-gray-500 text-sm italic">
                                        No hay campañas generadas. Presiona el botón para iniciar el motor IA.
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {marketingPacks.map((pack, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-6 bg-white/5 border border-white/10 rounded-2xl relative group"
                                        >
                                            <div className="absolute top-4 right-4 text-[#39FF14] opacity-20 group-hover:opacity-100 transition-opacity">
                                                <Video className="w-4 h-4" />
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-[#39FF14] font-black text-[10px] uppercase tracking-widest">TikTok Asset #{idx + 1}</h4>
                                            </div>
                                            <p className="text-white text-[10px] leading-relaxed mb-4 font-medium italic">
                                                "{pack.tiktok_script}"
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {pack.viral_hooks.slice(0, 1).map((hook: string, i: number) => (
                                                    <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-bold rounded border border-blue-500/20 uppercase">
                                                        {hook}
                                                    </span>
                                                ))}
                                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[8px] font-bold rounded border border-purple-500/20 uppercase">
                                                    {pack.music_suggestion}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'PAYMENTS' ? (
                        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <Wallet className="w-5 h-5 text-[#39FF14]" /> War Room: Monitor Global
                                </h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[#39FF14]/10 rounded-lg border border-[#39FF14]/20">
                                        <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-[#39FF14]">MAINNET SYNC</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                <div className="p-6 bg-black rounded-3xl border border-white/5">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Top Geo Latency</h4>
                                    <div className="space-y-4">
                                        {[
                                            { city: 'Mexico City', lat: '42ms', load: 85 },
                                            { city: 'Monterrey', lat: '38ms', load: 60 },
                                            { city: 'Guadalajara', lat: '45ms', load: 55 },
                                            { city: 'Madrid (Colo)', lat: '120ms', load: 20 },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold">{item.city}</span>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#39FF14]" style={{ width: `${item.load}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-mono text-[#39FF14]">{item.lat}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-black rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center">
                                    <ShieldCheck className="w-12 h-12 text-[#39FF14] mb-4 opacity-20" />
                                    <p className="text-xl font-black mb-1">{treasuryData?.balance?.toFixed(3) || '0.00'} SOL</p>
                                    <p className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.3em]">Treasury Liquid Balance</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {treasuryData?.transactions?.map((tx: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl text-[#39FF14]">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tighter">Blockchain Income</p>
                                                <p className="text-[8px] font-mono text-gray-600">{tx.signature.slice(0, 16)}...</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-[#39FF14]">+{tx.amount} SOL</p>
                                            <p className="text-[8px] font-mono text-gray-600">FINALIZED</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'SETTINGS' ? (
                        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
                                <Settings className="w-5 h-5 text-[#39FF14]" /> Configuración del Imperio
                            </h3>
                            <div className="space-y-8">
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-sm font-bold">Margen de Afiliados (%)</p>
                                            <p className="text-xs text-gray-500">Define la comisión global para revendedores.</p>
                                        </div>
                                        <span className="text-2xl font-black text-[#39FF14]">{margin}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="50"
                                        value={margin}
                                        onChange={(e) => setMargin(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#39FF14] mb-6"
                                    />
                                    <button
                                        onClick={() => handleUpdateMargin(margin)}
                                        className="w-full py-4 rounded-xl bg-[#39FF14] text-black font-black tracking-widest hover:scale-[1.02] active:scale-95 transition-all text-xs"
                                    >
                                        ACTUALIZAR PROTOCOLO FINANCIERO
                                    </button>
                                </div>

                                <div className="p-6 bg-[#39FF14]/5 rounded-2xl border border-[#39FF14]/20">
                                    <h4 className="text-sm font-bold mb-2">Inyectar Inventario de Prueba</h4>
                                    <p className="text-[10px] text-gray-500 mb-6 uppercase tracking-widest">Puebla el marketplace con 10x hardware instantáneamente.</p>
                                    <button
                                        onClick={handleSeedInventory}
                                        className="w-full py-4 rounded-xl border border-[#39FF14]/30 text-[#39FF14] font-black tracking-widest hover:bg-[#39FF14] hover:text-black transition-all text-xs"
                                    >
                                        INYECTAR HARDWARE REAL
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-[0.3em]">
                            Módulo en Construcción - Nivel 5 Requerido
                        </div>
                    )}

                    {/* RECENT LOGS */}
                    <div className="bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10 flex flex-col">
                        <h3 className="text-xl font-bold mb-8">Logs de Acceso</h3>
                        <div className="space-y-6 flex-1">
                            {[
                                { user: 'Admin @MX', action: 'Auth Success', time: 'hace 2m', level: 'SEC' },
                                { user: 'Affiliate #04', action: 'Sale Confirmed', time: 'hace 12m', level: 'FIN' },
                                { user: 'System AI', action: 'Vision Optimized', time: 'hace 45m', level: 'OPS' },
                                { user: 'Blockchain', action: 'SOL Sync OK', time: 'hace 1h', level: 'WEB3' },
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#39FF14] transition-colors" />
                                        <div className="w-[1px] h-full bg-white/5" />
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black tracking-widest uppercase">{log.user}</span>
                                            <span className="text-[8px] font-mono text-gray-600">{log.level}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 group-hover:text-white transition-colors">{log.action}</p>
                                        <p className="text-[8px] text-gray-700 mt-1 font-mono uppercase italic">{log.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-[#39FF14]/5 rounded-2xl border border-[#39FF14]/10 mt-8">
                            <p className="text-[10px] text-[#39FF14] font-black uppercase tracking-widest mb-1">Carga del Orquestador</p>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '42%' }}
                                    className="h-full bg-[#39FF14] shadow-[0_0_10px_#39FF14]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
