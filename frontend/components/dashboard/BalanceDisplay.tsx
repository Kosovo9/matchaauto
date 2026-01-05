'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, TrendingUp } from 'lucide-react';
import { Connection, PublicKey } from '@solana/web3.js';
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

interface BalanceDisplayProps {
    userId: string;
}

export function BalanceDisplay({ userId }: BalanceDisplayProps) {
    const [balance, setBalance] = useState<BalanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { toast } = useToast();

    const fetchBalance = async (forceRefresh = false) => {
        try {
            const traceId = `balance_${Date.now()}_${userId}`;
            const response = await fetch(`/api/wallet/balance?userId=${userId}&forceRefresh=${forceRefresh}`, {
                headers: {
                    'X-Trace-ID': traceId,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            setBalance(data.data);

            if (data.data.cacheHit && forceRefresh) {
                toast({
                    title: 'Balance Updated',
                    description: 'Latest balance fetched from blockchain',
                });
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch balance',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, [userId]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBalance(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Estimated USD value (simplified - in production use actual rate)
    const estimatedUSD = balance ? balance.sol * 100 : 0;

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                        <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {balance?.formatted || '0 SOL'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <TrendingUp className="h-3 w-3" />
                            {formatCurrency(estimatedUSD)}
                        </div>
                    </div>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Source</span>
                    <span className={`inline-flex items-center gap-1 ${balance?.cacheHit ? 'text-green-600' : 'text-blue-600'}`}>
                        {balance?.cacheHit ? (
                            <>
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                Edge Cache
                            </>
                        ) : (
                            <>
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                Live RPC
                            </>
                        )}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                    <span className="text-gray-900 dark:text-white">
                        {balance?.lastUpdated ? new Date(balance.lastUpdated).toLocaleTimeString() : 'Never'}
                    </span>
                </div>
            </div>

            {/* Animated background effect */}
            <motion.div
                className="absolute inset-0 -z-10 opacity-10"
                animate={{
                    background: [
                        'radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
                        'radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.2) 0%, transparent 50%)',
                    ],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
            />
        </div>
    );
}
