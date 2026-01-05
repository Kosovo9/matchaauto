'use client';

import React from 'react';
import { Heart, PawPrint, TrendingUp, Users } from 'lucide-react';

export const ImpactTracker: React.FC = () => {
    // Simulación de impacto social (3% de ganancias)
    const totalDonated = 12450.75;
    const animalsHelped = 452;

    return (
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-emerald-800/30 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
                <Heart className="text-emerald-500 fill-emerald-500" size={32} />
                <h2 className="text-3xl font-bold text-white tracking-tighter">Impacto Social Match-Auto</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Donaciones Acumuladas</p>
                    <div className="text-4xl font-black text-white">$ {totalDonated.toLocaleString()} USD</div>
                    <p className="text-gray-400 text-xs">Proveniente del 3% de cada transacción exitosa.</p>
                </div>

                <div className="space-y-2">
                    <p className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Animales Rescatados</p>
                    <div className="flex items-center gap-3">
                        <div className="text-4xl font-black text-white">{animalsHelped}</div>
                        <PawPrint className="text-emerald-500" size={28} />
                    </div>
                    <p className="text-gray-400 text-xs">Colaboramos con 15 refugios a nivel global.</p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-800/20 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] text-emerald-500 font-bold uppercase">
                    <TrendingUp size={12} /> +12% este mes
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] text-emerald-500 font-bold uppercase">
                    <Users size={12} /> 1.2k Donantes
                </div>
            </div>
        </div>
    );
};
