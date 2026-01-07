'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Wifi, Cpu } from 'lucide-react';

export function NexusShield() {
    const [latency, setLatency] = useState<number>(0);
    const [status, setStatus] = useState<'nominal' | 'degraded' | 'critical'>('nominal');

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulated real-time infrastructure probe
            const mockLatency = Math.floor(Math.random() * 40) + 12; // 12-52ms
            setLatency(mockLatency);
            setStatus(mockLatency > 100 ? 'critical' : mockLatency > 70 ? 'degraded' : 'nominal');
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-xl space-y-4 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${status === 'nominal' ? 'text-blue-400' : 'text-yellow-400'}`} />
                    <span className="text-xs font-bold text-slate-300 tracking-tighter uppercase">Nexus Guard</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${status === 'nominal' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                    {status.toUpperCase()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                    <Activity className="w-3 h-3 text-slate-500 mb-1" />
                    <span className="text-[10px] text-slate-500">LATENCY</span>
                    <span className="text-sm font-mono text-white font-bold">{latency}ms</span>
                </div>
                <div className="bg-black/20 p-2 rounded-lg border border-slate-800/50 flex flex-col items-center">
                    <Wifi className="w-3 h-3 text-slate-500 mb-1" />
                    <span className="text-[10px] text-slate-500">UPLINK</span>
                    <span className="text-sm font-mono text-white font-bold">1.2 Gbps</span>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>GRID LOAD</span>
                    <span>24%</span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 shadow-[0_0_8px_#3b82f6] w-[24%]" />
                </div>
            </div>

            <button className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 transition-all uppercase tracking-widest">
                Infrastructure Audit
            </button>
        </div>
    );
}
