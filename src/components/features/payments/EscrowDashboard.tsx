'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const EscrowDashboard = () => {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-nasa-blue/10 border border-nasa-blue/30 rounded-[2rem] p-8 shadow-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Bóveda Escrow 1000x</h2>
                    <p className="text-nasa-blue text-xs font-bold uppercase tracking-widest">Protección de Transacciones Total</p>
                </div>
                <div className="p-4 bg-nasa-blue/20 rounded-2xl">
                    <ShieldCheck className="text-nasa-blue" size={32} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-black/60 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                        <Lock size={14} /> FONDOS EN BÓVEDA
                    </div>
                    <div className="text-4xl font-black text-white tracking-widest">$ 45,600.00</div>
                    <p className="text-[10px] text-green-500 mt-2 font-bold uppercase">Respaldado por Sentinel X</p>
                </div>

                <div className="bg-black/60 p-6 rounded-2xl border border-white/5 opacity-50">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                        <Unlock size={14} /> POR LIBERAR
                    </div>
                    <div className="text-4xl font-black text-white tracking-widest">$ 12,000.00</div>
                    <p className="text-[10px] text-orange-500 mt-2 font-bold uppercase">Esperando Verificación VIN</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-nasa-red/20 rounded-full flex items-center justify-center text-nasa-red">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Transferencia a Match-Wallet</p>
                            <p className="text-[10px] text-gray-500">Instantánea y sin comisiones</p>
                        </div>
                    </div>
                    <ArrowRight className="text-gray-600 group-hover:text-white transition-colors" size={20} />
                </div>
            </div>

            <div className="mt-8">
                <Button variant="nasa" className="w-full h-14 text-lg font-black italic">
                    ACTIVAR DEPÓSITO DE GARANTÍA
                </Button>
            </div>
        </div>
    );
};
