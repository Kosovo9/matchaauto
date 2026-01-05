'use client';

import React from 'react';
import { CreditCard, ShieldCheck, HeartPulse, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const EmpireInsurance = () => {
    return (
        <div className="bg-gradient-to-br from-indigo-900/20 to-black border border-indigo-500/30 rounded-[2rem] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                    <HeartPulse size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter">EMPIRE INSURANCE</h3>
                    <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Protección Instantánea Post-Venta</p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-indigo-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500" size={18} />
                        <span className="text-sm text-gray-300 font-bold uppercase">Seguro Todo Riesgo Crypto</span>
                    </div>
                    <span className="text-indigo-400 font-black text-sm">0.2 SOL/m</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-indigo-500/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="text-orange-500" size={18} />
                        <span className="text-sm text-gray-300 font-bold uppercase">Garantía Mecánica NFT</span>
                    </div>
                    <span className="text-indigo-400 font-black text-sm">INCLUIDO</span>
                </div>
            </div>

            <Button variant="nasa" className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 border-none shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                ACTIVAR PROTECCIÓN IMPERIAL
            </Button>
        </div>
    );
};
