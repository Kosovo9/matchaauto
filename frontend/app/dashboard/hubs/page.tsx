'use client';

import { useState, useEffect } from 'react';
import { Box, Share2, Zap, Shield, Search, Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export default function HubsPage() {
    const [hubs, setHubs] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHubs();
    }, []);

    const fetchHubs = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/hubs`);
            setHubs(res.data.data);
        } catch (error) {
            console.error('Fetch Hubs Error', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase">
                        <Box className="w-3 h-3" />
                        Community Hubs (KING Mdl)
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Nexus <span className="text-blue-500">Hubs</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
                        Local exchange nodes for high-resilience community coordination.
                        No social noise. Just real utility and organic viral growth.
                    </p>
                </div>

                <div className="flex gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search hubs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none w-64 transition-all"
                        />
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                        <Plus className="w-4 h-4" /> Create Hub
                    </button>
                </div>
            </div>

            {/* Hubs Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hubs.filter(h => h.name.toLowerCase().includes(search.toLowerCase())).map((hub) => (
                        <div key={hub.id} className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                            <div className="absolute top-4 right-4">
                                <div className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                                    {hub.language}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{hub.name}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">{hub.purpose}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50 text-center">
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Members</div>
                                        <div className="text-lg font-mono text-white">{hub.memberCount}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Exchanges</div>
                                        <div className="text-lg font-mono text-blue-400">{hub.completedExchanges}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        <span className="text-xs text-slate-500">Organic Growth Tier: I</span>
                                    </div>
                                    <button className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-sm font-bold group/btn">
                                        Enter Hub <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {hubs.length === 0 && (
                        <div className="col-span-full py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                <Box className="w-8 h-8 text-slate-600" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white">No Hubs Detected in Area</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Organic viralizer ready. Create the first HUB in your region to start seeding the network.
                                </p>
                            </div>
                            <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all">
                                Deploy Root Hub
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
