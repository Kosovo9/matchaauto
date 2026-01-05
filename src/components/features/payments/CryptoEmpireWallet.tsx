'use client';

import React, { useState } from 'react';
import { Bitcoin, Wallet, ArrowDownRight, Share2, ShieldQuestion, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CryptoEmpireWallet = () => {
    const [address, setAddress] = useState('8xMAut...NASA69');
    const [balance, setBalance] = useState('45.82');

    return (
        <div className="bg-gradient-to-br from-gray-900 to-emerald-900/20 border border-emerald-500/30 rounded-[2.5rem] p-8 shadow-3xl shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-500">
                        <Bitcoin size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Billetera de Comisiones</h2>
                        <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Multi-Chain Antigravity</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 text-[10px] font-bold uppercase">Balance SOL/BTC</p>
                    <p className="text-3xl font-black text-white">${balance} SOL</p>
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-8">
                <div className="flex justify-between items-center text-[10px] text-gray-400 mb-2">
                    <span className="uppercase font-bold tracking-widest">Dirección de Cobro (Solana)</span>
                    <span className="text-emerald-500">VERIFICADA</span>
                </div>
                <div className="flex items-center justify-between">
                    <code className="text-emerald-500 font-mono text-xs">{address}</code>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold border-white/10">Cambiar</Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Fee de Red</p>
                    <p className="text-white font-black">0.00005 SOL</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Velocidad</p>
                    <p className="text-emerald-500 font-black">ULTRA-FAST</p>
                </div>
            </div>

            <div className="space-y-4">
                <Button variant="nasa" className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 border-none shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                    RECOLECTAR COMISIONES A WALLET
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-12 border-white/10 text-white text-[10px] uppercase font-bold">
                        <Cpu size={14} className="mr-2" /> Mintear Vehicle NFT
                    </Button>
                    <Button variant="outline" className="flex-1 h-12 border-white/10 text-white text-[10px] uppercase font-bold">
                        <Share2 size={14} className="mr-2" /> Swapear BTC
                    </Button>
                </div>
            </div>
        </div>
    );
};
