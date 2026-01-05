'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Shield, Zap, Globe, Database, CreditCard } from 'lucide-react';

export const TelemetryDashboard = () => {
    const [stats, setStats] = useState({
        auctionLatency: '2ms',
        trafficPriority: 'Platinum (High)',
        edgeNodes: 312,
        threatIndex: 12,
        philanthropyBalance: '$12,450',
        activeShards: 8,
        migrationsDone: 1450
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                ...prev,
                auctionLatency: `${Math.floor(Math.random() * 5) + 1}ms`,
                threatIndex: Math.floor(Math.random() * 20) + 5
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const cards = [
        { label: 'Auction Latency', value: stats.auctionLatency, icon: <Zap className="text-cyan-400" />, sub: '< 10ms SLA' },
        { label: 'Priority Traffic', value: stats.trafficPriority, icon: <Globe className="text-blue-400" />, sub: 'Global Routing' },
        { label: 'Threat Index (TII)', value: stats.threatIndex, icon: <Shield className="text-emerald-400" />, sub: 'Sentinel-X Active' },
        { label: 'Philanthropy', value: stats.philanthropyBalance, icon: <CreditCard className="text-purple-400" />, sub: '3% Gross Profit' },
        { label: 'Edge Shards', value: stats.activeShards, icon: <Database className="text-amber-400" />, sub: 'Intent-Sharding' },
        { label: 'Migrations', value: stats.migrationsDone, icon: <Activity className="text-rose-400" />, sub: 'Zero-Downtime' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {cards.map((card, idx) => (
                <div key={idx} className="glass-panel p-6 border border-white/10 rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        {card.icon}
                    </div>
                    <p className="text-gray-400 text-sm font-medium tracking-wider uppercase">{card.label}</p>
                    <h3 className="text-3xl font-bold text-white mt-2 font-mono tracking-tighter">
                        {card.value}
                    </h3>
                    <div className="flex items-center mt-4 text-xs font-mono text-cyan-400/80">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-2"></span>
                        {card.sub}
                    </div>

                    {/* Background Animation Element */}
                    <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-cyan-500/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-colors"></div>
                </div>
            ))}
        </div>
    );
};
