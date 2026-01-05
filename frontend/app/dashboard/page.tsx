"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Package, MessageSquare, CreditCard, LogOut, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const stats = [
        { label: 'Mis Publicaciones', value: '1', icon: Package, color: 'text-blue-400' },
        { label: 'Chats Activos', value: '3', icon: MessageSquare, color: 'text-[#39FF14]' },
        { label: 'Ventas', value: '0', icon: CreditCard, color: 'text-purple-400' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <aside className="w-[300px] border-r border-white/5 flex flex-col p-8 bg-[#0A0A0A]">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#39FF14] to-blue-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <p className="font-bold text-sm">Socio Admin</p>
                        <p className="text-[10px] text-gray-500 font-mono">PLAN VIP PLATINUM</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { label: 'Visión General', icon: Zap, active: true },
                        { label: 'Mis Autos', icon: Package },
                        { label: 'Mensajes', icon: MessageSquare },
                        { label: 'Pagos / Wallet', icon: CreditCard },
                        { label: 'Configuración', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                item.active ? "bg-white/10 text-white border border-white/10" : "text-gray-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button className="mt-auto flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/5 transition-all">
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Bienvenido de nuevo, <span className="text-[#39FF14]">Socio.</span></h2>
                        <p className="text-gray-500 text-sm mt-1">Aquí está el rendimiento de tu inventario cuántico.</p>
                    </div>
                    <div className="bg-[#39FF14]/10 border border-[#39FF14]/20 px-4 py-2 rounded-xl flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#39FF14]" />
                        <span className="text-xs font-bold text-[#39FF14]">ESTADO: ONLINE</span>
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-6 mb-12">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-[#111] border border-white/5 p-8 rounded-[2rem] hover:border-white/10 transition-all">
                            <div className={cn("p-3 rounded-2xl bg-white/5 w-fit mb-4", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <p className="text-3xl font-black mb-1">{stat.value}</p>
                            <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <section>
                    <h3 className="text-xl font-bold mb-6">Actividad Reciente</h3>
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-8 text-center">
                        <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">No hay transacciones recientes. ¡Empieza a vender hoy!</p>
                        <button onClick={() => window.location.href = '/sell'} className="mt-6 px-8 py-3 bg-[#39FF14] text-black font-black rounded-xl hover:scale-105 transition-all">PUBLICAR AUTO</button>
                    </div>
                </section>
            </main>
        </div>
    );
}
