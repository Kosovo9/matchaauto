"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ShieldAlert, KeyRound, Zap } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);

    const handleAdminLogin = async () => {
        setLoading(true);
        // Aquí conectamos con tu Auth Presidential
        await signIn('google', { callbackUrl: '/admin-portal/quantum-nexus' });
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[#0D0D0D] border border-white/10 rounded-[3rem] p-12 text-center shadow-[0_0_100px_rgba(57,255,20,0.1)]"
            >
                <div className="w-20 h-20 rounded-full bg-[#39FF14]/10 flex items-center justify-center mx-auto mb-8 border border-[#39FF14]/30">
                    <Lock className="w-10 h-10 text-[#39FF14]" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Admin Nexus</h1>
                <p className="text-gray-500 text-sm mb-12 font-mono">AUTHORIZED PERSONNEL ONLY - LVL 5 ACCESS</p>

                <div className="space-y-4">
                    <button
                        onClick={handleAdminLogin}
                        className="w-full py-4 rounded-2xl bg-white text-black font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        {loading ? "AUTHENTICATING..." : "SIGN IN WITH GOOGLE"}
                    </button>
                    <p className="text-[9px] text-gray-600 font-mono tracking-widest mt-8">IDENT-ID: SEC-MATCH-9727</p>
                </div>
            </motion.div>
        </div>
    );
}
