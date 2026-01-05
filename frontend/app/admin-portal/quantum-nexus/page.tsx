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
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AdminNexus() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState('OVERVIEW');

    // Presidential Protection
    /* 
    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/admin-portal');
        }
    }, [status]);
    */

    const handleSeedInventory = async () => {
        try {
            const response = await backendClient.post('/api/system/seed-inventory');
            if (response.data.success) {
                alert(`✅ Imperio Poblado: ${response.data.count} items inyectados.`);
            }
        } catch (e) {
            console.error("Seed failed:", e);
        }
    };

    const stats = [
        { label: 'Revenue Total', value: '$84,200', trend: '+12.5%', icon: DollarSign, color: 'text-[#39FF14]' },
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
                        { id: 'USERS', label: 'Gestión Usuarios', icon: Users },
                        { id: 'PAYMENTS', label: 'Finanzas Edge', icon: DollarSign },
                        { id: 'SYSTEM', label: 'Estado Sistema', icon: Activity },
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

                    <div className="pt-8 opacity-50">
                        <button
                            onClick={handleSeedInventory}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest bg-white/5 border border-dashed border-white/20 hover:border-[#39FF14] hover:text-[#39FF14] transition-all"
                        >
                            <Zap className="w-3 h-3" /> INYECTAR INVENTARIO
                        </button>
                    </div>
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">AD</div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black truncate">ADMIN MATCHAUTO</p>
                            <p className="text-[8px] text-gray-500 font-mono">SEC-LEVEL: 5</p>
                        </div>
                        <Lock className="w-3 h-3 text-gray-600" />
                    </div>
                </div>
            </aside>

            {/* MAIN PORTAL AREA */}
            <main className="flex-1 ml-[280px] p-12">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">Monitor <span className="text-[#39FF14]">Presidencial</span></h2>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
                            PROTOCOLO DE SEGURIDAD ALPHA ACTIVO
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
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
                    {/* CHARTS / ACTIVITY */}
                    <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <Zap className="w-5 h-5 text-[#39FF14]" /> Tráfico en Tiempo Real
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

                    {/* RECENT LOGS */}
                    <div className="bg-[#0D0D0D] border border-white/5 rounded-[3rem] p-10 flex flex-col">
                        <h3 className="text-xl font-bold mb-8">Logs de Acceso</h3>
                        <div className="space-y-6 flex-1">
                            {[
                                { user: 'Admin @MX', action: 'Auth Success', time: 'hace 2m', level: 'SEC' },
                                { user: 'Affiliate #04', action: 'Sale Confirmed', time: 'hace 12m', level: 'FIN' },
                                { user: 'System Bot', action: 'Database Optimized', time: 'hace 45m', level: 'SYS' },
                                { user: 'Unknown IP', action: 'Login Blocked', time: 'hace 1h', level: 'WAR', alert: true },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        log.alert ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-gray-700"
                                    )}></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold">{log.user}</p>
                                        <p className="text-[10px] text-gray-500">{log.action}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-mono text-gray-600">{log.time}</p>
                                        <p className="text-[8px] font-black text-[#39FF14] tracking-widest">{log.level}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest hover:bg-white/10 transition-all">
                            VER TODOS LOS EVENTOS
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
