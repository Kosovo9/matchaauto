"use client";

import React, { useState } from 'react';
import QuantumSolanaPay from '@/components/payments/solana-pay';
import { ShieldCheck, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SolanaCheckoutPage() {
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-8 font-sans">
            {/* BACKGROUND EFFECTS */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#39FF14] opacity-[0.05] blur-[150px] rounded-full animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600 opacity-[0.05] blur-[150px] rounded-full animate-pulse-slow" />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black tracking-widest uppercase mb-6">
                            <ArrowLeft className="w-4 h-4" /> Volver al Imperio
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Checkout <span className="text-[#39FF14]">Web3</span></h1>
                        <p className="text-gray-500 text-sm font-medium">Transacciones globales instantáneas con Solana Core.</p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-[#39FF14]" />
                        </div>
                    </div>
                </header>

                {status === 'SUCCESS' ? (
                    <div className="bg-[#0D0D0D] border border-[#39FF14]/30 p-12 rounded-[3rem] text-center shadow-[0_0_80px_rgba(57,255,20,0.1)]">
                        <div className="w-20 h-20 rounded-full bg-[#39FF14]/10 flex items-center justify-center mx-auto mb-8 border border-[#39FF14]/50">
                            <Zap className="w-10 h-10 text-[#39FF14]" />
                        </div>
                        <h2 className="text-3xl font-black mb-4 uppercase">¡Pago Exitoso!</h2>
                        <p className="text-gray-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                            Tu transacción ha sido verificada en la blockchain. Tu vehículo o servicio está siendo procesado por el orquestador.
                        </p>
                        <Link href="/dashboard" className="inline-block px-10 py-5 bg-[#39FF14] text-black font-black rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all">
                            IR A MIS COMPRAS
                        </Link>
                    </div>
                ) : (
                    <QuantumSolanaPay
                        amountInSol={0.5}
                        itemTitle="Suscripción Premium MatchAuto"
                        onSuccess={() => setStatus('SUCCESS')}
                    />
                )}

                <footer className="mt-12 text-center text-[10px] text-gray-700 font-mono uppercase tracking-[0.3em]">
                    SECURED BY QUANTUM PAYMENTS 1.0.0
                </footer>
            </div>
        </div>
    );
}
