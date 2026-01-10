"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Rocket, X, TrendingUp, Gift } from "lucide-react";

export default function RewardsWidget() {
    const [bal, setBal] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Demo mode mapping to backend
        fetch("/api/rewards/wallet?currency=MXN", {
            headers: { "x-user-id": "demo" }
        })
            .then(r => r.json())
            .then(d => {
                if (d.ok) setBal(d.balanceCents);
            })
            .catch(() => setBal(null));
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-10 right-10 z-[100] font-sans">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-white/20 hover:scale-110 active:scale-95 transition-all group"
                    >
                        <Gift className="text-black w-7 h-7 group-hover:animate-bounce" />
                    </motion.button>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="w-[350px] rounded-[2.5rem] border border-white/10 bg-black/80 backdrop-blur-3xl p-8 text-white shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-2 mb-8">
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                                <Rocket size={18} />
                            </div>
                            <div className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-500">
                                Trinity_BoostBack
                            </div>
                        </div>

                        <div className="mb-10">
                            <div className="text-4xl font-black text-white mb-2">
                                {bal === null ? "..." : `$${(bal / 100).toFixed(2)}`} <span className="text-sm font-bold text-white/30 uppercase tracking-widest">MXN</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <TrendingUp size={14} /> Launch_Bonus: +5% Credits
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 text-center">Referral_Link</div>
                                <div className="text-xs font-mono text-center text-amber-200 truncate">matcha.autos/r/ALPHA_MISSION</div>
                            </div>
                        </div>

                        <button className="w-full h-14 rounded-2xl bg-amber-500 text-black font-black uppercase text-xs tracking-widest hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                            Initialize_Redemption
                        </button>

                        <div className="mt-6 text-[9px] text-white/30 text-center leading-relaxed">
                            Tokens internally non-transferable. Level_1 referrals only. Auditable ledger entries in MXN/USD.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
