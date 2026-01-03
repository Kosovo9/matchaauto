'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, PieChart, Landmark, Zap, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PassiveIncomeDashboard = () => {
    const [revenue, setRevenue] = useState(125430.75);
    const [isCrawling, setIsCrawling] = useState(false);

    const triggerCrawl = async () => {
        setIsCrawling(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/secret/crawl`, { method: 'POST' });
            // Simular aumento de revenue tras crawl exitoso
            setTimeout(() => {
                setRevenue(prev => prev + 540.25);
                setIsCrawling(false);
            }, 3000);
        } catch (err) {
            setIsCrawling(false);
        }
    };

    return (
        <div className="bg-black border border-nasa-blue p-8 rounded-[2.5rem] shadow-3xl shadow-nasa-blue/10">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter">IMPERIO DASHBOARD</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Flujo de Ingresos Pasivos Match-Auto</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="nasa"
                        className="h-14 px-8 font-black flex gap-2"
                        onClick={triggerCrawl}
                        disabled={isCrawling}
                    >
                        {isCrawling ? <Zap className="animate-spin" /> : <TrendingUp size={20} />}
                        {isCrawling ? 'RASTREANDO EL MUNDO...' : 'EJECUTAR CRAWL GLOBAL'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-nasa-blue/5 border border-nasa-blue/20 p-8 rounded-3xl group hover:bg-nasa-blue/10 transition-all cursor-crosshair">
                    <div className="flex justify-between items-center mb-4">
                        <DollarSign className="text-nasa-blue" size={24} />
                        <span className="text-xs text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded-full">+12.4%</span>
                    </div>
                    <div className="text-5xl font-black text-white tabular-nums">${revenue.toLocaleString()}</div>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Revenue Total (Escrow + Ads)</p>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 p-8 rounded-3xl group hover:bg-purple-500/10 transition-all cursor-crosshair">
                    <div className="flex justify-between items-center mb-4">
                        <PieChart className="text-purple-500" size={24} />
                        <span className="text-xs text-purple-500 font-bold px-2 py-1 bg-purple-500/10 rounded-full">Automático</span>
                    </div>
                    <div className="text-5xl font-black text-white tabular-nums">482,450</div>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Listings Indexados por AI</p>
                </div>

                <div className="bg-nasa-red/5 border border-nasa-red/20 p-8 rounded-3xl group hover:bg-nasa-red/10 transition-all cursor-crosshair">
                    <div className="flex justify-between items-center mb-4">
                        <Landmark className="text-nasa-red" size={24} />
                        <ArrowUpRight className="text-nasa-red" size={20} />
                    </div>
                    <div className="text-5xl font-black text-white tabular-nums">$ 3,450.12</div>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Donación Social Acumulada (3%)</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                    <Zap className="text-nasa-blue" size={14} /> Actividad del Hyper-Crawler en Tiempo Real
                </h3>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between text-[11px] border-b border-white/5 pb-2">
                            <span className="text-gray-400 font-mono">SCAN_SOURCE: FB_MKT_NODES_{i}</span>
                            <span className="text-nasa-blue font-bold">STATUS: INDEXING_CHUNK_{i * 450}</span>
                            <span className="text-green-500">COMPLETE</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
