'use client';

import React from 'react';
import { DollarSign, Link as LinkIcon, Users, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AffiliateDashboard: React.FC = () => {
    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tighter">Panel de Afiliados</h2>
                    <p className="text-gray-400">Gana el 10% por cada usuario que traigas a la plataforma.</p>
                </div>
                <Button variant="nasa" className="h-12 px-8">
                    <LinkIcon className="mr-2" size={18} />
                    Generar Link Único
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign className="text-nasa-blue" size={24} />
                        <span className="text-xs text-green-500 font-bold">+24%</span>
                    </div>
                    <div className="text-3xl font-black text-white">$ 1,240.00</div>
                    <p className="text-gray-500 text-xs mt-1">Comisiones Pendientes</p>
                </div>

                <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <Users className="text-purple-500" size={24} />
                        <span className="text-xs text-purple-500 font-bold">89</span>
                    </div>
                    <div className="text-3xl font-black text-white">452</div>
                    <p className="text-gray-500 text-xs mt-1">Referidos Registrados</p>
                </div>

                <div className="bg-black/40 border border-gray-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <ArrowUpRight className="text-orange-500" size={24} />
                        <span className="text-xs text-orange-500 font-bold">12.5%</span>
                    </div>
                    <div className="text-3xl font-black text-white">0.089</div>
                    <p className="text-gray-500 text-xs mt-1">Tasa de Conversión</p>
                </div>
            </div>
        </div>
    );
};
