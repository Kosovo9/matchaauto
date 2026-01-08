"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Shield, Globe, Zap, Users,
    TrendingUp, AlertTriangle, CheckCircle,
    ZapOff, Lock, Unlock, Database
} from 'lucide-react';

// --- MOCK DATA FOR THE DEMO ---
const INITIAL_STATS = [
    { label: 'Active Users', value: 12450, change: '+12%', icon: Users, color: 'text-blue-400' },
    { label: 'Global Revenue', value: '$842,500', change: '+5.4%', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Titan Engines', value: '100%', change: 'Optimal', icon: Zap, color: 'text-yellow-400' },
    { label: 'Security Status', value: 'Level 5', change: 'Sentinel X', icon: Shield, color: 'text-purple-400' },
];

export const MissionControlDashboard: React.FC = () => {
    const [stats, setStats] = useState(INITIAL_STATS);
    const [activePhase, setActivePhase] = useState(0);
    const [isAILocking, setIsAILocking] = useState(false);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => prev.map(stat => ({
                ...stat,
                value: typeof stat.value === 'number'
                    ? stat.value + Math.floor(Math.random() * 10)
                    : stat.value
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const phases = [
        { name: 'Core Infrastructure', status: 'COMPLETED', progress: 100 },
        { name: 'Titan Suite Integration', status: 'RUNNING', progress: 78 },
        { name: 'Global Marketplace Synch', status: 'PENDING', progress: 0 },
        { name: 'World Assets Exchange Launch', status: 'LOCKED', progress: 0 },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-purple-500/30">
            {/* Header with Glassmorphism */}
            <header className="flex justify-between items-center mb-12 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-2xl">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-gray-400 to-gray-600 bg-clip-text text-transparent italic">
                        MISSION CONTROL
                    </h1>
                    <p className="text-gray-500 text-xs font-bold tracking-[0.3em] uppercase mt-1">
                        Match-Auto 1000x Ecosystem • Central Command
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAILocking(!isAILocking)}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all border ${isAILocking ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                        {isAILocking ? <ZapOff className="inline w-3 h-3 mr-2" /> : <Zap className="inline w-3 h-3 mr-2" />}
                        {isAILocking ? 'SYS_LOCKDOWN' : 'ACTIVATE_AI_OVERDRIVE'}
                    </button>
                    <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live: Mexico Edge</span>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-colors cursor-default"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.change}</span>
                        </div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-3xl font-black tracking-tight">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Deployment Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Database className="w-32 h-32" />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-400" /> DEPLOYMENT SEQUENCE
                        </h2>

                        <div className="space-y-8">
                            {phases.map((phase, i) => (
                                <div key={i} className="relative pl-8 border-l-2 border-white/10">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-black ${phase.status === 'COMPLETED' ? 'bg-green-500' :
                                            phase.status === 'RUNNING' ? 'bg-indigo-500 animate-pulse' :
                                                'bg-gray-800'
                                        }`} />
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className={`text-sm font-bold tracking-tight ${phase.status === 'LOCKED' ? 'text-gray-600' : 'text-white'}`}>
                                            {phase.name}
                                        </h4>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${phase.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                                                phase.status === 'RUNNING' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    'bg-white/5 text-gray-500'
                                            }`}>
                                            {phase.status}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${phase.progress}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full ${phase.status === 'COMPLETED' ? 'bg-green-500' : 'bg-indigo-500'}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sentinel X Monitor */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 p-8 rounded-[40px]">
                        <h2 className="text-xl font-black tracking-tighter mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" /> SENTINEL X LIVE
                        </h2>
                        <div className="space-y-4">
                            {[
                                { event: 'Escrow Lock - House MX', time: '2m ago', risk: 'Low' },
                                { event: 'ID Verif - User 992', time: '5m ago', risk: 'Safe' },
                                { event: 'Large Trans - $50k', time: '12m ago', risk: 'Verified' },
                                { event: 'Neural Filter Block', time: '24m ago', risk: 'Flagged' },
                            ].map((event, i) => (
                                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-black/40 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-3.5 h-3.5 text-purple-400 opacity-50" />
                                        <div>
                                            <p className="text-[11px] font-bold text-gray-200">{event.event}</p>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">{event.time}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-green-400">{event.risk}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-3 bg-white text-black font-black text-xs rounded-2xl hover:scale-105 active:scale-95 transition-all">
                            OPEN SECURITY CONSOLE
                        </button>
                    </div>

                    {/* Quick Launch Control */}
                    <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[40px]">
                        <h2 className="text-lg font-black tracking-tighter mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-orange-400" /> SYSTEM HEARTBEAT
                        </h2>
                        <div className="flex gap-2 mb-6">
                            {[...Array(24)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-full h-8 rounded-sm ${i % 3 === 0 ? 'bg-orange-500/40' : 'bg-orange-500/20'}`}
                                />
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Syncing with Global Marketplace backend...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
