'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, RefreshCw, TrendingUp, Zap, Radio, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

interface BalanceData {
    sol: number;
    lamports: number;
    formatted: string;
    lastUpdated: Date;
    source: 'cache' | 'rpc';
    cacheHit: boolean;
}

export function BalanceDisplay({ userId }: { userId: string }) {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const fetchBalance = async (forceRefresh = false) => {
        try {
            const response = await fetch(`/api/wallet/balance?userId=${userId}&forceRefresh=${forceRefresh}`);
            if (!response.ok) throw new Error('API Sync Error');
            const data = await response.json();
            setBalance(data.data);
        } catch (error) {
            toast({ title: 'Critical Error', description: 'Blockchain Sync Interrupted', variant: 'destructive' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchBalance(); }, [userId]);

    if (loading) return <div className="animate-pulse h-24 w-full bg-white/5 rounded-2xl" />;

    return (
        <div className="relative overflow-hidden glass-panel rounded-3xl p-6 group">
            {/* Background Pulse */}
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                <Zap className="h-24 w-24 text-cyan-400 rotate-12" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                        <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Mainnet Live</span>
                    </div>
                    <motion.button
                        whileTap={{ rotate: 180 }}
                        onClick={() => { setRefreshing(true); fetchBalance(true); }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>

                <div className="space-y-1">
                    <div className="text-gray-500 text-xs font-mono">AVAILABLE_SOLANA</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white glow-text tracking-tighter">
                            {balance?.sol.toFixed(3) || '0.000'}
                        </span>
                        <span className="text-xl font-bold text-cyan-500">SOL</span>
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
                        ≈ ${(balance?.sol ? balance.sol * 110 : 0).toLocaleString()} USD
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Database className="h-3 w-3" />
                            DATALAYER
                        </div>
                        <div className={`text-xs font-bold ${balance?.cacheHit ? 'text-green-400' : 'text-blue-400'}`}>
                            {balance?.cacheHit ? 'EDGE_CACHED' : 'BLOCKCHAIN_DIRECT'}
                        </div>
                    </div>
                    <div className="space-y-1 text-right">
                        <div className="text-[10px] text-gray-500 uppercase tracking-tight">Sync Interval</div>
                        <div className="text-xs font-bold text-white">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative scanning line */}
            <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan" style={{ animationDelay: '1s' }} />
        </div>
    );
}
