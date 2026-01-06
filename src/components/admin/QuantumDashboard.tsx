'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function QuantumDashboard() {
    const [metrics, setMetrics] = useState({
        responseTime: 187,
        transactionsPerMinute: 642,
        cacheHitRate: 98.2,
        activeUsers: 14502,
        kFactor: 1.8,
        errorRate: 0.12,
    });

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // SIMULACIÓN DE MÉTRICAS EN TIEMPO REAL
        const interval = setInterval(() => {
            const newData = {
                time: new Date().toLocaleTimeString(),
                responseTime: 150 + Math.random() * 50,
                transactions: 600 + Math.random() * 100,
            };
            setChartData(prev => [...prev.slice(-19), newData]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 bg-[#050505] text-white min-h-screen font-sans">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">⚡ QUANTUM COMMAND</h1>
                    <p className="text-gray-500 font-mono text-[10px] tracking-widest uppercase">System status: OPTIMAL • Region: US-EAST-1</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <span className="text-green-400 font-black text-xs">LIVE</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3">
                            {key.replace(/([A-Z])/g, ' $1')}
                        </div>
                        <div className="text-3xl font-black">
                            {typeof value === 'number' ? value.toFixed(key === 'errorRate' ? 2 : 1) : value.toLocaleString()}
                            {key === 'responseTime' && <span className="text-xs text-gray-500 ml-1">ms</span>}
                            {key === 'cacheHitRate' && <span className="text-xs text-gray-500 ml-1">%</span>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h2 className="text-xl font-bold mb-8 tracking-tight">📈 NEURAL LATENCY (MS)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="time" stroke="#444" fontSize={10} hide />
                                <YAxis stroke="#444" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="responseTime" stroke="#00ff88" fillOpacity={1} fill="url(#colorRes)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h2 className="text-xl font-bold mb-8 tracking-tight">🌀 GLOBAL TRANSACTIONS (TPM)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="time" stroke="#444" fontSize={10} hide />
                                <YAxis stroke="#444" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
                                <Line type="stepAfter" dataKey="transactions" stroke="#0066ff" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] col-span-2">
                    <h3 className="text-lg font-bold mb-4 tracking-tight uppercase text-gray-400">System Logs</h3>
                    <div className="space-y-3 font-mono text-[11px]">
                        {[
                            { time: '18:54:02', event: 'Quantum cache invalidated for region MX', status: 'WARN' },
                            { time: '18:53:45', event: 'Payment routed via MercadoPago (High Speed Path)', status: 'OK' },
                            { time: '18:53:20', event: 'Neural model v10.8 deployed to Edge Nodes', status: 'OK' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 border-b border-white/5 pb-2">
                                <span className="text-gray-600">{log.time}</span>
                                <span className={log.status === 'OK' ? 'text-green-500' : 'text-orange-500'}>[{log.status}]</span>
                                <span className="text-gray-300">{log.event}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <h3 className="text-lg font-bold mb-6 tracking-tight">K-FACTOR BOOST</h3>
                    <div className="flex flex-col items-center justify-center h-full pb-10">
                        <div className="text-6xl font-black text-white mb-2 tracking-tighter">1.82x</div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[82%]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
