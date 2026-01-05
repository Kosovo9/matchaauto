"use client";

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ShoppingCart, Zap, DollarSign } from 'lucide-react';

export const usePushNotifications = () => {
    const notifySale = (amount: number, item: string) => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0D0D0D] border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.2)] rounded-[2rem] pointer-events-auto flex items-center p-6 gap-6`}>
                <div className="w-14 h-14 rounded-2xl bg-[#39FF14]/10 flex items-center justify-center">
                    <ShoppingCart className="w-7 h-7 text-[#39FF14]" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-mono text-[#39FF14] tracking-widest uppercase mb-1">VENTA CONFIRMADA</p>
                    <p className="text-white text-sm font-bold">¡Has vendido un {item}!</p>
                    <p className="text-gray-500 text-xs">Ingreso: <span className="text-white font-black">${amount.toLocaleString()} MXN</span></p>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-gray-600 hover:text-white transition-colors uppercase text-[9px] font-black">Cerrar</button>
            </div>
        ), { duration: 5000 });
    };

    return { notifySale };
};
