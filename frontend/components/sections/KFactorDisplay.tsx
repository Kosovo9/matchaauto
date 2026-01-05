'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, Share2, Target, ArrowUpRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface KFactorData {
    kFactor: string;
    viralCoefficient: string;
    metrics: {
        invitesSent: number;
        invitesAccepted: number;
        shares: number;
        conversions: number;
        acceptanceRate: string;
        conversionRate: string;
        retentionRate: string;
    };
    interpretation: {
        level: string;
        message: string;
        color: string;
        emoji: string;
    };
}

export function KFactorDisplay({ data }: { data: KFactorData }) {
    const [animatedKFactor, setAnimatedKFactor] = useState(0);
    const [showSparkles, setShowSparkles] = useState(false);

    useEffect(() => {
        const targetKFactor = parseFloat(data.kFactor);
        const duration = 2000;
        const steps = 60;
        const increment = targetKFactor / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            setAnimatedKFactor(parseFloat(current.toFixed(2)));

            if (step >= steps) {
                clearInterval(timer);
                setAnimatedKFactor(targetKFactor);
                setShowSparkles(true);
                setTimeout(() => setShowSparkles(false), 1000);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [data.kFactor]);

    const getKFactorColor = (kFactor: number) => {
        if (kFactor > 1) return 'text-green-600';
        if (kFactor > 0.5) return 'text-blue-600';
        if (kFactor > 0.1) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getKFactorLevel = (kFactor: number) => {
        if (kFactor > 1) return 'Exponential Growth';
        if (kFactor > 0.5) return 'Viral Growth';
        if (kFactor > 0.1) return 'Organic Growth';
        return 'Early Stage';
    };

    return (
        <div className="relative">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main K-Factor Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-2"
                >
                    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                        <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                                            <TrendingUp className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                K-Factor Engine
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Real-time viral coefficient
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-6xl font-bold ${getKFactorColor(animatedKFactor)}`}>
                                                {animatedKFactor.toFixed(2)}
                                                <span className="text-4xl">x</span>
                                            </span>
                                            <AnimatePresence>
                                                {showSparkles && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        className="relative"
                                                    >
                                                        <Sparkles className="h-8 w-8 text-yellow-500" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                                                <ArrowUpRight className="h-4 w-4" />
                                                {getKFactorLevel(animatedKFactor)}
                                            </span>
                                        </div>
                                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                                            {data.interpretation.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Viral Metrics */}
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-blue-500/20">
                                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Invites</div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {data.metrics.invitesSent.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {data.metrics.acceptanceRate}% acceptance
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-purple-500/20">
                                                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Shares</div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {data.metrics.shares.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            Viral content spread
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-green-500/20">
                                                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Conversions</div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {data.metrics.conversions.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {data.metrics.conversionRate}% rate
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-lg bg-amber-500/20">
                                                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Retention</div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {data.metrics.retentionRate}%
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            User stickiness
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Growth Progress Bar */}
                            <div className="mt-8">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <span>Growth Level</span>
                                    <span>{getKFactorLevel(animatedKFactor)}</span>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${Math.min(animatedKFactor * 50, 100)}%` }}
                                        transition={{ duration: 2 }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-gray-500">
                                    <span>Early Stage</span>
                                    <span>Organic</span>
                                    <span>Viral</span>
                                    <span>Exponential</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Viral Coefficient Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-lg border border-blue-200/30 dark:border-blue-700/30">
                        <CardContent className="p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Viral Coefficient
                            </h4>
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                {parseFloat(data.viralCoefficient).toFixed(3)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Measures how many new users each existing user brings
                            </p>
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Network Effect</span>
                                    <span className="font-semibold text-green-600">
                                        {parseFloat(data.viralCoefficient) > 0.5 ? 'Strong' : 'Developing'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Growth Prediction Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 backdrop-blur-lg border border-purple-200/30 dark:border-purple-700/30">
                        <CardContent className="p-6">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                30-Day Projection
                            </h4>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {Math.round(data.metrics.invitesSent * Math.pow(parseFloat(data.kFactor), 30)).toLocaleString()}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Projected total users in 30 days at current growth rate
                            </p>
                            <div className="mt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Daily Growth</span>
                                    <span className="font-semibold text-green-600">
                                        +{Math.round((parseFloat(data.kFactor) - 1) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
