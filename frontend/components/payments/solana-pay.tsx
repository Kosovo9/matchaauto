"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { createTransferTransaction, connection } from '@/lib/solana-config';
import toast from 'react-hot-toast';

interface SolanaPayProps {
    amountInSol: number;
    itemTitle: string;
    onSuccess: (sig: string) => void;
}

export default function QuantumSolanaPay({ amountInSol, itemTitle, onSuccess }: SolanaPayProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [txSignature, setTxSignature] = useState<string | null>(null);

    const handleSolanaPay = async () => {
        if (!window.solana || !window.solana.isPhantom) {
            toast.error("Por favor instala la billetera Phantom para transacciones Solana.");
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Conectar Wallet
            const resp = await window.solana.connect();
            const userPubkey = new PublicKey(resp.publicKey.toString());

            // 2. Crear Transacción
            const transaction = await createTransferTransaction(userPubkey, amountInSol);

            // 3. Firmar y Enviar
            const { signature } = await window.solana.signAndSendTransaction(transaction);

            // 4. Confirmar en el Borde
            await connection.confirmTransaction(signature, 'confirmed');

            setTxSignature(signature);
            toast.success("¡Transacción SOL Confirmada!");
            onSuccess(signature);
        } catch (error: any) {
            console.error("Solana Pay Error:", error);
            toast.error("La transacción falló o fue cancelada.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-[#0A0A0A] border border-[#39FF14]/20 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(57,255,20,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-12 h-12 text-[#39FF14]" />
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#39FF14]/10 flex items-center justify-center border border-[#39FF14]/30">
                    <Wallet className="w-6 h-6 text-[#39FF14]" />
                </div>
                <div>
                    <h3 className="text-white font-black uppercase text-xs tracking-widest">Pago con Solana</h3>
                    <p className="text-gray-500 text-[10px] font-mono">Infraestructura Web3 Alpha</p>
                </div>
            </div>

            <div className="mb-10 text-center">
                <p className="text-gray-500 text-sm mb-1 uppercase font-bold tracking-tighter">Total a Pagar</p>
                <div className="flex justify-center items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{amountInSol}</span>
                    <span className="text-xl font-black text-[#39FF14]">SOL</span>
                </div>
                <p className="text-gray-600 text-[10px] mt-2 font-mono uppercase tracking-widest">{itemTitle}</p>
            </div>

            <button
                onClick={handleSolanaPay}
                disabled={isProcessing || !!txSignature}
                className={`w-full py-5 rounded-2xl font-black tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${txSignature
                        ? "bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/50"
                        : "bg-[#39FF14] text-black hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                    }`}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> PROCESANDO EN EL EDGE...
                    </>
                ) : txSignature ? (
                    <>
                        <CheckCircle className="w-4 h-4" /> PAGO CONFIRMADO
                    </>
                ) : (
                    <>
                        <Zap className="w-4 h-4" /> PAGAR AHORA CON PHANTOM
                    </>
                )}
            </button>

            {txSignature && (
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-[8px] text-gray-500 font-mono mb-1 uppercase tracking-widest text-center">Firma de Transacción</p>
                    <p className="text-[8px] text-white font-mono break-all text-center opacity-50">{txSignature}</p>
                </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-[8px] font-black tracking-widest uppercase">Secured by Solana Mainnet-Beta</span>
            </div>
        </div>
    );
}

// Declaración global para Phantom
declare global {
    interface Window {
        solana: any;
    }
}
