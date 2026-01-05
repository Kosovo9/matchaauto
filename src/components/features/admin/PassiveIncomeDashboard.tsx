'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, PieChart, Landmark, Zap, ArrowUpRight, Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PassiveIncomeDashboard = () => {
    const [revenue, setRevenue] = useState(125430.75);
    const [isCrawling, setIsCrawling] = useState(false);
    const [notification, setNotification] = useState<any>(null);

    const triggerCrawl = async (turbo: boolean = false) => {
        setIsCrawling(true);
        setNotification(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/secret/crawl`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isTurbo: turbo })
            });
            const data = await res.json();

            console.log(`Task Enqueued: ${data.taskId}`);

            // Simular delay de procesamiento masivo asíncrono
            setTimeout(async () => {
                const notifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/secret/notification`);
                const notifyData = await notifyRes.json();
                setNotification(notifyData.notification);

                setRevenue(prev => prev + (turbo ? 2500.50 : 540.25));
                setIsCrawling(false);
            }, 3000);
        } catch (err) {
            setIsCrawling(false);
        }
    };

    const secureWithdraw = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/secret/crypto/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: '8xMAut...NASA69',
                    amount: 5,
                    securityToken: 'BUNKER_SECURE_AUTH_TOKEN'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert(`✅ ÉXITO: Fondos distribuidos. TX: ${data.txId}`);
            } else {
                alert(`❌ ERROR: ${data.error}`);
            }
        } catch (err) {
            alert('Error de conexión con el búnker');
        }
    };

    return (
        <div className="bg-black border border-nasa-blue p-8 rounded-[2.5rem] shadow-3xl shadow-nasa-blue/10 relative overflow-hidden">
            {notification && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-nasa-red p-6 rounded-2xl shadow-[0_0_50px_rgba(255,0,0,0.5)] border-2 border-white animate-bounce flex items-center gap-4 max-w-md">
                    <Bell className="text-white animate-pulse" />
                    <div>
                        <p className="text-white font-black text-sm uppercase tracking-tighter">{notification.title}</p>
                        <p className="text-white text-[10px] leading-tight opacity-90">{notification.body}</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter">IMPERIO DASHBOARD v3</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">BFF Architecture & Secure Escrow Active</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        className="h-14 px-8 font-black border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                        onClick={secureWithdraw}
                    >
                        <ShieldCheck size={20} className="mr-2" /> COBRO SEGURO (BFF)
                    </Button>
                    <Button
                        variant="outline"
                        className="h-14 px-8 font-black border-nasa-red text-nasa-red hover:bg-nasa-red hover:text-white"
                        onClick={() => triggerCrawl(true)}
                        disabled={isCrawling}
                    >
                        CRAWL 1M (TURBO)
                    </Button>
                    <Button
                        variant="nasa"
                        className="h-14 px-8 font-black flex gap-2"
                        onClick={() => triggerCrawl(false)}
                        disabled={isCrawling}
                    >
                        {isCrawling ? <Zap className="animate-spin" /> : <TrendingUp size={20} />}
                        {isCrawling ? 'ENCOLANDO...' : 'CRAWL ESTÁNDAR'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="bg-nasa-blue/5 border border-nasa-blue/20 p-8 rounded-3xl group hover:bg-nasa-blue/10 transition-all cursor-crosshair">
                    <div className="flex justify-between items-center mb-4">
                        <DollarSign className="text-nasa-blue" size={24} />
                        <span className="text-xs text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded-full">+20.4%</span>
                    </div>
                    <div className="text-5xl font-black text-white tabular-nums">${revenue.toLocaleString()}</div>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Revenue Real-Time</p>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 p-8 rounded-3xl group hover:bg-purple-500/10 transition-all cursor-crosshair">
                    <div className="flex justify-between items-center mb-4">
                        <PieChart className="text-purple-500" size={24} />
                        <span className="text-xs text-purple-500 font-bold px-2 py-1 bg-purple-500/10 rounded-full">Secure Stack</span>
                    </div>
                    <div className="text-5xl font-black text-white tabular-nums">1,000,000+</div>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Listings Indexados</p>
                </div>

                <div className="bg-nasa-red/5 border border-nasa-red/20 p-8 rounded-3xl group hover:bg-nasa-red/10 transition-all cursor-crosshair">
                    <div className="flex justify-between items-center mb-4">
                        <Landmark className="text-nasa-red" size={24} />
                        <ArrowUpRight className="text-nasa-red" size={20} />
                    </div>
                    <div className="text-5xl font-black text-white tabular-nums">$ 15,240.85</div>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold uppercase tracking-widest">Impacto Social Global</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="text-white font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                    <Zap className="text-nasa-blue" size={14} /> Log de Seguridad & Colas (Sentinel X)
                </h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] border-b border-white/5 pb-2">
                        <span className="text-gray-400 font-mono">BFF_VALIDATION: ENABLED</span>
                        <span className="text-nasa-blue font-bold">MODE: ASYNC_QUEUE_PROCESSING</span>
                        <span className="text-green-500 animate-pulse">SENTINEL_X_GUARDING_WALLETS...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
